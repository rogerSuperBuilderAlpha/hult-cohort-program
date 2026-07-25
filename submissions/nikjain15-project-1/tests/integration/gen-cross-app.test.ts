/**
 * CROSS-APP SEAM — extended adversarial regression (companion to cross-app-regression.test.ts).
 *
 * More attack surface on the bus: three-way isolation, claim ordering/fairness, lifecycle edge
 * cases, malformed input tolerance, memory ordering + provenance across apps, and erasure scoping.
 * Emulator only, synthetic zz-test-* handles torn down each run — never prod, never the prod bus.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { busDb } from '@/lib/broker-admin';
import {
  claimTasks,
  completeTask,
  dispatchTask,
  forgetShared,
  logSharedActivity,
  readSharedActivity,
  readSharedMemory,
  rememberShared,
} from '@/lib/shared-context';
import { clearFirestore } from './helpers';
import type { Firestore } from 'firebase-admin/firestore';

let db: Firestore;
const A = 'zz-test-alice';
const B = 'zz-test-bob';
const C = 'zz-test-carol';

beforeEach(async () => {
  const got = busDb();
  if (!got) throw new Error('bus db unavailable');
  db = got;
  await clearFirestore();
});
afterEach(async () => {
  await clearFirestore();
});

describe('claim fairness + ordering', () => {
  it('claims the OLDEST pending task first (no starvation by arrival order)', async () => {
    await dispatchTask(db, { toApp: 'pulse', handle: A, intent: 'first' }, 1000);
    await dispatchTask(db, { toApp: 'pulse', handle: A, intent: 'second' }, 2000);
    await dispatchTask(db, { toApp: 'pulse', handle: A, intent: 'third' }, 3000);
    const [one] = await claimTasks(db, 'pulse', A, 1);
    expect(one.intent).toBe('first');
  });

  it('respects the claim limit and leaves the rest pending', async () => {
    for (let i = 0; i < 5; i++) await dispatchTask(db, { toApp: 'pulse', handle: A, intent: `t${i}` }, 1000 + i);
    const claimed = await claimTasks(db, 'pulse', A, 2);
    expect(claimed).toHaveLength(2);
    const rest = await claimTasks(db, 'pulse', A, 10);
    expect(rest).toHaveLength(3);
  });

  it('a mix of handles: each handle only ever claims its own, oldest-first', async () => {
    await dispatchTask(db, { toApp: 'pulse', handle: A, intent: 'a1' }, 1000);
    await dispatchTask(db, { toApp: 'pulse', handle: B, intent: 'b1' }, 1001);
    await dispatchTask(db, { toApp: 'pulse', handle: A, intent: 'a2' }, 1002);
    const forA = await claimTasks(db, 'pulse', A, 10);
    expect(forA.map((t) => t.intent)).toEqual(['a1', 'a2']);
    const forB = await claimTasks(db, 'pulse', B, 10);
    expect(forB.map((t) => t.intent)).toEqual(['b1']);
  });
});

describe('lifecycle edge cases', () => {
  it('completing a non-existent task id is a silent no-op (no throw)', async () => {
    await expect(completeTask(db, 'zz-test-missing', true, 'x')).resolves.toBeUndefined();
  });

  it('a failed task is terminal — cannot be re-opened by another completeTask', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: A, intent: 'x' }, 1);
    await claimTasks(db, 'pulse', A);
    await completeTask(db, id!, false, 'failed once');
    await completeTask(db, id!, true, 'try to revive');
    const snap = await db.collection('agentTasks').doc(id!).get();
    expect(snap.data()?.status).toBe('failed');
    expect(snap.data()?.result).toBe('failed once');
  });

  it('claimTasks with no handle claims across all handles for the app', async () => {
    await dispatchTask(db, { toApp: 'pulse', handle: A, intent: 'a' }, 1);
    await dispatchTask(db, { toApp: 'pulse', handle: B, intent: 'b' }, 2);
    const claimed = await claimTasks(db, 'pulse', null, 10);
    expect(claimed).toHaveLength(2);
  });

  it('result is bounded to 500 chars', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: A, intent: 'x' }, 1);
    await claimTasks(db, 'pulse', A);
    await completeTask(db, id!, true, 'y'.repeat(1000));
    const snap = await db.collection('agentTasks').doc(id!).get();
    expect((snap.data()?.result as string).length).toBeLessThanOrEqual(500);
  });
});

describe('addressing + malformed input tolerance', () => {
  it('a task for Rally is never claimed by Pulse and vice-versa', async () => {
    await dispatchTask(db, { toApp: 'rally', handle: A, intent: 'for-rally' }, 1);
    await dispatchTask(db, { toApp: 'pulse', handle: A, intent: 'for-pulse' }, 2);
    expect((await claimTasks(db, 'pulse', A)).map((t) => t.intent)).toEqual(['for-pulse']);
    expect((await claimTasks(db, 'rally', A)).map((t) => t.intent)).toEqual(['for-rally']);
  });

  it('handle is normalized on dispatch so a mixed-case caller still claims it', async () => {
    await dispatchTask(db, { toApp: 'pulse', handle: 'ZZ-Test-Alice', intent: 'x' }, 1);
    expect(await claimTasks(db, 'pulse', 'zz-test-alice')).toHaveLength(1);
  });

  it('an empty intent still creates a claimable task (validation is the route’s job, not the bus)', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: A, intent: '' }, 1);
    expect(id).toBeTruthy();
  });
});

describe('shared memory ordering, provenance, isolation (three writers)', () => {
  it('returns notes oldest→newest and tags each with the writing app', async () => {
    await rememberShared(db, A, 'older', 1000);
    await rememberShared(db, A, 'newer', 2000);
    const notes = await readSharedMemory(db, A);
    expect(notes.map((n) => n.text)).toEqual(['older', 'newer']);
    expect(notes.every((n) => n.app === 'pulse')).toBe(true);
  });

  it('three handles never bleed into each other (memory + activity)', async () => {
    await rememberShared(db, A, 'a-note', 1);
    await rememberShared(db, B, 'b-note', 2);
    await logSharedActivity(db, C, 'pulse', 'c-activity', 3);
    expect((await readSharedMemory(db, A)).map((n) => n.text)).toEqual(['a-note']);
    expect((await readSharedMemory(db, B)).map((n) => n.text)).toEqual(['b-note']);
    expect((await readSharedActivity(db, A))).toEqual([]);
    expect((await readSharedActivity(db, C)).map((x) => x.summary)).toEqual(['c-activity']);
  });

  it('a whitespace-only note is refused (no empty rows on the bus)', async () => {
    expect(await rememberShared(db, A, '   ', 1)).toBe(false);
    expect(await readSharedMemory(db, A)).toEqual([]);
  });

  it('activity summary is bounded (data minimization)', async () => {
    await logSharedActivity(db, A, 'pulse', 'z'.repeat(1000), 1);
    const [act] = await readSharedActivity(db, A);
    expect(act.summary.length).toBeLessThanOrEqual(280);
  });
});

describe('erasure scoping', () => {
  it('forgetShared erases only the target handle across memory, activity, and tasks', async () => {
    await rememberShared(db, A, 'a', 1);
    await logSharedActivity(db, A, 'pulse', 'a-act', 2);
    await dispatchTask(db, { toApp: 'rally', handle: A, intent: 'a-task' }, 3);
    await rememberShared(db, B, 'b', 4);
    await dispatchTask(db, { toApp: 'pulse', handle: B, intent: 'b-task' }, 5);

    await forgetShared(db, A);

    expect(await readSharedMemory(db, A)).toEqual([]);
    expect(await readSharedActivity(db, A)).toEqual([]);
    expect((await db.collection('agentTasks').where('handle', '==', A).get()).size).toBe(0);
    // B is fully intact.
    expect((await readSharedMemory(db, B)).map((n) => n.text)).toEqual(['b']);
    expect((await db.collection('agentTasks').where('handle', '==', B).get()).size).toBe(1);
  });

  it('forgetShared on a handle with nothing is a harmless no-op returning 0', async () => {
    expect(await forgetShared(db, 'zz-test-nobody')).toBe(0);
  });

  it('forgetShared refuses an empty handle', async () => {
    expect(await forgetShared(db, '')).toBe(0);
  });
});
