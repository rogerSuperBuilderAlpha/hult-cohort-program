/**
 * syncFromGitHub against reality — the fast-merge and human-wins cases (items 3 & 4).
 *
 * These drive the REAL sync against the emulator, stubbing only /api/sense (the external
 * GitHub read) — exactly the boundary the app stubs nothing else past. Every Firestore
 * write goes through the rules as the signed-in user.
 */
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SensedPull } from '@/app/api/sense/route';
import { createSensedTask, setTaskStatus } from '@/lib/data';
import { sensedTaskId } from '@/lib/sense';
import { syncFromGitHub } from '@/lib/sync';
import type { GitHubLink, Task } from '@/lib/types';
import {
  clearFirestore,
  importAppDb,
  signOutPrimary,
  signUpPrimary,
  type TestUser,
} from './helpers';

/** A connected, past-first-sync link — so syncs are LIVE, not the silent backfill. */
function liveLink(user: TestUser, over: Partial<GitHubLink> = {}): GitHubLink {
  return {
    uid: user.uid,
    handle: 'octocat',
    connectedAt: null as never,
    status: 'connected',
    mode: 'auto',
    excludedRepos: [],
    lastSyncedAt: new Date('2026-01-01') as never,
    narrationOptIn: false,
    createTasksFromBranches: true,
    narrationCacheKey: null,
    ...over,
  };
}

function stubSense(pulls: SensedPull[]) {
  vi.stubGlobal('fetch', async (url: string) => {
    if (String(url).includes('/api/sense')) {
      return new Response(JSON.stringify({ ok: true, handle: 'octocat', pulls }), { status: 200 });
    }
    throw new Error(`unexpected fetch in test: ${url}`);
  });
}

async function shippedCount(taskId: string): Promise<number> {
  const db = await importAppDb();
  const snap = await getDocs(
    query(collection(db, 'pulse'), where('kind', '==', 'task_shipped'), where('taskId', '==', taskId))
  );
  return snap.size;
}

describe('sync', () => {
  let user: TestUser;

  beforeEach(async () => {
    await clearFirestore();
    user = await signUpPrimary('sync');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  afterAll(async () => {
    await signOutPrimary();
  });

  it('announces a PR that opened AND merged inside one poll window (item 3)', async () => {
    const actor = { uid: user.uid, name: user.name, photoURL: null };
    const branch = 'feat/fast-merge';
    stubSense([{ number: 7, title: 'Fast merge', branch, state: 'closed', merged: true, createdAt: '2026-01-01T00:00:00Z', mergedAt: '2026-01-01T01:00:00Z' }]);

    const outcome = await syncFromGitHub({ actor, link: liveLink(user), tasks: [], projects: [], members: [] });
    expect(outcome.kind).toBe('synced');

    const db = await importAppDb();
    const id = sensedTaskId(user.uid, branch);
    const card = await getDoc(doc(db, 'tasks', id));
    expect(card.exists()).toBe(true);
    expect(card.data()!.status).toBe('done');

    // The whole point: the cohort must SEE the ship, even though the card was born at done
    // and the transition path never ran. Missed before the fix (0 events).
    expect(await shippedCount(id)).toBe(1);
  });

  it('does not re-announce the same fast-merged PR on the next poll (idempotent)', async () => {
    const actor = { uid: user.uid, name: user.name, photoURL: null };
    const branch = 'feat/fast-merge-2';
    stubSense([{ number: 8, title: 'Fast merge two', branch, state: 'closed', merged: true, createdAt: '2026-01-01T00:00:00Z', mergedAt: '2026-01-01T01:00:00Z' }]);

    const id = sensedTaskId(user.uid, branch);
    const tasksAfterFirst = (): Task[] => [
      {
        id, projectId: 'repo_x', title: 'Fast merge two', description: '', status: 'done',
        assigneeUid: user.uid, creatorUid: user.uid, dueDate: null, createdAt: null as never,
        completedAt: null, source: 'sensed', evidence: null, branch,
      },
    ];

    await syncFromGitHub({ actor, link: liveLink(user), tasks: [], projects: [], members: [] });
    await syncFromGitHub({ actor, link: liveLink(user), tasks: tasksAfterFirst(), projects: [], members: [] });

    expect(await shippedCount(id)).toBe(1);
  });

  it('does not drag a human-completed card back when the PR is still open (item 4)', async () => {
    const actor = { uid: user.uid, name: user.name, photoURL: null };
    const branch = 'feat/human-done';

    // Pulse built the card; the human then finished it by hand while the PR is still open.
    const { id } = await createSensedTask(actor, {
      projectId: 'repo_x', title: 'Human finishes early', description: '',
      status: 'todo', evidence: { commits: 0, prNumbers: [9], files: [], spanHours: null },
      branch, dedupeKey: branch,
    });
    const todoSnapshot: Task = {
      id, projectId: 'repo_x', title: 'Human finishes early', description: '', status: 'todo',
      assigneeUid: user.uid, creatorUid: user.uid, dueDate: null, createdAt: null as never,
      completedAt: null, source: 'sensed', evidence: null, branch,
    };
    await setTaskStatus(actor, todoSnapshot, 'done');

    // Next poll: the PR is still OPEN (not merged). Inference would say in_progress.
    stubSense([{ number: 9, title: 'Human finishes early', branch, state: 'open', merged: false, createdAt: '2026-01-01T00:00:00Z', mergedAt: null }]);
    const doneSnapshot: Task = { ...todoSnapshot, status: 'done' };
    await syncFromGitHub({ actor, link: liveLink(user), tasks: [doneSnapshot], projects: [], members: [] });

    const db = await importAppDb();
    const card = await getDoc(doc(db, 'tasks', id));
    // The human wins. Pulse advances cards; it never overrules a completion.
    expect(card.data()!.status).toBe('done');
  });
});
