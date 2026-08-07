/**
 * CROSS-APP REGRESSION SUITE (adversarial) — the seam between Rally and Pulse.
 *
 * Runs against the emulator via busDb()'s fallback, with synthetic `zz-test-*` handles created
 * and torn down each run — never a prod DB, never the prod cohort-context bus. Guards the
 * agent-to-agent dispatch lifecycle and shared-memory isolation against the concrete attacks a
 * reviewer would try: double-claim, illegal transitions, replay, malformed input, erasure
 * completeness, and per-handle isolation with two writers.
 *
 * The happy-path round-trips live in shared-context.test.ts; this file is the "try to break it" half.
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
const H = 'zz-test-nikjain15'; // synthetic handle — never a real person
const OTHER = 'zz-test-someone';

beforeEach(async () => {
  const got = busDb();
  if (!got) throw new Error('bus db unavailable (emulator not up?)');
  db = got;
  await clearFirestore();
});
afterEach(async () => {
  await clearFirestore();
});

describe('dispatch lifecycle enforcement — a task is worked at most once', () => {
  it('completeTask refuses an illegal transition: a pending (unclaimed) task cannot jump to done', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'do_x' }, 1000);
    // Skip the claim — try to complete straight from pending.
    await completeTask(db, id!, true, 'sneaky');
    const snap = await db.collection('agentTasks').doc(id!).get();
    expect(snap.data()?.status).toBe('pending'); // unchanged — pending→done is illegal
    expect(snap.data()?.result).toBeNull();
  });

  it('a completed task cannot be re-completed or re-claimed (terminal)', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'do_x' }, 1000);
    await claimTasks(db, 'pulse', H);
    await completeTask(db, id!, true, 'first result');
    await completeTask(db, id!, false, 'second result'); // must be ignored — done is terminal
    const snap = await db.collection('agentTasks').doc(id!).get();
    expect(snap.data()?.status).toBe('done');
    expect(snap.data()?.result).toBe('first result');
    expect(await claimTasks(db, 'pulse', H)).toHaveLength(0); // nothing left to claim
  });

  it('concurrent claims race safely — the task is claimed exactly once across both callers', async () => {
    await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'race' }, 1000);
    const [a, b] = await Promise.all([claimTasks(db, 'pulse', H), claimTasks(db, 'pulse', H)]);
    expect(a.length + b.length).toBe(1); // transactional claim — no double-work
  });

  it('a failed run surfaces as failed, not silently dropped', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'boom' }, 1000);
    await claimTasks(db, 'pulse', H);
    await completeTask(db, id!, false, 'the run threw');
    const snap = await db.collection('agentTasks').doc(id!).get();
    expect(snap.data()?.status).toBe('failed');
    expect(snap.data()?.result).toBe('the run threw');
  });
});

describe('dispatch addressing — you can only work what is yours', () => {
  it('a task for another app is invisible to this app', async () => {
    await dispatchTask(db, { toApp: 'rally', handle: H, intent: 'not_mine' }, 1000);
    expect(await claimTasks(db, 'pulse', H)).toHaveLength(0);
  });

  it("claiming for a handle only returns that handle's tasks (no cross-user work)", async () => {
    await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'mine' }, 1000);
    await dispatchTask(db, { toApp: 'pulse', handle: OTHER, intent: 'theirs' }, 1001);
    const mine = await claimTasks(db, 'pulse', H);
    expect(mine).toHaveLength(1);
    expect(mine[0].intent).toBe('mine');
  });

  it('a dispatch with no handle is refused (cannot join the shared layer)', async () => {
    expect(await dispatchTask(db, { toApp: 'pulse', handle: '', intent: 'x' }, 1000)).toBeNull();
    expect(await claimTasks(db, 'pulse')).toHaveLength(0);
  });
});

describe('replay / duplication — documented behavior', () => {
  it('two identical dispatches create two independent tasks (no dedup key by design)', async () => {
    await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'same' }, 1000);
    await dispatchTask(db, { toApp: 'pulse', handle: H, intent: 'same' }, 1000);
    const claimed = await claimTasks(db, 'pulse', H, 10);
    // Both are claimable — callers that must be idempotent should key on intent+payload.
    expect(claimed.length).toBe(2);
  });
});

describe('shared memory — minimization, provenance, and per-handle isolation', () => {
  it('bounds note length (no raw transcripts on the bus) and records provenance', async () => {
    const long = 'x'.repeat(1000);
    await rememberShared(db, H, long, 1000);
    const [note] = await readSharedMemory(db, H);
    expect(note.text.length).toBeLessThanOrEqual(280); // data minimization
    expect(note.app).toBe('pulse'); // another app knows who wrote it
  });

  it('two writers stay isolated — one handle never reads the other', async () => {
    await rememberShared(db, H, 'my note', 1);
    await rememberShared(db, OTHER, 'their note', 2);
    await logSharedActivity(db, OTHER, 'pulse', 'their activity', 3);
    expect((await readSharedMemory(db, H)).map((n) => n.text)).toEqual(['my note']);
    expect((await readSharedActivity(db, H))).toEqual([]);
  });
});

describe('erasure completeness — right to be forgotten', () => {
  it('forgetShared removes a handle\'s memory + activity + agent tasks, and only that handle\'s', async () => {
    await rememberShared(db, H, 'note', 1);
    await logSharedActivity(db, H, 'pulse', 'did a thing', 2);
    await dispatchTask(db, { toApp: 'rally', handle: H, intent: 'my pending task' }, 3);
    await rememberShared(db, OTHER, 'other note', 4);
    await dispatchTask(db, { toApp: 'pulse', handle: OTHER, intent: 'their task' }, 5);

    const removed = await forgetShared(db, H);
    expect(removed).toBeGreaterThanOrEqual(3); // note + activity + task
    expect(await readSharedMemory(db, H)).toEqual([]);
    expect(await readSharedActivity(db, H)).toEqual([]);
    // Erasure is COMPLETE — no agent task keyed to the forgotten handle survives.
    const leftover = await db.collection('agentTasks').where('handle', '==', H).get();
    expect(leftover.size).toBe(0);
    // Another person's record — memory AND their task — is untouched.
    expect((await readSharedMemory(db, OTHER)).map((n) => n.text)).toEqual(['other note']);
    expect((await db.collection('agentTasks').where('handle', '==', OTHER).get()).size).toBe(1);
  });
});
