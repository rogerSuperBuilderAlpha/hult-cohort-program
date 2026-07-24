/**
 * Cross-app regression suite — the Rally <-> Pulse seam over the shared-context bus.
 *
 * Every cohort app implements the same admin read/write against the same bus paths, so the seam
 * has to hold under contention: a dispatched task is claimed exactly once, illegal lifecycle
 * transitions are no-ops, memory/activity are handle-keyed and isolated, and erasure sweeps a
 * person's whole footprint (memory + activity + agentTasks) and ONLY that person's.
 *
 * Mirrors tests/integration/shared-context.test.ts: busDb() (falls back to adminDb() against the
 * emulator), clearFirestore around each test, synthetic zz-test-* handles only.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { busDb } from '@/lib/admin';
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
import { contextKey } from '@cohort/core/shared-context';
import { clearFirestore } from './helpers';
import type { Firestore } from 'firebase-admin/firestore';

let db: Firestore;

beforeEach(async () => {
  const got = busDb();
  if (!got) throw new Error('bus db unavailable');
  db = got;
  await clearFirestore();
});
afterEach(async () => {
  await clearFirestore();
});

const H = 'zz-test-alice';
const H2 = 'zz-test-bob';

async function taskStatus(id: string): Promise<string | undefined> {
  const snap = await db.collection('agentTasks').doc(id).get();
  return snap.data()?.status as string | undefined;
}

describe('cross-app dispatch lifecycle — Rally <-> Pulse hand-off', () => {
  it('dispatchTask creates a pending task and returns its id', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'summarize_week' }, 1000);
    expect(id).toBeTruthy();
    const snap = await db.collection('agentTasks').doc(id!).get();
    expect(snap.data()).toMatchObject({
      fromApp: 'rally',
      toApp: 'pulse',
      handle: contextKey(H),
      intent: 'summarize_week',
      status: 'pending',
      result: null,
    });
  });

  it('the new task records fromApp=rally as provenance', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'catch_up' }, 5);
    expect((await db.collection('agentTasks').doc(id!).get()).data()?.fromApp).toBe('rally');
  });

  it('a dispatched payload round-trips onto the task', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'x', payload: { n: 3 } }, 1);
    expect((await db.collection('agentTasks').doc(id!).get()).data()?.payload).toEqual({ n: 3 });
  });

  it('an omitted payload defaults to an empty object', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'x' }, 1);
    expect((await db.collection('agentTasks').doc(id!).get()).data()?.payload).toEqual({});
  });

  it('claimTasks flips the pending task to claimed exactly once', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'catch_up' }, 1);
    const claimed = await claimTasks(db, 'pulse');
    expect(claimed).toHaveLength(1);
    expect(claimed[0].id).toBe(id);
    expect(claimed[0].status).toBe('claimed');
    expect(await taskStatus(id!)).toBe('claimed');
  });

  it('a second claim of an already-claimed queue returns nothing', async () => {
    await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'catch_up' }, 1);
    expect(await claimTasks(db, 'pulse')).toHaveLength(1);
    expect(await claimTasks(db, 'pulse')).toHaveLength(0);
  });

  it('completeTask marks a claimed task done via a legal transition', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'catch_up' }, 1);
    await claimTasks(db, 'pulse');
    await completeTask(db, id!, true, 'done: 2 things need you');
    expect(await taskStatus(id!)).toBe('done');
    const snap = await db.collection('agentTasks').doc(id!).get();
    expect(snap.data()?.result).toContain('2 things');
  });

  it('completeTask marks a claimed task failed via a legal transition', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'catch_up' }, 1);
    await claimTasks(db, 'pulse');
    await completeTask(db, id!, false, 'model unavailable');
    expect(await taskStatus(id!)).toBe('failed');
  });

  it('completing a still-pending task with ok=true is a no-op (pending cannot go straight to done)', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'catch_up' }, 1);
    await completeTask(db, id!, true, 'jumped the gun');
    expect(await taskStatus(id!)).toBe('pending');
  });

  it('failing a still-pending task IS legal (pending -> failed)', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'catch_up' }, 1);
    await completeTask(db, id!, false, 'rejected before claim');
    expect(await taskStatus(id!)).toBe('failed');
  });

  it('a done task cannot be re-transitioned (done is terminal)', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'catch_up' }, 1);
    await claimTasks(db, 'pulse');
    await completeTask(db, id!, true, 'first result');
    await completeTask(db, id!, false, 'second result');
    expect(await taskStatus(id!)).toBe('done');
    expect((await db.collection('agentTasks').doc(id!).get()).data()?.result).toContain('first');
  });

  it('a failed task cannot be re-transitioned (failed is terminal)', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'catch_up' }, 1);
    await claimTasks(db, 'pulse');
    await completeTask(db, id!, false, 'gave up');
    await completeTask(db, id!, true, 'actually worked');
    expect(await taskStatus(id!)).toBe('failed');
  });

  it('concurrent double-claim yields the task claimed exactly once', async () => {
    await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'catch_up' }, 1);
    const [a, b] = await Promise.all([claimTasks(db, 'pulse'), claimTasks(db, 'pulse')]);
    expect(a.length + b.length).toBe(1);
  });

  it('concurrent claim over many tasks claims each exactly once (no double-work)', async () => {
    for (let i = 0; i < 6; i++) {
      await dispatchTask(db, { toApp: 'pulse', handle: H, intent: `job${i}` }, 100 + i);
    }
    const [a, b] = await Promise.all([claimTasks(db, 'pulse'), claimTasks(db, 'pulse')]);
    const ids = [...a, ...b].map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length); // no id claimed twice
    // Every pending task ended up claimed.
    const stillPending = await db.collection('agentTasks').where('status', '==', 'pending').get();
    expect(stillPending.empty).toBe(true);
  });

  it('a task addressed to another app is never claimed by this one', async () => {
    await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'summarize_week' }, 1);
    expect(await claimTasks(db, 'rally')).toHaveLength(0);
    // Still pending, waiting for its real audience.
    const t = await db.collection('agentTasks').where('toApp', '==', 'pulse').get();
    expect(t.docs[0].data().status).toBe('pending');
  });

  it('a task for another handle is never claimed when claiming for a specific handle', async () => {
    await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'catch_up' }, 1);
    expect(await claimTasks(db, 'pulse', H2)).toHaveLength(0);
    // The right handle still gets it.
    expect(await claimTasks(db, 'pulse', H)).toHaveLength(1);
  });

  it('claiming for a handle is case-insensitive (matches the normalized key)', async () => {
    await dispatchTask(db, { toApp: 'pulse', handle: 'zz-test-Mixed', intent: 'catch_up' }, 1);
    const claimed = await claimTasks(db, 'pulse', 'ZZ-TEST-mixed');
    expect(claimed).toHaveLength(1);
  });

  it('two dispatches of the same intent create INDEPENDENT tasks (no dedupe)', async () => {
    const a = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'catch_up' }, 1);
    const b = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'catch_up' }, 2);
    expect(a).not.toBe(b);
    const claimed = await claimTasks(db, 'pulse');
    expect(claimed).toHaveLength(2);
  });

  it('a malformed (empty) handle is rejected — no task is created', async () => {
    expect(await dispatchTask(db, { toApp: 'pulse', handle: '', intent: 'catch_up' }, 1)).toBeNull();
    const all = await db.collection('agentTasks').get();
    expect(all.empty).toBe(true);
  });

  it('a whitespace-only handle is rejected — no task is created', async () => {
    expect(await dispatchTask(db, { toApp: 'pulse', handle: '   ', intent: 'catch_up' }, 1)).toBeNull();
    const all = await db.collection('agentTasks').get();
    expect(all.empty).toBe(true);
  });

  it('claiming an empty queue returns nothing (and does not throw)', async () => {
    expect(await claimTasks(db, 'pulse')).toHaveLength(0);
  });
});

describe('cross-app shared memory + activity — handle-keyed, any app reads', () => {
  it('rememberShared round-trips a note readable by memory', async () => {
    expect(await rememberShared(db, H, 'is shipping the seam', 1000)).toBe(true);
    const notes = await readSharedMemory(db, H);
    expect(notes.map((n) => n.text)).toContain('is shipping the seam');
  });

  it('a written note carries the app tag as provenance', async () => {
    await rememberShared(db, H, 'a fact', 1);
    expect((await readSharedMemory(db, H))[0].app).toBe('rally');
  });

  it('readSharedMemory returns the newest window, oldest-first within it', async () => {
    for (let i = 1; i <= 5; i++) await rememberShared(db, H, `note ${i}`, i);
    const notes = await readSharedMemory(db, H, 3);
    // desc top-3 = 5,4,3; reversed to oldest-first inside the window.
    expect(notes.map((n) => n.text)).toEqual(['note 3', 'note 4', 'note 5']);
  });

  it('enforces the 280-char bound on a stored note', async () => {
    await rememberShared(db, H, 'x'.repeat(400), 1);
    expect((await readSharedMemory(db, H))[0].text).toHaveLength(280);
  });

  it('per-handle isolation — one handle never reads the other\'s memory', async () => {
    await rememberShared(db, H, 'alice fact', 1);
    await rememberShared(db, H2, 'bob fact', 2);
    expect((await readSharedMemory(db, H)).map((n) => n.text)).toEqual(['alice fact']);
    expect((await readSharedMemory(db, H2)).map((n) => n.text)).toEqual(['bob fact']);
  });

  it('logSharedActivity records the shared history entry', async () => {
    await logSharedActivity(db, H, 'recognition', 'thanked a teammate', 1);
    const acts = await readSharedActivity(db, H);
    expect(acts[0]).toMatchObject({ app: 'rally', kind: 'recognition', summary: 'thanked a teammate' });
  });

  it('logSharedActivity bounds the summary to 280 chars', async () => {
    await logSharedActivity(db, H, 'note', 'y'.repeat(400), 1);
    expect((await readSharedActivity(db, H))[0].summary).toHaveLength(280);
  });

  it('activity is per-handle isolated', async () => {
    await logSharedActivity(db, H, 'a', 'alice did a thing', 1);
    await logSharedActivity(db, H2, 'b', 'bob did a thing', 2);
    expect((await readSharedActivity(db, H)).map((a) => a.summary)).toEqual(['alice did a thing']);
    expect((await readSharedActivity(db, H2)).map((a) => a.summary)).toEqual(['bob did a thing']);
  });
});

describe('cross-app erasure — right to be forgotten sweeps the whole footprint', () => {
  it('forgetShared removes memory + activity + agentTasks for the handle, only theirs', async () => {
    await rememberShared(db, H, 'alice note', 1);
    await logSharedActivity(db, H, 'assistant', 'alice asked', 2);
    await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'catch_up', payload: { q: 'secret' } }, 3);
    // Someone else's footprint that must survive.
    await rememberShared(db, H2, 'bob note', 4);
    await logSharedActivity(db, H2, 'assistant', 'bob asked', 5);
    await dispatchTask(db, { toApp: 'pulse', handle: H2, intent: 'summarize' }, 6);

    const removed = await forgetShared(db, H);
    expect(removed).toBeGreaterThanOrEqual(3);

    expect(await readSharedMemory(db, H)).toEqual([]);
    expect(await readSharedActivity(db, H)).toEqual([]);
    const mine = await db.collection('agentTasks').where('handle', '==', contextKey(H)).get();
    expect(mine.empty).toBe(true);

    // Bob is fully intact.
    expect((await readSharedMemory(db, H2)).map((n) => n.text)).toEqual(['bob note']);
    expect((await readSharedActivity(db, H2)).map((a) => a.summary)).toEqual(['bob asked']);
    const theirs = await db.collection('agentTasks').where('handle', '==', contextKey(H2)).get();
    expect(theirs.size).toBe(1);
  });

  it('forgetShared on a handle with nothing stored removes zero and does not throw', async () => {
    expect(await forgetShared(db, H)).toBe(0);
  });

  it('forgetShared refuses a malformed handle (removes nothing)', async () => {
    await rememberShared(db, H, 'alice note', 1);
    expect(await forgetShared(db, '')).toBe(0);
    expect((await readSharedMemory(db, H)).map((n) => n.text)).toEqual(['alice note']);
  });
});
