/**
 * Pure sensing logic — no network, no Firestore, no model.
 *
 * Everything here is a pure function on purpose: this is the part of the product that
 * decides what Pulse asserts about a person, and it has to be testable exhaustively
 * without touching GitHub or spending a model call.
 */

import type { Evidence, Status } from './types';

export type { Evidence };

/* ------------------------------------------------------------ branch → title */

/**
 * Branch prefixes that carry no meaning in a task title.
 *
 * Slash-delimited ONLY. A hyphen here would eat the first real word: `fix-oauth-redirect`
 * is a task called "Fix oauth redirect", not "Oauth redirect" — the `fix` is the verb, not
 * a namespace. Same trap for any branch starting `test-`, `docs-`, `build-`.
 */
const BRANCH_PREFIXES = /^(feat|feature|fix|bugfix|hotfix|chore|docs|refactor|test|ci|build|perf|style)\//i;

/**
 * Turn a branch name into a human task title.
 *
 * `feat/fix-oauth-redirect` → "Fix oauth redirect".
 *
 * Deliberately not title-case: sentence case reads as prose, and the spec says the PR
 * title supersedes this whenever one exists — a branch name is the fallback, not the goal.
 */
export function branchToTitle(branch: string): string {
  if (!branch) return '';

  // Strip a leading remote ref and any number of stacked prefixes (feat/fix/...).
  let name = branch.replace(/^refs\/heads\//, '');
  let previous: string;
  do {
    previous = name;
    name = name.replace(BRANCH_PREFIXES, '');
  } while (name !== previous);

  // Any remaining path separators are word boundaries too.
  const words = name
    .split(/[-_/\s]+/)
    .map((w) => w.trim())
    .filter(Boolean);

  if (words.length === 0) return '';

  const sentence = words.join(' ');
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/* ---------------------------------------------------------------- dedupe */

/**
 * Normalise a title for dedupe comparison.
 *
 * An inferred task matching an existing manual task must UPDATE it, never twin it —
 * twins are how an "it updates itself" board becomes noise the user has to clean up.
 * Case, punctuation and whitespace are all noise for that comparison.
 */
export function normaliseTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function titlesMatch(a: string, b: string): boolean {
  const na = normaliseTitle(a);
  // An empty normalisation (e.g. a punctuation-only title) must never match another
  // empty one — that would merge two unrelated tasks.
  return na.length > 0 && na === normaliseTitle(b);
}

/** Find an existing task an inferred title should update rather than duplicate. */
export function findDuplicate<T extends { id: string; title: string }>(
  candidates: readonly T[],
  inferredTitle: string
): T | null {
  return candidates.find((t) => titlesMatch(t.title, inferredTitle)) ?? null;
}

/* ------------------------------------------------------ status inference */

export type GitHubSignal =
  | { type: 'branch_pushed' }
  | { type: 'commit_pushed' }
  | { type: 'pr_opened' }
  | { type: 'pr_merged' }
  | { type: 'pr_closed_unmerged' };

export type StatusInference = {
  status: Status;
  /** null means: change the card, log nothing. */
  event: 'task_started' | 'task_shipped' | null;
  completed: boolean;
};

/**
 * Map a GitHub signal to a board state.
 *
 * The one that matters: a PR closed without merging moves the card back to `todo` and
 * logs NOTHING. The feed is a record of progress, never a place to be embarrassed —
 * abandoning something is not news the cohort needs.
 */
export function inferStatus(signal: GitHubSignal): StatusInference {
  switch (signal.type) {
    case 'branch_pushed':
      return { status: 'todo', event: null, completed: false };
    case 'commit_pushed':
      return { status: 'in_progress', event: 'task_started', completed: false };
    case 'pr_opened':
      return { status: 'in_progress', event: null, completed: false };
    case 'pr_merged':
      return { status: 'done', event: 'task_shipped', completed: true };
    case 'pr_closed_unmerged':
      return { status: 'todo', event: null, completed: false };
  }
}

/* ------------------------------------------------------------- evidence */

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * Render evidence as a receipt: "6 commits · PR #41 · 2h between first and last".
 *
 * Every inference renders with this. A legible mistake is forgivable; a mysterious one
 * isn't — and this line is the whole difference between the two.
 */
export function formatEvidence(evidence: Evidence): string {
  const parts: string[] = [];

  if (evidence.commits > 0) parts.push(plural(evidence.commits, 'commit'));
  if (evidence.prNumbers.length > 0) {
    parts.push(evidence.prNumbers.map((n) => `PR #${n}`).join(', '));
  }
  if (evidence.spanHours !== null && evidence.spanHours >= 1) {
    parts.push(`${Math.round(evidence.spanHours)}h between first and last`);
  }

  return parts.join(' · ');
}

/* ---------------------------------------------------------- relative time */

/** "just now" · "6m ago" · "2h ago" · "3d ago". Past tense; Pulse reports, it doesn't predict. */
export function relativeTime(then: Date, now: Date = new Date()): string {
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 0) return 'just now';
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

/* -------------------------------------------------- the standing ask ladder */

export type AskContext = {
  brokerMatch: { helperName: string; problem: string } | null;
  weakMatch: { problem: string } | null;
  unclaimedTask: { id: string; title: string } | null;
  oldestInProgress: { id: string; title: string } | null;
};

export type Ask =
  | { kind: 'broker'; helperName: string; problem: string }
  | { kind: 'weak_match'; problem: string }
  | { kind: 'unclaimed'; taskId: string; title: string }
  | { kind: 'your_task'; taskId: string; title: string }
  | { kind: 'nothing' };

/**
 * Home carries EXACTLY ONE ask. First rule that matches wins.
 *
 * Two asks is a backlog, and a backlog is what this product deleted. The ladder is
 * ordered so the social asks outrank the personal ones: "help a named person" motivates
 * contribution, "finish your task" is a to-do list.
 *
 * The floor is honest rather than manufactured. If there is genuinely nothing, Pulse says
 * so — inventing an ask to fill the space is how a tool starts lying to look busy.
 */
export function selectAsk(ctx: AskContext): Ask {
  if (ctx.brokerMatch) {
    return {
      kind: 'broker',
      helperName: ctx.brokerMatch.helperName,
      problem: ctx.brokerMatch.problem,
    };
  }
  if (ctx.weakMatch) return { kind: 'weak_match', problem: ctx.weakMatch.problem };
  if (ctx.unclaimedTask) {
    return { kind: 'unclaimed', taskId: ctx.unclaimedTask.id, title: ctx.unclaimedTask.title };
  }
  if (ctx.oldestInProgress) {
    return {
      kind: 'your_task',
      taskId: ctx.oldestInProgress.id,
      title: ctx.oldestInProgress.title,
    };
  }
  return { kind: 'nothing' };
}

/* --------------------------------------------- narrative safety (injection) */

export const NARRATIVE_MAX_CHARS = 200;

export type NarrativeRejection =
  | 'empty'
  | 'too_long'
  | 'contains_markup'
  | 'names_another_member';

export type NarrativeCheck =
  | { ok: true; narrative: string }
  | { ok: false; reason: NarrativeRejection };

/**
 * Validate a model-written narrative before it is published to 64 people.
 *
 * Pulse reads attacker-controlled text (commit messages, PR titles, branch names), feeds
 * it to a model, and auto-publishes the output with no human in the loop. The old
 * approve-first design had a human as the backstop. This one doesn't, so this function is
 * the backstop.
 *
 * The critical rule is `names_another_member`: injection's payoff is publishing an insult
 * about SOMEONE ELSE. An actor's commits may only ever produce sentences about that actor.
 *
 * On any failure the caller publishes FACTS ONLY, silently — never a suspect narrative,
 * never a scary error in the feed.
 */
export function checkNarrative(
  narrative: string,
  actor: { handle: string | null; displayName: string },
  otherMembers: readonly { handle: string | null; displayName: string }[]
): NarrativeCheck {
  const text = narrative.trim();

  if (!text) return { ok: false, reason: 'empty' };
  if (text.length > NARRATIVE_MAX_CHARS) return { ok: false, reason: 'too_long' };

  // No markdown, no HTML. React escapes by default and we never opt out with
  // dangerouslySetInnerHTML — this is belt and braces, and it also catches a model
  // that started emitting formatting instead of a sentence.
  if (/[<>]|\[.*\]\(.*\)|[*_`#]{2,}|^[*\-#>]\s/m.test(text)) {
    return { ok: false, reason: 'contains_markup' };
  }

  const actorTokens = new Set(
    [actor.handle, actor.displayName]
      .filter((v): v is string => !!v)
      .map((v) => v.toLowerCase())
  );

  for (const member of otherMembers) {
    for (const token of [member.handle, member.displayName]) {
      if (!token) continue;
      const lower = token.toLowerCase();
      // A member whose name IS the actor's name (or a substring of it) can't be
      // distinguished here; the actor's own tokens always win.
      if (actorTokens.has(lower)) continue;
      if (mentions(text, lower)) return { ok: false, reason: 'names_another_member' };
    }
  }

  return { ok: true, narrative: text };
}

/**
 * Whole-word (or @handle) mention test.
 *
 * Substring matching would reject "Nikhil started the refactor" for a member called "Nik".
 * Word boundaries keep the check precise enough to be trusted rather than worked around.
 */
function mentions(text: string, token: string): boolean {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^\\p{L}\\p{N}_])@?${escaped}($|[^\\p{L}\\p{N}_])`, 'iu').test(text);
}

/* ---------------------------------------------------------- narration cache */

/**
 * Cache key for a member's narration: the exact commit range it describes.
 *
 * This is a BUDGET requirement, not an optimisation. Uncached, 65 members on a 15-minute
 * poll is ~6,240 model calls/day (~$12.48/day, ~$524 over the pilot) against ~$11 of
 * credit. Cached by SHA range, it's ~325 calls/day (~$0.65). A cache miss on an unchanged
 * range is a bug, not an inefficiency.
 *
 * Sorted because GitHub's ordering isn't guaranteed stable and the same set of commits
 * must always produce the same key.
 */
export function narrationCacheKey(handle: string, commitShas: readonly string[]): string {
  const sorted = [...commitShas].sort();
  return `${handle.toLowerCase()}:${sorted.join(',')}`;
}

/** No new commits → no model call at all. The skip that pays for the pilot. */
export function shouldNarrate(
  cachedKey: string | null,
  handle: string,
  commitShas: readonly string[]
): boolean {
  if (commitShas.length === 0) return false;
  return cachedKey !== narrationCacheKey(handle, commitShas);
}
