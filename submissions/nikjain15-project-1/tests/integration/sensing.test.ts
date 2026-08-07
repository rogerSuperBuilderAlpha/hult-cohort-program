/**
 * The sensing state machine, driven end-to-end against the emulator.
 *
 * These pin the interactions that typecheck, lint and the pure unit tests all pass while
 * a real account still breaks — the class the audit exists to catch. Every write here goes
 * through the real client SDK as a real signed-in user, so firestore.rules apply.
 */
import { doc, getDoc } from 'firebase/firestore';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import {
  createSensedTask,
  deleteTask,
} from '@/lib/data';
import { sensedTaskId } from '@/lib/sense';
import {
  clearFirestore,
  importAppDb,
  signOutPrimary,
  signUpPrimary,
  type TestUser,
} from './helpers';

const BRANCH = 'feat/real-branch';

function sensedInput(status: 'todo' | 'in_progress' | 'done' = 'done') {
  return {
    projectId: 'repo_hult-cohort-program',
    title: 'Fix the oauth redirect',
    description: 'Pulse built this from `feat/real-branch`. Edit or delete it — it’s yours.',
    status,
    evidence: { commits: 0, prNumbers: [41], files: [], spanHours: null },
    branch: BRANCH,
    dedupeKey: BRANCH,
  };
}

describe('sensing: deleted card does not resurrect (item 1)', () => {
  let user: TestUser;

  beforeEach(async () => {
    await clearFirestore();
    user = await signUpPrimary('owner');
  });

  afterAll(async () => {
    await signOutPrimary();
  });

  it('a card the user deletes stays gone across the next sync', async () => {
    const db = await importAppDb();
    const actor = { uid: user.uid, name: user.name, photoURL: null };

    // Sync #1 builds the card.
    const first = await createSensedTask(actor, sensedInput());
    expect(first.created).toBe(true);
    const id = sensedTaskId(user.uid, BRANCH);
    expect(id).toBe(first.id);
    expect((await getDoc(doc(db, 'tasks', id))).exists()).toBe(true);

    // The user deletes it on purpose. "Edit or delete it — it's yours."
    await deleteTask(id);
    expect((await getDoc(doc(db, 'tasks', id))).exists()).toBe(false);

    // Sync #2, same branch, same PR — the resurrection window.
    const second = await createSensedTask(actor, sensedInput());

    // The card must NOT come back, and the receipt must not claim a build.
    expect((await getDoc(doc(db, 'tasks', id))).exists()).toBe(false);
    expect(second.created).toBe(false);
  });
});
