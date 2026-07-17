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

/**
 * Evidence for anything Pulse asserts. Never render an inference without it.
 *
 * This is what makes autonomy tolerable: Pulse posts without asking, so every claim it
 * makes has to show its working. "6 commits · PR #41 · 2h between first and last" is the
 * difference between a mistake you can forgive and one you can't.
 */
export type Evidence = {
  commits: number;
  prNumbers: number[];
  files: string[];
  /** first → last commit: how long they fought it. */
  spanHours: number | null;
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
  /**
   * How this card came to exist. Manual cards read "you · by hand"; sensed cards carry
   * their receipt. Pulse says when Pulse did it — a board that silently grows cards
   * nobody made is a board nobody trusts.
   */
  source: 'manual' | 'sensed';
  /** Only on sensed cards. Facts from the GitHub API, so it cannot be wrong. */
  evidence: Evidence | null;
  /** Branch that produced a sensed card. The dedupe key against re-syncs. */
  branch: string | null;
};

/**
 * A member indexed from the PUBLIC cohort repo, before they ever sign up.
 *
 * Facts only. This is what lets the landing page know a reviewer who has never opened
 * Pulse — and `narrationOptIn` is what stops it writing sentences about them.
 */
export type CohortMember = {
  /** github login, from the repo's PRs. Match case-insensitively. */
  handle: string;
  /** set once they sign in and their login matches. */
  uid: string | null;
  evidence: Evidence;
  lastSeenAt: Timestamp;
  /** false until consent. Gates ALL model-written text about this person. */
  narrationOptIn: boolean;
};

export type GitHubLink = {
  uid: string;
  handle: string;
  connectedAt: Timestamp;
  status: 'connected' | 'declined' | 'revoked';
  /** 'ask_first' restores the approval queue the default deliberately removes. */
  mode: 'auto' | 'ask_first';
  excludedRepos: string[];
  lastSyncedAt: Timestamp | null;
  /**
   * The consent record for narration, keyed by uid — and this is the authoritative one.
   *
   * `CohortMember.narrationOptIn` is the gate the rules enforce on the public, handle-keyed
   * doc, but that doc only exists for someone who has already pushed to the cohort repo —
   * about 8 of 65 people today. Recording consent only there would mean the other ~57 can
   * agree to narration and have it silently not stick, because there is nothing to write it
   * to. So consent is recorded here at /connect, and the sync mirrors it onto the
   * cohortMember doc when that doc first comes into existence.
   *
   * Off is not the same as disconnected: off means sensing still runs and nothing gets
   * published. `status: 'revoked'` is disconnected, and only that.
   */
  narrationOptIn: boolean;
  /**
   * Off = status inference only: Pulse still moves cards it already knows about, but stops
   * inventing tasks from branch names. Spec §9.
   */
  createTasksFromBranches: boolean;
  /**
   * The exact work the last narration described — the budget guard, not an optimisation.
   *
   * Uncached, 65 members on a 15-minute poll is ~6,240 model calls/day (~$12.48/day,
   * ~$524 over the pilot) against ~$11 of credit. Matching this key means the work hasn't
   * changed, so there is nothing new to say and no call is made. A miss on unchanged work
   * is a bug.
   *
   * null until the first narration. Never used to decide WHETHER someone may be narrated —
   * that's `narrationOptIn`, and only that.
   */
  narrationCacheKey: string | null;
};

export type Recipe = {
  id: string;
  problem: string;
  body: string;
  authorUid: string;
  taskId: string | null;
  turns: number;
  /** The only ranking in the product: people unstuck, which measures generosity. */
  unstuckUids: string[];
  createdAt: Timestamp;
};

/**
 * "Marcus is stuck on what you solved."
 *
 * The most sensitive doc in the product — it names someone who is struggling. Readable
 * only by helperUid, never the cohort and never the person it describes.
 */
export type Introduction = {
  id: string;
  stuckUid: string;
  helperUid: string;
  recipeId: string | null;
  state: 'suggested' | 'sent' | 'dismissed';
  createdAt: Timestamp;
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
  'recipe_banked',
  'intro_made',
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
  /**
   * Model-written. Null for facts-only events — and null is the correct value for anyone
   * who hasn't opted into narration. Every sentence here passed checkNarrative first.
   */
  narrative: string | null;
  /** What the narrative was inferred from. Rendered with it, always. */
  evidence: Evidence | null;
  /** Set when the human rewords Pulse's sentence. The human is right. */
  editedAt: Timestamp | null;
};
