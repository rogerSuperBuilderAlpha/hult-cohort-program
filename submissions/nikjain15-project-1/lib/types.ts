import type { Timestamp } from 'firebase/firestore';

/** Task status workflow. Order here drives board column order. */
export const STATUSES = ['todo', 'in_progress', 'done'] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

/**
 * A cohort member. Created on first sign-in, keyed by Firebase Auth uid.
 *
 * `handle` is the GitHub login and nothing else — it is the join key against the
 * public cohort repo, which indexes people by login. Deriving it from anything else
 * (an email local-part, a display name) silently breaks that join: Pulse looks the
 * person up, doesn't find them, and reports "we don't know you" forever.
 *
 * null until GitHub is connected. A guessed handle is worse than none — it can also
 * collide with a real member's login and attach one person's work to another.
 */
export type Member = {
  uid: string;
  email: string;
  handle: string | null;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  ownerUid: string;
  archived: boolean;
  createdAt: Timestamp;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: Status;
  assigneeUid: string | null;
  creatorUid: string;
  dueDate: Timestamp | null;
  createdAt: Timestamp;
  completedAt: Timestamp | null;
};

export type Comment = {
  id: string;
  taskId: string;
  authorUid: string;
  body: string;
  createdAt: Timestamp;
};

/**
 * Pulse events — the cohort heartbeat.
 *
 * Denormalised on purpose: the feed renders without joining to members/projects/tasks,
 * so one listener drives the whole home screen and stays cheap on Firestore reads.
 * Actor and subject names are copied in at write time.
 */
export const PULSE_KINDS = [
  'task_shipped',
  'task_started',
  'project_created',
  'member_joined',
] as const;
export type PulseKind = (typeof PULSE_KINDS)[number];

export type PulseEvent = {
  id: string;
  kind: PulseKind;
  actorUid: string;
  actorName: string;
  actorPhotoURL: string | null;
  /** Task title, project name, or member name — whatever the verb acts on. */
  subject: string;
  projectId: string | null;
  taskId: string | null;
  createdAt: Timestamp;
  /** uids who gave kudos. Array so a member can only kudos once. */
  kudos: string[];
};
