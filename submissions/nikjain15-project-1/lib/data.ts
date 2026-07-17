import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { logPulse } from './pulse';
import type { Evidence, Member, Project, Status, Task } from './types';

type Actor = { uid: string; name: string; photoURL: string | null };

/* ---------------------------------------------------------------- members */

export function subscribeToMembers(onData: (members: Member[]) => void): () => void {
  return onSnapshot(query(collection(db, 'members'), orderBy('displayName')), (snap) =>
    onData(snap.docs.map((d) => d.data() as Member))
  );
}

/* --------------------------------------------------------------- projects */

export function subscribeToProjects(onData: (projects: Project[]) => void): () => void {
  // Not filtering archived here: the board needs to show/hide them per view,
  // and a second index-backed query costs more than filtering client-side at this size.
  return onSnapshot(query(collection(db, 'projects'), orderBy('createdAt', 'desc')), (snap) =>
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project))
  );
}

export async function createProject(
  actor: Actor,
  input: { name: string; description: string },
  /**
   * `silent` is for the project Pulse creates for a connected repo.
   *
   * The feed row would read "Nik created hult-cohort-program" — but Nik didn't, Pulse
   * did, on their behalf. Firestore rules require every write to be attributed to the
   * signed-in user, so the doc is theirs either way; announcing it as a thing they chose
   * to do is the part that isn't true. Pulse says when Pulse did it, and when Pulse did
   * it quietly, it says nothing at all.
   */
  options: { silent?: boolean } = {}
): Promise<string> {
  const ref = await addDoc(collection(db, 'projects'), {
    ...input,
    ownerUid: actor.uid,
    archived: false,
    createdAt: serverTimestamp(),
  });

  if (options.silent) return ref.id;

  await logPulse({
    kind: 'project_created',
    actorUid: actor.uid,
    actorName: actor.name,
    actorPhotoURL: actor.photoURL,
    subject: input.name,
    projectId: ref.id,
  });

  return ref.id;
}

export async function updateProject(
  projectId: string,
  patch: Partial<Pick<Project, 'name' | 'description' | 'archived'>>
) {
  await updateDoc(doc(db, 'projects', projectId), patch);
}

/* ------------------------------------------------------------------ tasks */

export function subscribeToTasks(onData: (tasks: Task[]) => void): () => void {
  return onSnapshot(query(collection(db, 'tasks'), orderBy('createdAt', 'desc')), (snap) =>
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Task))
  );
}

export async function createTask(
  actor: Actor,
  input: {
    projectId: string;
    title: string;
    description: string;
    assigneeUid: string | null;
    dueDate: Timestamp | null;
    status?: Status;
  }
): Promise<string> {
  const { status = 'todo', ...rest } = input;

  const ref = await addDoc(collection(db, 'tasks'), {
    ...rest,
    status,
    creatorUid: actor.uid,
    createdAt: serverTimestamp(),
    completedAt: status === 'done' ? serverTimestamp() : null,
    // Manual by definition — this is the path for anyone who declined GitHub, and their
    // cards read "you · by hand" rather than carrying a receipt they never earned.
    source: 'manual' as const,
    evidence: null,
    branch: null,
  });
  return ref.id;
}

/**
 * A card Pulse built for you, from a branch you pushed.
 *
 * Separate from `createTask` because the two differ in the one way that matters: this one
 * carries a receipt. `source: 'sensed'` makes the card say so on its face, and `evidence`
 * is what it says — "PR #41" is checkable, and a board that grows cards nobody made is a
 * board nobody trusts.
 *
 * `branch` is the dedupe key against every future re-sync. Without it a 15-minute poll
 * would twin every card it already made.
 */
export async function createSensedTask(
  actor: Actor,
  input: {
    projectId: string;
    title: string;
    description: string;
    status: Status;
    evidence: Evidence;
    branch: string | null;
  }
): Promise<string> {
  const ref = await addDoc(collection(db, 'tasks'), {
    ...input,
    assigneeUid: actor.uid,
    creatorUid: actor.uid,
    dueDate: null,
    createdAt: serverTimestamp(),
    completedAt: input.status === 'done' ? serverTimestamp() : null,
    source: 'sensed' as const,
  });
  return ref.id;
}

/**
 * Move a sensed card without announcing it.
 *
 * The backfill path. On a member's FIRST sync their whole history arrives at once, and
 * routing that through `setTaskStatus` would fire "shipped!" into 64 people's feeds for
 * PRs that merged last week. That's stale news presented as live, which is the one thing
 * the feed may never do. Cards land at their true state, silently; from the second sync
 * on, real transitions log normally through `setTaskStatus`.
 */
export async function setSensedStatusSilently(taskId: string, status: Status) {
  await updateDoc(doc(db, 'tasks', taskId), {
    status,
    completedAt: status === 'done' ? serverTimestamp() : null,
  });
}

export async function deleteTask(taskId: string) {
  await deleteDoc(doc(db, 'tasks', taskId));
}

/**
 * Move a task through the workflow.
 *
 * Only todo→in_progress and →done emit pulse events. Moving backwards (done→todo)
 * stays silent: the feed is a record of progress, and un-shipping something isn't
 * news the cohort needs. It also stops someone farming the feed by toggling a task.
 */
export async function setTaskStatus(actor: Actor, task: Task, status: Status) {
  if (task.status === status) return;

  await updateDoc(doc(db, 'tasks', task.id), {
    status,
    completedAt: status === 'done' ? serverTimestamp() : null,
  });

  if (status === 'done') {
    await logPulse({
      kind: 'task_shipped',
      actorUid: actor.uid,
      actorName: actor.name,
      actorPhotoURL: actor.photoURL,
      subject: task.title,
      projectId: task.projectId,
      taskId: task.id,
    });
  } else if (status === 'in_progress' && task.status === 'todo') {
    await logPulse({
      kind: 'task_started',
      actorUid: actor.uid,
      actorName: actor.name,
      actorPhotoURL: actor.photoURL,
      subject: task.title,
      projectId: task.projectId,
      taskId: task.id,
    });
  }
}

export async function updateTask(
  taskId: string,
  patch: Partial<Pick<Task, 'title' | 'description' | 'assigneeUid' | 'dueDate' | 'projectId'>>
) {
  await updateDoc(doc(db, 'tasks', taskId), patch);
}

/* --------------------------------------------------------------- comments */

export function subscribeToComments(
  taskId: string,
  onData: (comments: import('./types').Comment[]) => void
): () => void {
  const q = query(
    collection(db, 'comments'),
    where('taskId', '==', taskId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) =>
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as import('./types').Comment))
  );
}

export async function addComment(actor: Actor, taskId: string, body: string) {
  await addDoc(collection(db, 'comments'), {
    taskId,
    authorUid: actor.uid,
    body,
    createdAt: serverTimestamp(),
  });
}
