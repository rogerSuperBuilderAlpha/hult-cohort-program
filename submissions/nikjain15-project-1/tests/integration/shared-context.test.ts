/**
 * Shared-context bus adapter against a real Firestore (the emulator via busDb()'s fallback).
 * Proves memory + activity are handle-keyed and cross-app readable, and that the agent-to-agent
 * task lifecycle (dispatch → claim → complete) is transactional and idempotent.
 *
 * Mirrors Rally's tests/integration/shared-context.test.ts — the two apps must behave identically
 * against the same paths. Pulse writes as APP='pulse'.
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
import type { Firestore } from 'firebase-admin/firestore';

let db: Firestore;

// Self-clear via the Admin SDK (not the shared clearFirestore helper, which hardcodes port 8080):
// this test runs on isolated emulator ports so it never collides with a concurrent session.
async function clearBus(d: Firestore): Promise<void> {
  const tasks = await d.collection('agentTasks').get();
  await Promise.all(tasks.docs.map((doc) => doc.ref.delete()));
  for (const h of ['nikjain15', 'someoneelse']) await forgetShared(d, h);
}

beforeEach(async () => {
  const got = busDb();
  if (!got) throw new Error('bus db unavailable');
  db = got;
  await clearBus(db);
});
afterEach(async () => {
  await clearBus(db);
});

describe('shared memory + activity — keyed by GitHub handle, readable by any app', () => {
  it('remembers a note under the handle (case-insensitive) and reads it back', async () => {
    expect(await rememberShared(db, 'NikJain15', 'is shipping the workflow lanes', 1000)).toBe(true);
    const notes = await readSharedMemory(db, 'nikjain15');
    expect(notes.map((n) => n.text)).toContain('is shipping the workflow lanes');
    expect(notes[0].app).toBe('pulse'); // provenance is recorded so another app knows who wrote it
  });

  it("refuses to write for a caller with no handle (can't join the shared layer)", async () => {
    expect(await rememberShared(db, '', 'nope', 1)).toBe(false);
    expect(await readSharedMemory(db, '')).toEqual([]);
  });

  it('logs shared activity as the common history', async () => {
    await logSharedActivity(db, 'nikjain15', 'dispatch', 'asked rally to: catch me up', 1);
    const acts = await readSharedActivity(db, 'nikjain15');
    expect(acts[0]).toMatchObject({ app: 'pulse', kind: 'dispatch', summary: 'asked rally to: catch me up' });
  });

  it("forgetShared erases a person's memory + history (right to be forgotten), only theirs", async () => {
    await rememberShared(db, 'nikjain15', 'a note', 1);
    await logSharedActivity(db, 'nikjain15', 'agent', 'asked something', 2);
    await rememberShared(db, 'someoneelse', 'their note', 3);

    const removed = await forgetShared(db, 'nikjain15');
    expect(removed).toBeGreaterThanOrEqual(2);
    expect(await readSharedMemory(db, 'nikjain15')).toEqual([]);
    expect(await readSharedActivity(db, 'nikjain15')).toEqual([]);
    // Another person's record is untouched.
    expect((await readSharedMemory(db, 'someoneelse')).map((n) => n.text)).toEqual(['their note']);
  });
});

describe('agent-to-agent dispatch', () => {
  it('dispatches, claims once, and completes — the cross-app hand-off', async () => {
    const id = await dispatchTask(db, { toApp: 'pulse', handle: 'nikjain15', intent: 'catch_up' }, 1000);
    expect(id).toBeTruthy();

    const first = await claimTasks(db, 'pulse');
    expect(first).toHaveLength(1);
    expect(first[0].status).toBe('claimed');

    // A second claim finds nothing — a task is never worked twice.
    expect(await claimTasks(db, 'pulse')).toHaveLength(0);

    await completeTask(db, id!, true, 'done: 2 things need you');
    const snap = await db.collection('agentTasks').doc(id!).get();
    expect(snap.data()?.status).toBe('done');
    expect(snap.data()?.result).toContain('2 things');
  });

  it('a task addressed to another app is not claimed by this one', async () => {
    await dispatchTask(db, { toApp: 'rally', handle: 'nikjain15', intent: 'award_points' }, 1000);
    expect(await claimTasks(db, 'pulse')).toHaveLength(0);
  });

  it('only the targeted handle\'s tasks are claimed', async () => {
    await dispatchTask(db, { toApp: 'pulse', handle: 'nikjain15', intent: 'mine' }, 1);
    await dispatchTask(db, { toApp: 'pulse', handle: 'someoneelse', intent: 'theirs' }, 2);
    const mine = await claimTasks(db, 'pulse', 'nikjain15', 5);
    expect(mine).toHaveLength(1);
    expect(mine[0].intent).toBe('mine');
  });
});
