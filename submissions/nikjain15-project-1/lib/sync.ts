'use client';

import type { SenseResponse, SensedPull } from '@/app/api/sense/route';
import {
  announceSensedShip,
  createSensedTask,
  ensureRepoProject as ensureSharedRepoProject,
  setSensedStatusSilently,
  setTaskStatus,
  type Narration,
} from './data';
import { markWorkNarrated } from './github-link';
import { COHORT_REPO_NAME } from './github-repo';
import type { NarrationResult } from './narrate';
import { autoNarrationAllowed, branchToTitle, findDuplicate, inferStatus, narrationWanted, type GitHubSignal } from './sense';
import type { Evidence, GitHubLink, Member, Project, Task } from './types';

type Actor = { uid: string; name: string; photoURL: string | null };

/** Just enough of the cohort for checkNarrative to reject a sentence naming anyone else. */
type CohortNames = Pick<Member, 'uid' | 'handle' | 'displayName'>[];

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
  /**
   * We reached GitHub but couldn't write the board. Distinct from `degraded` because
   * blaming the network for a permissions or offline failure sends people to look in the
   * wrong place — and the partial counts matter: some cards may already have landed.
   */
  | { kind: 'write_failed'; created: number; moved: number }
  /** Connected, but the GitHub login was never captured. A failure, not a choice. */
  | { kind: 'no_handle' }
  /** Not connected, or task-building switched off in Settings. Not an error. */
  | { kind: 'off' };

export async function syncFromGitHub(input: {
  actor: Actor;
  link: GitHubLink | null;
  tasks: Task[];
  projects: Project[];
  /** The cohort, so a narrative that names anyone but the actor can be rejected. */
  members: CohortNames;
}): Promise<SyncOutcome> {
  const { actor, link, tasks, projects } = input;

  // Settings is not decoration: `off` here means off. `createTasksFromBranches` false
  // still allows status inference on cards Pulse already knows about (spec §9), but it
  // must never invent a new one.
  if (!link || link.status !== 'connected') return { kind: 'off' };

  /**
   * Connected, but we never captured the GitHub login — `saveConsent` writes '' when it
   * wasn't available, and the login only exists on `getAdditionalUserInfo()` at sign-in.
   *
   * This is NOT `off`. `off` means you chose this; this means we lost something and can
   * do nothing, while Settings cheerfully says "connected". Silence there is the failure
   * mode where a member consents, sees nothing happen forever, and concludes the product
   * is broken — which it is, quietly. Say it out loud instead.
   */
  if (!link.handle) return { kind: 'no_handle' };

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

  /**
   * ONLY MY OWN WORK. This scoping is load-bearing, not a tidy-up.
   *
   * `tasks` is the whole cohort's — `subscribeToTasks` is unfiltered, because the board is
   * shared by design. Matching an inferred title against that list let my sync mutate
   * SOMEONE ELSE'S card: a peer hand-writes "Fix the build", I open a PR called "Fix the
   * build", and my sync moves their card and (after the backfill) publishes "I shipped" it
   * to 64 feeds. Confirmed in a browser against a real cohort PR title, not hypothesised —
   * the victim's manual card went todo → done, completedAt set, creatorUid still theirs.
   *
   * The rules can't catch this: I'm a signed-in member, I'm not rewriting authorship, and
   * I genuinely am the actor on the event. Every write is legal. It's this list that was
   * wrong. Same trap as the guessed handle in AGENTS.md — one person's work attached to
   * another — reached through the dedupe instead.
   */
  const mine = tasks.filter((t) => t.creatorUid === actor.uid || t.assigneeUid === actor.uid);

  let projectId: string | null = findRepoProject(projects)?.id ?? null;
  let created = 0;
  let moved = 0;

  // Cards created during THIS run. `mine` is a listener snapshot taken before the loop, so
  // it never sees them: two PRs on one branch, or two titles that normalise the same, would
  // each miss the other's card and twin it.
  const fresh: Task[] = [];

  try {
    for (const pull of winningPulls(response.pulls)) {
      const title = titleFor(pull);
      const existing = matchTask([...mine, ...fresh], pull, title);
      const inference = inferStatus(signalFor(pull));

      if (!existing) {
        if (!link.createTasksFromBranches) continue;

        // Created lazily: a member with no sensed work gets no empty project they didn't ask
        // for, and the first card is what makes the project mean something.
        projectId ??= await ensureRepoProject(actor);
        const { id, created: didCreate, tombstoned } = await createSensedTask(actor, {
          projectId,
          title,
          description: `Pulse built this from ${pull.branch ? `\`${pull.branch}\`` : `PR #${pull.number}`}. Edit or delete it — it's yours.`,
          status: inference.status,
          evidence: evidenceFor(pull),
          branch: pull.branch,
          dedupeKey: dedupeKeyFor(pull),
        });
        // The member deleted this card on purpose. Respect it: don't rebuild (the
        // transaction already refused), and don't add a phantom to the same-run dedupe
        // list — a later pull matching this title would try to move a card that no longer
        // exists.
        if (tombstoned) continue;
        // Only push to `fresh` (the same-run dedupe list) when the card really exists —
        // but count only a real write. A no-op means the card already existed, and telling
        // the member "Pulse built 1 card" when it built zero is the receipt lying about
        // itself.
        fresh.push({ id, title, branch: pull.branch, status: inference.status } as Task);
        if (didCreate) {
          created += 1;
          // Fast PR: opened AND merged inside one poll window, so the card is born at
          // `done` and the transition path never runs. Announce the ship here — unless
          // this is the backfill, which is silent by design. Idempotent via `ship_<id>`.
          if (!backfilling && inference.status === 'done') {
            const narration = await narrateShip(input, pull, title);
            await announceSensedShip(actor, { id, title, projectId: projectId!, evidence: evidenceFor(pull) }, narration);
          }
        }
        continue;
      }

      if (existing.status === inference.status) continue;

      // The human wins. A card a person moved to `done` by hand must not be dragged back
      // by a still-open PR on the next poll: Pulse advances cards, it never overrules a
      // completion. (A genuine merge infers `done` too, so this only ever blocks a
      // regression OUT of done, never a legitimate ship.)
      if (existing.status === 'done' && inference.status !== 'done') continue;

      if (backfilling) {
        await setSensedStatusSilently(existing.id, inference.status);
      } else {
        // The only path that logs task_started / task_shipped and sets completedAt.
        // A PR closed unmerged infers `todo` and logs nothing — the feed is a record of
        // progress, never a place to be embarrassed.
        //
        // Narration rides along ONLY on a ship, and only with consent. Everything else
        // publishes facts.
        const narration =
          inference.status === 'done' ? await narrateShip(input, pull, title) : undefined;
        await setTaskStatus(actor, existing, inference.status, narration);
      }
      moved += 1;
    }
  } catch (err) {
    // Firestore rejects on permission-denied, offline, or a failed precondition. This used
    // to escape and leave `outcome` null, which renders NOTHING — a board that quietly
    // stopped updating, which is the exact failure SyncNote exists to prevent. Say it.
    console.error('sync: write failed', err);
    return { kind: 'write_failed', created, moved };
  }

  return { kind: 'synced', created, moved, at: new Date() };
}

/**
 * One PR per branch: the one that decides the card's state.
 *
 * A branch legitimately has several PRs — the first attempt abandoned, the second merged.
 * Processing both let an abandoned PR outrank the merged one, so the card flapped
 * done→todo→done on every poll and re-announced "shipped!" to the cohort each time it
 * bounced back. Merged is the strongest signal and it is terminal: once work has landed,
 * a closed sibling PR says nothing about it.
 */
function winningPulls(pulls: SensedPull[]): SensedPull[] {
  const rank = (p: SensedPull) => (p.merged ? 3 : p.state === 'open' ? 2 : 1);
  const best = new Map<string, SensedPull>();

  for (const pull of pulls) {
    // No branch → nothing to collide with; key on the PR itself.
    const key = pull.branch ?? `#${pull.number}`;
    const held = best.get(key);
    if (!held || rank(pull) > rank(held) || (rank(pull) === rank(held) && pull.number > held.number)) {
      best.set(key, pull);
    }
  }

  return [...best.values()];
}

/**
 * One sentence about what you shipped — or nothing, which is always allowed.
 *
 * **The gate is `narrationOptIn`, and it is absolute.** A model-written sentence about a
 * member requires that member's opt-in; no exceptions, and this is about the actor
 * themselves, so their own `githubLinks` doc is the authoritative answer (types.ts).
 * Off is not the same as disconnected: sensing still runs, cards still move, and nothing
 * gets written about you.
 *
 * **`ask_first` holds the sentence for approval — it does not skip it.** The consent
 * screen promises "nothing goes out under your name until you say so." So `ask_first`
 * still writes a sentence (this function returns it), but marks it `pending`: the ship
 * publishes its FACTS immediately and parks the sentence as a proposal only the actor
 * sees, on their Home, to approve or dismiss. `auto` publishes the sentence at once. Both
 * require opt-in; the difference is the `pending` bit, routed downstream by
 * `narrationFields`. This is the queue the consent screen always described.
 *
 * Every failure lands on facts-only, silently. Never publish a suspect sentence, never
 * surface a scary error in the feed — the facts came from the API and cannot be wrong.
 *
 * The cache key is the identity of the WORK, not commit SHAs: this pipeline reads the
 * PR list, which carries no commit range without an extra call per PR. Same contract —
 * unchanged work means nothing new to say and no model call — but named honestly.
 */
async function narrateShip(
  input: { actor: Actor; link: GitHubLink | null; members: CohortNames },
  pull: SensedPull,
  title: string
): Promise<Narration | undefined> {
  const { actor, link, members } = input;
  // Generate for BOTH consenting modes — `auto` and `ask_first` both want a sentence
  // written; they differ only in whether it publishes now or waits. `pending` carries that
  // difference downstream, where one place routes it to `narrative` vs `proposedNarrative`.
  if (!narrationWanted(link) || !link) return undefined;
  const pending = !autoNarrationAllowed(link);

  const evidence = evidenceFor(pull);
  const workId = [`pr-${pull.number}`, pull.merged ? 'merged' : pull.state];

  try {
    const res = await fetch('/api/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle: link.handle,
        displayName: actor.name,
        evidence,
        // Public GitHub text, and attacker-controlled: a PR title is whatever someone typed.
        material: [title, pull.branch].filter(Boolean),
        commitShas: workId,
        // checkNarrative needs these to reject a sentence naming anyone but the actor —
        // injection's entire payoff.
        otherMembers: members.filter((m) => m.uid !== actor.uid).map(({ handle, displayName }) => ({ handle, displayName })),
        narratedKeys: link.narratedWorkKeys ?? [],
      }),
    });

    if (!res.ok) return { narrative: null, evidence, pending };

    const result = (await res.json()) as NarrationResult;
    if (result.kind !== 'narrated') return { narrative: null, evidence, pending };

    // Remember THIS work — add it to the set, never overwrite. A member ships many PRs;
    // remembering only the last re-bills and re-announces every earlier one.
    await markWorkNarrated(actor.uid, result.cacheKey).catch(() => {});
    return { narrative: result.narrative, evidence, pending };
  } catch {
    return { narrative: null, evidence, pending };
  }
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

/**
 * What counts as "the same work" — the branch, or the PR when there is no branch.
 *
 * The branch first, matching `matchTask`: the two must agree, or the fast path and the
 * transaction backstop would disagree about identity and the backstop would stop backing
 * anything up. A deleted branch on a merged PR is the case with no branch to key on, and
 * the PR number is stable there.
 */
function dedupeKeyFor(pull: SensedPull): string {
  return pull.branch ?? `pr-${pull.number}`;
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
 *
 * The span here is PR opened → merged — the work item's own start-to-finish, which the
 * list carries for free. Only a MERGED pull gets one: an open PR's span grows with every
 * poll, and a receipt that quietly rewrites itself is the stale-as-live failure in
 * miniature. This span is also what `looksLikeAFight` reads, so the recipe offer can
 * recognise a hard ship without an extra API call per PR.
 */
function evidenceFor(pull: SensedPull): Evidence {
  let spanHours: number | null = null;
  if (pull.merged && pull.mergedAt) {
    const span = (new Date(pull.mergedAt).getTime() - new Date(pull.createdAt).getTime()) / 3_600_000;
    if (Number.isFinite(span) && span >= 0) spanHours = span;
  }
  return { commits: 0, prNumbers: [pull.number], files: [], spanHours };
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
  // Transactional and keyed by the repo — two members connecting at once must land on one
  // shared project, not two called the same thing. See `ensureRepoProject` in data.ts.
  return ensureSharedRepoProject(actor, {
    repo: COHORT_REPO_NAME,
    description: 'Sensed from GitHub. Cards here were built from your branches and PRs.',
  });
}
