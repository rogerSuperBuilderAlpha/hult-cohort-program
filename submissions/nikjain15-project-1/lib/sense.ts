/**
 * Pure sensing logic — no network, no Firestore, no model.
 *
 * Everything here is a pure function on purpose: this is the part of the product that
 * decides what Pulse asserts about a person, and it has to be testable exhaustively
 * without touching GitHub or spending a model call.
 */

import type { Evidence, GitHubLink, Status } from './types';

/**
 * May Pulse auto-write a sentence as this member, right now, without asking?
 *
 * Three gates, all required:
 *   - `narrationOptIn` — the absolute consent gate; a sentence about a person needs their
 *     yes.
 *   - a captured `handle` — no login, nothing to narrate.
 *   - `mode` is not `ask_first` — that mode's whole promise is "nothing goes out under
 *     your name until you say so". Auto-narrating in it makes the consent screen a lie.
 *
 * Pure and here (not in the client-only sync module) so it can be tested exhaustively —
 * this decides whether a model writes about someone, which is the line the product must
 * never cross by accident.
 */
export function autoNarrationAllowed(
  link: Pick<GitHubLink, 'narrationOptIn' | 'handle' | 'mode'> | null
): boolean {
  return narrationWanted(link) && link!.mode !== 'ask_first';
}

/**
 * Should Pulse GENERATE a sentence at all — to auto-publish OR to hold for approval?
 *
 * The two consenting modes, `auto` and `ask_first`, both want a sentence written; they
 * differ only in whether it publishes immediately or waits. So this is the model-call
 * gate (opt-in + a handle to attribute it to), and `autoNarrationAllowed` narrows it to
 * the publish-now case. `off` and declined want nothing and never reach here.
 */
export function narrationWanted(
  link: Pick<GitHubLink, 'narrationOptIn' | 'handle'> | null
): boolean {
  return !!link && link.narrationOptIn && !!link.handle;
}

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

/**
 * How many files two sets of paths share.
 *
 * The weak broker signal (LAYER-2-3-DESIGN.md, rung 2): "their problem touches files
 * you've shipped." GitHub paths are case-sensitive and already normalised, so this is an
 * exact-path intersection — a fuzzy match here would claim knowledge nobody has. Empty
 * paths never count, so a file with no name can't manufacture an overlap.
 */
export function fileOverlap(a: readonly string[], b: readonly string[]): number {
  const set = new Set(a.filter(Boolean));
  let n = 0;
  for (const f of b) if (f && set.has(f)) n += 1;
  return n;
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
 * Render evidence as a receipt: "6 commits · PR #41 · 2h from start to finish".
 *
 * Every inference renders with this. A legible mistake is forgivable; a mysterious one
 * isn't — and this line is the whole difference between the two.
 *
 * The span is phrased for a human, not a git log: "169h between first and last" made
 * first-run readers squint (and read as slightly surveillant). Long spans read in days.
 * The PR numbers stay verbatim — they're the checkable part of the receipt.
 */
export function formatEvidence(evidence: Evidence): string {
  const parts: string[] = [];

  if (evidence.commits > 0) parts.push(plural(evidence.commits, 'commit'));
  if (evidence.prNumbers.length > 0) {
    parts.push(evidence.prNumbers.map((n) => `PR #${n}`).join(', '));
  }
  if (evidence.spanHours !== null && evidence.spanHours >= 1) {
    const hours = Math.round(evidence.spanHours);
    parts.push(
      hours < 48
        ? `${hours}h from start to finish`
        : `about ${plural(Math.round(hours / 24), 'day')} from start to finish`
    );
  }

  return parts.join(' · ');
}

/* ------------------------------------------------------------ the fight */

/**
 * Thresholds for "that one took a while" — the trigger for the recipe offer.
 *
 * A recipe is worth writing exactly when someone just won a hard fight, and these two
 * numbers are how Pulse recognises one: many commits, or a long span between the work
 * starting and landing. Deliberately conservative — a missed offer costs nothing (the
 * recipes page still has "Bank it"), but offering after every trivial ship turns the
 * one gentle prompt into a nag, which the design forbids.
 *
 * Exported so the tests pin them: tuning these against real cohort data is expected,
 * silently drifting them is not.
 */
export const FIGHT_COMMITS = 6;
export const FIGHT_SPAN_HOURS = 24;

/**
 * Did this ship's evidence show a struggle worth keeping?
 *
 * Pure and threshold-only. This decides whether to OFFER — never whether to nag, repeat,
 * or auto-write anything. Zero-commit evidence with no span (the pulls list carries
 * neither without extra calls) simply never fires, which is the honest outcome: no
 * evidence of a fight, no claim there was one.
 */
export function looksLikeAFight(evidence: Pick<Evidence, 'commits' | 'spanHours'>): boolean {
  return (
    evidence.commits >= FIGHT_COMMITS ||
    (evidence.spanHours !== null && evidence.spanHours >= FIGHT_SPAN_HOURS)
  );
}

/** An offer expires: last week's fight is history, not an open moment of relief. */
export const OFFER_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type OfferShip = {
  id: string;
  kind: string;
  actorUid: string;
  taskId: string | null;
  /** The shipped task's title — what the offer names and the draft extracts. */
  subject: string;
  evidence: Pick<Evidence, 'commits' | 'spanHours' | 'prNumbers'> | null;
  ageMs: number;
};

export type RecipeOffer = {
  eventId: string;
  taskId: string | null;
  /** The PR to extract from. No PR, no evidence to draft from — but the offer still stands. */
  prNumber: number | null;
  title: string;
};

/**
 * The one recipe offer, or none. "That one took a while. Keep what worked?"
 *
 * The rules this encodes, each a promise from the design:
 * - **Own hard ships only.** The offer is about YOUR fight — never a nudge about a peer's.
 * - **One offer, the newest.** Two offers is a backlog of chores, and banking is
 *   generosity, not a chore.
 * - **Never repeated for the same work.** `dismissed` is the caller's memory (localStorage
 *   in practice); a dismissed offer is gone for good. Silence is always fine.
 * - **Never for work already banked.** A recipe with this taskId means the moment was
 *   kept; offering again would be a nag.
 * - **Recent only.** The moment of relief passes; a week later this would be homework.
 */
export function selectRecipeOffer(args: {
  ships: readonly OfferShip[];
  uid: string;
  bankedTaskIds: ReadonlySet<string>;
  dismissed: (eventId: string) => boolean;
}): RecipeOffer | null {
  const ship = args.ships.find(
    (s) =>
      s.kind === 'task_shipped' &&
      s.actorUid === args.uid &&
      s.ageMs >= 0 &&
      s.ageMs < OFFER_MAX_AGE_MS &&
      s.evidence !== null &&
      looksLikeAFight(s.evidence) &&
      !(s.taskId !== null && args.bankedTaskIds.has(s.taskId)) &&
      !args.dismissed(s.id)
  );

  if (!ship) return null;
  return {
    eventId: ship.id,
    taskId: ship.taskId,
    prNumber: ship.evidence?.prNumbers[0] ?? null,
    title: ship.subject,
  };
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

  // Fold BOTH the narrative and the names before matching. Injection's cheapest evasion is
  // typographic: a zero-width character spliced into a member's name ("Mar<U+200B>cus") or a
  // combining-mark variant ("Márcus") renders identically to a human but slips past a naive
  // word match — and the model can be steered by a commit message to emit exactly that. The
  // folded space is the space a reader actually sees.
  const foldedText = foldForMention(text);

  const actorTokens = new Set(
    [actor.handle, actor.displayName]
      .filter((v): v is string => !!v)
      .map(foldForMention)
  );

  for (const member of otherMembers) {
    for (const token of [member.handle, member.displayName]) {
      if (!token) continue;
      const folded = foldForMention(token);
      if (!folded) continue;
      // A member whose name IS the actor's name (or a substring of it) can't be
      // distinguished here; the actor's own tokens always win.
      if (actorTokens.has(folded)) continue;
      if (mentions(foldedText, folded)) return { ok: false, reason: 'names_another_member' };
    }
  }

  return { ok: true, narrative: text };
}

/**
 * Canonicalise text for the mention test: decompose compatibility forms, drop combining
 * marks, strip zero-width characters, lowercase. Mirrors `normaliseTitle`'s folding so the
 * two agree on what "the same name" means — but keeps word boundaries intact (unlike
 * `normaliseTitle`, which also collapses punctuation) because `mentions` needs them.
 *
 * Note: this does NOT fold cross-script homoglyphs (Cyrillic 'а' for Latin 'a') — that needs
 * a confusables table and is a documented residual. It closes the zero-width and
 * combining-mark evasions, which are the ones a model will actually emit from injected text.
 */
function foldForMention(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '') // combining marks
    .replace(/[\u200B-\u200F\u2060\uFEFF]/g, '') // zero-width + bidi controls
    .toLowerCase();
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

/**
 * Should this work be narrated, or has it already been?
 *
 * `narratedKeys` is the SET of everything Pulse has described for this member (a member
 * ships many PRs; each is its own key). Skip when this work's key is already in the set —
 * the skip that pays for the pilot. A single-slot cache remembered only the LAST work and
 * re-billed every earlier one; membership in the set fixes that.
 */
export function shouldNarrate(
  narratedKeys: readonly string[],
  handle: string,
  commitShas: readonly string[]
): boolean {
  if (commitShas.length === 0) return false;
  return !narratedKeys.includes(narrationCacheKey(handle, commitShas));
}

/* --------------------------------------------------- sensed card identity */

/**
 * The address of a sensed card: same work → same document, always.
 *
 * This is a CORRECTNESS boundary, not a tidiness one. Checking "does a card for this
 * branch exist?" and then creating one is a read-then-write, and every read-then-write
 * loses a race: two syncs both read "no card", both create, and the board grows a twin.
 * `addDoc` mints a fresh id every call, so nothing downstream can undo that. A derived id
 * makes the twin unrepresentable — the second writer addresses the document the first one
 * already made.
 *
 * The race is real and plural: a re-fired effect, the 15-minute poll overlapping a slow
 * run, and two open tabs (an in-memory guard is per-tab and cannot see the other one).
 * It shipped to production and put two identical PR #40 cards on the board.
 *
 * Same reasoning as `ensureMember` being a transaction — this codebase has been bitten by
 * exactly this shape before, and published `member_joined` twice for it.
 */
export function sensedTaskId(uid: string, dedupeKey: string): string {
  return `s_${uid}_${fnv1a(dedupeKey)}`;
}

/**
 * FNV-1a, 32-bit, as 8 hex chars.
 *
 * A hash rather than the branch name itself because a Firestore document id may not
 * contain `/`, and every branch here has several (`participants/summer26/...`). Escaping
 * would work until two branches escaped to the same string; a hash of the full name has a
 * uniform, vanishing collision chance across a cohort's worth of branches instead.
 *
 * Not cryptographic and doesn't need to be: this is an addressing scheme, not a secret.
 * Collisions are the only failure mode, and there is nothing to forge — the rules still
 * decide who may write, and a member can only ever create tasks as themselves.
 */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // The FNV prime, via shifts: Math.imul keeps this in 32-bit space, where plain `*`
    // would silently drift into float territory and stop being deterministic.
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
