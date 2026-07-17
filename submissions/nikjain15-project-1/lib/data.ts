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
import type { Member, Project, Status, Task } from './types';

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
  input: { name: string; description: string }
): Promise<string> {
  const ref = await addDoc(collection(db, 'projects'), {
    ...input,
    ownerUid: actor.uid,
    archived: false,
    createdAt: serverTimestamp(),
  });

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
