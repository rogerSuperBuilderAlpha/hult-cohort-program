/**
 * Twin repo-projects — the guard and the migration (backlog item 2).
 *
 * Before `ensureRepoProject` keyed the project by repo, a connect-flow race created two
 * projects named after the cohort repo under different ids. New cards then scattered
 * across both because `findRepoProject` matched by NAME and `Array.find` returned whichever
 * sorted first. `findRepoProject` is now deterministic (prefer the canonical id) and
 * `reconcileRepoProjects` drains a twin already sitting in prod.
 *
 * The guard is a pure-array assertion; the migration drives real Firestore writes through
 * the rules as the signed-in user, against the emulator.
 */
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTask, ensureRepoProject, reconcileRepoProjects, repoProjectId } from '@/lib/data';
import { COHORT_REPO_NAME } from '@/lib/github-repo';
import { findRepoProject } from '@/lib/sync';
import type { Project, Task } from '@/lib/types';
import {
  clearFirestore,
  importAppDb,
  signOutPrimary,
  signUpPrimary,
  type TestUser,
} from './helpers';

async function readProjects(): Promise<Project[]> {
  const db = await importAppDb();
  const snap = await getDocs(collection(db, 'projects'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project);
}

async function readTasks(): Promise<Task[]> {
  const db = await importAppDb();
  const snap = await getDocs(collection(db, 'tasks'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Task);
}

describe('findRepoProject — the guard', () => {
  const canonicalId = repoProjectId(COHORT_REPO_NAME);
  const canonical: Project = {
    id: canonicalId, name: COHORT_REPO_NAME, description: '', ownerUid: 'u1',
    archived: false, createdAt: null as never,
  };
  const twin: Project = {
    id: 'random_twin_id', name: COHORT_REPO_NAME, description: '', ownerUid: 'u2',
    archived: false, createdAt: null as never,
  };

  it('prefers the canonical id even when a twin sorts first', () => {
    // Old name-only match returned whichever `.find` hit first — the twin, here.
    expect(findRepoProject([twin, canonical])?.id).toBe(canonicalId);
    expect(findRepoProject([canonical, twin])?.id).toBe(canonicalId);
  });

  it('falls back to the name only before the canonical doc exists', () => {
    expect(findRepoProject([twin])?.id).toBe('random_twin_id');
  });

  it('never returns an archived canonical', () => {
    expect(findRepoProject([{ ...canonical, archived: true }])).toBeUndefined();
  });
});

describe('reconcileRepoProjects — the migration', () => {
  let user: TestUser;

  beforeEach(async () => {
    await clearFirestore();
    user = await signUpPrimary('reconcile');
  });

  afterAll(async () => {
    await signOutPrimary();
  });

  it('drains a twin onto the canonical project and archives the empty shell', async () => {
    const actor = { uid: user.uid, name: user.name, photoURL: null };
    const canonicalId = await ensureRepoProject(actor, {
      repo: COHORT_REPO_NAME,
      description: 'canonical',
    });

    const db = await importAppDb();
    const twinRef = await addDoc(collection(db, 'projects'), {
      name: COHORT_REPO_NAME, description: 'legacy twin', ownerUid: user.uid,
      archived: false, createdAt: serverTimestamp(),
    });
    const strandedId = await createTask(actor, {
      projectId: twinRef.id, title: 'Stranded card', description: '',
      assigneeUid: user.uid, dueDate: null,
    });

    const result = await reconcileRepoProjects(COHORT_REPO_NAME, await readProjects(), await readTasks());
    expect(result).toEqual({ tasksMoved: 1, projectsArchived: 1 });

    const movedCard = await getDoc(doc(db, 'tasks', strandedId));
    expect(movedCard.data()!.projectId).toBe(canonicalId);
    const drainedTwin = await getDoc(doc(db, 'projects', twinRef.id));
    expect(drainedTwin.data()!.archived).toBe(true);
  });

  it('is a no-op the second time (idempotent, convergent under a race)', async () => {
    const actor = { uid: user.uid, name: user.name, photoURL: null };
    await ensureRepoProject(actor, { repo: COHORT_REPO_NAME, description: 'canonical' });
    const db = await importAppDb();
    const twinRef = await addDoc(collection(db, 'projects'), {
      name: COHORT_REPO_NAME, description: 'legacy twin', ownerUid: user.uid,
      archived: false, createdAt: serverTimestamp(),
    });
    await createTask(actor, {
      projectId: twinRef.id, title: 'Stranded card', description: '',
      assigneeUid: user.uid, dueDate: null,
    });

    await reconcileRepoProjects(COHORT_REPO_NAME, await readProjects(), await readTasks());
    const second = await reconcileRepoProjects(COHORT_REPO_NAME, await readProjects(), await readTasks());
    expect(second).toEqual({ tasksMoved: 0, projectsArchived: 0 });
  });

  it('does nothing when there is only the canonical project', async () => {
    const actor = { uid: user.uid, name: user.name, photoURL: null };
    const canonicalId = await ensureRepoProject(actor, { repo: COHORT_REPO_NAME, description: 'canonical' });
    await createTask(actor, {
      projectId: canonicalId, title: 'Legit card', description: '',
      assigneeUid: user.uid, dueDate: null,
    });

    const result = await reconcileRepoProjects(COHORT_REPO_NAME, await readProjects(), await readTasks());
    expect(result).toEqual({ tasksMoved: 0, projectsArchived: 0 });
  });
});
