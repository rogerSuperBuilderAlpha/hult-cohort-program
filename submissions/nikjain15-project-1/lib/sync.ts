'use client';

import type { SenseResponse, SensedPull } from '@/app/api/sense/route';
import { createProject, createSensedTask, setSensedStatusSilently, setTaskStatus } from './data';
import { COHORT_REPO_NAME } from './github-repo';
import { branchToTitle, findDuplicate, inferStatus, type GitHubSignal } from './sense';
import type { Evidence, GitHubLink, Project, Task } from './types';

type Actor = { uid: string; name: string; photoURL: string | null };

/**
 * The board builds itself. DESIGN-SPEC §4 — this is the product's whole claim.
 *
 * **This runs in the BROWSER, on purpose.** Firestore rules require a signed-in user for
 * every write and there is no Admin SDK here, so the server has no identity to write as.
 * The secret half (the GitHub token) stays behind /api/sense; the writes happen as you.
 * A card that shows up on your board was created by you, which is also the honest shape.
 *
 * Never throws. Sensing that fails must leave a working manual board behind — that's the
 * first non-negotiable, and every early return here obeys it.
 */

export type SyncOutcome =
  | { kind: 'synced'; created: number; moved: number; at: Date }
  /** Say so out loud. Never present a stale board as a live one. */
  | { kind: 'degraded'; failure: 'rate_limited' | 'unreachable'; resetAt: Date | null }
  /** Not connected, or task-building switched off in Settings. Not an error. */
  | { kind: 'off' };

export async function syncFromGitHub(input: {
  actor: Actor;
  link: GitHubLink | null;
  tasks: Task[];
  projects: Project[];
}): Promise<SyncOutcome> {
  const { actor, link, tasks, projects } = input;

  // Settings is not decoration: `off` here means off. `createTasksFromBranches` false
  // still allows status inference on cards Pulse already knows about (spec §9), but it
  // must never invent a new one.
  if (!link || link.status !== 'connected' || !link.handle) return { kind: 'off' };

  const response = await fetchSense(link.handle);
  if (!response) return { kind: 'degraded', failure: 'unreachable', resetAt: null };
  if (!response.ok) {
    return {
      kind: 'degraded',
      failure: response.failure,
      resetAt: response.resetAt ? new Date(response.resetAt) : null,
    };
  }

  // First sync = backfill. Someone's PR history is not news, and firing "shipped!" into
  // 64 feeds for last week's merges is exactly the stale-as-live failure the feed forbids.
  const backfilling = link.lastSyncedAt === null;

  let projectId: string | null = findRepoProject(projects)?.id ?? null;
  let created = 0;
  let moved = 0;

  for (const pull of response.pulls) {
    const title = titleFor(pull);
    const existing = matchTask(tasks, pull, title);
    const inference = inferStatus(signalFor(pull));

    if (!existing) {
      if (!link.createTasksFromBranches) continue;

      // Created lazily: a member with no sensed work gets no empty project they didn't ask
      // for, and the first card is what makes the project mean something.
      projectId ??= await ensureRepoProject(actor);
      await createSensedTask(actor, {
        projectId,
        title,
        description: `Pulse built this from ${pull.branch ? `\`${pull.branch}\`` : `PR #${pull.number}`}. Edit or delete it — it's yours.`,
        status: inference.status,
        evidence: evidenceFor(pull),
        branch: pull.branch,
      });
      created += 1;
      continue;
    }

    if (existing.status === inference.status) continue;

    if (backfilling) {
      await setSensedStatusSilently(existing.id, inference.status);
    } else {
      // The only path that logs task_started / task_shipped and sets completedAt.
      // A PR closed unmerged infers `todo` and logs nothing — the feed is a record of
      // progress, never a place to be embarrassed.
      await setTaskStatus(actor, existing, inference.status);
    }
    moved += 1;
  }

  return { kind: 'synced', created, moved, at: new Date() };
}

/** Never throws: a dead route must degrade, not break the board. */
async function fetchSense(handle: string): Promise<SenseResponse | null> {
  try {
    const res = await fetch(`/api/sense?handle=${encodeURIComponent(handle)}`);
    if (!res.ok) return null;
    return (await res.json()) as SenseResponse;
  } catch {
    return null;
  }
}

/**
 * The PR title wins over the branch name whenever there is one.
 *
 * `branchToTitle` is the fallback, not the goal — a human wrote the PR title, and Pulse
 * deferring to it is the same rule as the human always being right about the wording.
 */
function titleFor(pull: SensedPull): string {
  const fromPull = pull.title.trim();
  if (fromPull) return fromPull;
  return pull.branch ? branchToTitle(pull.branch) : `PR #${pull.number}`;
}

/**
 * Match against a card Pulse already made (by branch — the stable key), and failing that
 * against a card the human made by hand (by title).
 *
 * The second half is the one that matters: an inferred task that matches a manual task
 * must UPDATE it, never twin it. Twins are how an "it updates itself" board turns into
 * noise you have to clean up, which is the exact failure this product exists to avoid.
 */
function matchTask(tasks: Task[], pull: SensedPull, title: string): Task | null {
  if (pull.branch) {
    const byBranch = tasks.find((t) => t.branch === pull.branch);
    if (byBranch) return byBranch;
  }
  return findDuplicate(tasks, title);
}

function signalFor(pull: SensedPull): GitHubSignal {
  if (pull.merged) return { type: 'pr_merged' };
  if (pull.state === 'closed') return { type: 'pr_closed_unmerged' };
  return { type: 'pr_opened' };
}

/**
 * Facts, and only the ones the PR list actually gives us.
 *
 * `commits: 0` is deliberate and honest: the pulls endpoint doesn't carry a commit count
 * without an extra call per PR, and `formatEvidence` omits a zero rather than printing
 * "0 commits". Inflating it with a guess would make the receipt a lie, which defeats the
 * only thing a receipt is for.
 */
function evidenceFor(pull: SensedPull): Evidence {
  return { commits: 0, prNumbers: [pull.number], files: [], spanHours: null };
}

function findRepoProject(projects: Project[]): Project | undefined {
  return projects.find((p) => !p.archived && p.name === COHORT_REPO_NAME);
}

/**
 * "Connected repos become projects" — spec §7.
 *
 * Silent: the human didn't create this, Pulse did, and a feed row claiming otherwise is a
 * small lie in the one product whose whole case rests on not telling them.
 */
async function ensureRepoProject(actor: Actor): Promise<string> {
  return createProject(
    actor,
    {
      name: COHORT_REPO_NAME,
      description: 'Sensed from GitHub. Cards here were built from your branches and PRs.',
    },
    { silent: true }
  );
}
