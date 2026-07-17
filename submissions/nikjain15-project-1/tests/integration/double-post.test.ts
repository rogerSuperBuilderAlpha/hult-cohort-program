/**
 * Two tabs / two devices must not double-fire a status event into 64 feeds (item 2).
 *
 * The derived-id transaction stops twin CARDS (`createSensedTask`), but the pulse EVENT
 * still went through `addDoc` — a fresh id every call. Two tabs each holding a `todo`
 * snapshot both pass `setTaskStatus`'s `task.status === status` guard (their snapshot is
 * stale), both write, and both log. The feed then shows the same ship twice.
 */
import { collection, getDocs, query, where } from 'firebase/firestore';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTask, setTaskStatus } from '@/lib/data';
import type { Task } from '@/lib/types';
import {
  clearFirestore,
  importAppDb,
  signOutPrimary,
  signUpPrimary,
  type TestUser,
} from './helpers';

async function shippedEventsFor(taskId: string): Promise<number> {
  const db = await importAppDb();
  const snap = await getDocs(
    query(collection(db, 'pulse'), where('kind', '==', 'task_shipped'), where('taskId', '==', taskId))
  );
  return snap.size;
}

describe('two tabs cannot double-post a ship (item 2)', () => {
  let user: TestUser;

  beforeEach(async () => {
    await clearFirestore();
    user = await signUpPrimary('shipper');
  });

  afterAll(async () => {
    await signOutPrimary();
  });

  it('a task shipped from two stale snapshots logs exactly one task_shipped', async () => {
    const actor = { uid: user.uid, name: user.name, photoURL: null };

    const taskId = await createTask(actor, {
      projectId: 'proj_x',
      title: 'Ship it once',
      description: '',
      assigneeUid: null,
      dueDate: null,
    });

    // Two tabs, each with the SAME pre-ship snapshot (status still 'todo').
    const staleSnapshot: Task = {
      id: taskId,
      projectId: 'proj_x',
      title: 'Ship it once',
      description: '',
      status: 'todo',
      assigneeUid: null,
      creatorUid: user.uid,
      dueDate: null,
      createdAt: null as never,
      completedAt: null,
      source: 'manual',
      evidence: null,
      branch: null,
      stuckSince: null,
    };

    // Tab A and Tab B both ship, each unaware the other did.
    await Promise.all([
      setTaskStatus(actor, staleSnapshot, 'done'),
      setTaskStatus(actor, staleSnapshot, 'done'),
    ]);

    expect(await shippedEventsFor(taskId)).toBe(1);
  });
});
