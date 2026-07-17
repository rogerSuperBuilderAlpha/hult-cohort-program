import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { logPulse } from './pulse';
import { sensedTaskId } from './sense';
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

/**
 * A project someone made by hand. The sensed one is `ensureRepoProject`.
 *
 * This one always announces itself, because a person genuinely did it. It used to carry a
 * `silent` option for Pulse's repo project; that path is transactional now and doesn't
 * come through here, so the option had no callers left. A flag nobody sets is a trap for
 * whoever reads this next.
 */
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

/**
 * The project for a connected repo — one for the whole cohort, however many people
 * connect at once.
 *
 * Same shape, and same reason, as `createSensedTask`: "is there a project called this?"
 * followed by `addDoc` is a read-then-write, and read-then-writes lose races. Two members
 * connecting in the same few seconds — or one member with two tabs — would each see no
 * project and each create one, and the cohort would get two boards called
 * `hult-cohort-program`. That didn't reproduce when the task twin did, but only because
 * the timing happened to favour one tab. Unprevented isn't fixed.
 *
 * The id is derived from the repo and NOT from the uid: this project is shared, so the
 * second member through the door must land on the first member's document rather than
 * their own copy of it. First one there owns it; the rules require the creator to set
 * `ownerUid` to themselves, and everyone can read and write projects regardless.
 *
 * Silent by design — see `createProject`. The feed row would read "Nik created
 * hult-cohort-program", and Nik didn't. Pulse did.
 */
export async function ensureRepoProject(
  actor: Actor,
  input: { repo: string; description: string }
): Promise<string> {
  const id = `repo_${input.repo}`;
  const ref = doc(db, 'projects', id);

  await runTransaction(db, async (tx) => {
    const existing = await tx.get(ref);
    if (existing.exists()) return;

    tx.set(ref, {
      name: input.repo,
      description: input.description,
      ownerUid: actor.uid,
      archived: false,
      createdAt: serverTimestamp(),
    });
  });

  return id;
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
 * **Idempotent by construction, and it has to be.** The id is derived from the work
 * (`sensedTaskId`), and the write is a transaction that does nothing if the card already
 * exists. `addDoc` + "did I already make one?" is a read-then-write, and it lost the race
 * in production: two runs both saw an empty board and put two identical PR #40 cards up.
 *
 * The transaction, not just the derived id, is what protects a card you have since EDITED.
 * A blind `setDoc` on the same id would be idempotent for the twin and catastrophic for
 * you — it would overwrite your retitled, re-columned card with Pulse's original guess on
 * the next poll. Existing card wins, always. Pulse builds it once; after that it's yours.
 *
 * `dedupeKey` is the branch where there is one, falling back to the PR — the same key
 * `matchTask` uses, so the fast path and this backstop agree on what "the same work" means.
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
    dedupeKey: string;
  }
): Promise<{ id: string; created: boolean }> {
  const { dedupeKey, ...fields } = input;
  const id = sensedTaskId(actor.uid, dedupeKey);
  const ref = doc(db, 'tasks', id);

  // Whether THIS call wrote the card, decided inside the transaction. The caller counts
  // real creations for SyncNote — "Pulse built 3 cards" must mean three, not three
  // no-ops. A receipt-driven product whose own receipt overcounts is the one lie it can't
  // afford.
  const created = await runTransaction(db, async (tx) => {
    const existing = await tx.get(ref);
    // Somebody already built this — another tab, another run, or a poll that overlapped.
    // That's a success, not a conflict: the card they made is the card this one would be.
    if (existing.exists()) return false;

    tx.set(ref, {
      ...fields,
      assigneeUid: actor.uid,
      creatorUid: actor.uid,
      dueDate: null,
      createdAt: serverTimestamp(),
      completedAt: fields.status === 'done' ? serverTimestamp() : null,
      source: 'sensed' as const,
    });
    return true;
  });

  return { id, created };
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
export async function setTaskStatus(
  actor: Actor,
  task: Task,
  status: Status,
  /**
   * The sentence Pulse wrote about this, and the facts it was inferred from.
   *
   * Optional, and omitting it publishes FACTS ONLY — the correct default and the safe
   * failure mode. It is only ever populated for a member who opted into narration, about
   * themselves, after `checkNarrative` passed. `logPulse` renders `undefined` as null.
   */
  narration?: { narrative: string | null; evidence: Evidence | null }
) {
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
      narrative: narration?.narrative ?? null,
      // The narrative never ships without the evidence it was inferred from. A legible
      // mistake is forgivable; a mysterious one isn't.
      evidence: narration?.evidence ?? task.evidence,
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
