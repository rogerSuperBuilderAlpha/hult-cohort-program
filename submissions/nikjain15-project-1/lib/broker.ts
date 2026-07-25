import { fileOverlap, titlesMatch } from './sense';

/**
 * The Broker's matching core — LAYER-2-3-DESIGN.md, Layer 3.
 *
 * Given people who are visibly stuck and people who have shown they know the answer,
 * pick at most ONE helper for each stuck person. Pure, deterministic, and the safest
 * place to hold the ethic, because it has no way to write anything — it proposes drafts
 * a trusted server job then upserts. No Firestore, no Admin SDK, no clock, no randomness.
 *
 * The whole product ethic lives in what this function is NOT given: it never receives
 * "who is quiet", "who hasn't pushed", or any absence signal. A `StuckSignal` describes
 * *visible activity* — an explicit "I'm stuck" opt-in, or a branch/task that is busy and
 * aging — never inactivity. Inferring stuck from silence is the surveillance line the
 * design refuses to cross, so the type makes it unrepresentable: there is no field here
 * for "last seen" or "days quiet".
 *
 * The asymmetry this enforces (the rest is the rules' job and the UI's job):
 * - **One helper per stuck person.** Not a broadcast — a single private offer.
 * - **Never the stuck person themselves**, and never someone who opted out of helping.
 * - **Recipe author beats file-toucher.** Someone who already wrote the answer is a
 *   better ask than someone who merely touched the same files.
 * - **Spread the load.** A cap per helper so the most generous people aren't buried —
 *   quietly punishing helpfulness is the same anti-pattern as punishing the quiet,
 *   inverted.
 */

/**
 * A person who is visibly stuck. Every field is public activity or an explicit ask —
 * never an absence. `source` is the confidence: an opt-in is a dignified, deliberate
 * request for help; aging WIP is a low-confidence guess and is served only after every
 * opt-in has been matched.
 */
export type StuckSignal = {
  stuckUid: string;
  /** The problem, from a task title or a branch — visible, not inferred from silence. */
  problem: string;
  /** Files the in-progress work touches, if known. Empty is fine; it just weakens matching. */
  files: readonly string[];
  source: 'opt_in' | 'aging_wip';
};

/** What a candidate helper has visibly shown they know. Assembled by the caller from
 * public record: their banked recipes and the files/titles of their merged work. */
export type HelperKnowledge = {
  uid: string;
  /** Banked recipes — the strong signal. A recipe IS the answer, already written. */
  recipes: readonly { id: string; problem: string }[];
  /** Files across their merged work — the weak signal. */
  shippedFiles: readonly string[];
  /** Titles of their merged work — a second weak signal (same problem, no shared files). */
  shippedTitles: readonly string[];
  /**
   * Receiving help offers is default-on (they're private and dismissible), so this is an
   * explicit opt-OUT. A helper who set it is never matched — generosity is offered, never
   * demanded.
   */
  brokerOptOut: boolean;
  /** Open intros this helper already holds (suggested or sent). Feeds the load cap. */
  activeIntros: number;
};

/** A proposed introduction — what the server job will idempotently upsert. */
export type IntroductionDraft = {
  stuckUid: string;
  helperUid: string;
  /** Set only on a recipe match — the answer to point the helper at. */
  recipeId: string | null;
  problem: string;
  /** Which signal matched, for ranking and for the upsert's idempotency key. */
  strength: 'recipe' | 'files';
};

/**
 * Default cap. Two open offers is enough to be useful without turning a helpful person
 * into a support queue. Exported so a test pins it and tuning is a decision, not drift.
 */
export const MAX_INTROS_PER_HELPER = 2;

type Scored = { helper: HelperKnowledge; recipeId: string | null; strength: 'recipe' | 'files' };

/**
 * Score one helper against one stuck problem, or reject them.
 *
 * A recipe whose problem matches wins outright (`strength: 'recipe'`, carrying the id).
 * Failing that, a file overlap or a matching shipped title is a weak match
 * (`strength: 'files'`). No signal → null, and this helper is not a candidate.
 */
function scoreHelper(helper: HelperKnowledge, signal: StuckSignal): Scored | null {
  const recipe = helper.recipes.find((r) => titlesMatch(r.problem, signal.problem));
  if (recipe) return { helper, recipeId: recipe.id, strength: 'recipe' };

  const touchesFiles = fileOverlap(helper.shippedFiles, signal.files) > 0;
  const knowsTitle = helper.shippedTitles.some((t) => titlesMatch(t, signal.problem));
  if (touchesFiles || knowsTitle) return { helper, recipeId: null, strength: 'files' };

  return null;
}

/**
 * Match stuck people to helpers — at most one introduction per stuck person.
 *
 * Deterministic: opt-in signals first (they deserve the scarce helper capacity), then
 * aging WIP; within each, input order. For each signal the best eligible helper is chosen
 * — recipe author over file-toucher, and among equals the one carrying the fewest intros
 * (load-spread), tie-broken by uid so runs are reproducible. Choosing a helper counts
 * against their cap for the rest of this run, so one poll can't hand the same person five
 * offers.
 *
 * Returns the drafts; the caller upserts them idempotently. Never mutates its inputs.
 */
export function matchIntroductions(args: {
  signals: readonly StuckSignal[];
  helpers: readonly HelperKnowledge[];
  capPerHelper?: number;
}): IntroductionDraft[] {
  const cap = args.capPerHelper ?? MAX_INTROS_PER_HELPER;

  // A per-run tally of intros assigned so far, seeded with what each helper already holds.
  const load = new Map<string, number>(args.helpers.map((h) => [h.uid, h.activeIntros]));

  // Opt-in is the strongest, least ambiguous signal — serve it before any guess.
  const ordered = [
    ...args.signals.filter((s) => s.source === 'opt_in'),
    ...args.signals.filter((s) => s.source === 'aging_wip'),
  ];

  const drafts: IntroductionDraft[] = [];

  for (const signal of ordered) {
    const candidates = args.helpers
      .filter((h) => h.uid !== signal.stuckUid && !h.brokerOptOut)
      .filter((h) => (load.get(h.uid) ?? 0) < cap)
      .map((h) => scoreHelper(h, signal))
      .filter((s): s is Scored => s !== null);

    if (candidates.length === 0) continue;

    // Recipe beats files; then fewer open intros (spread load); then uid for stability.
    candidates.sort((a, b) => {
      if (a.strength !== b.strength) return a.strength === 'recipe' ? -1 : 1;
      const la = load.get(a.helper.uid) ?? 0;
      const lb = load.get(b.helper.uid) ?? 0;
      if (la !== lb) return la - lb;
      return a.helper.uid < b.helper.uid ? -1 : 1;
    });

    const best = candidates[0];
    load.set(best.helper.uid, (load.get(best.helper.uid) ?? 0) + 1);
    drafts.push({
      stuckUid: signal.stuckUid,
      helperUid: best.helper.uid,
      recipeId: best.recipeId,
      problem: signal.problem,
      strength: best.strength,
    });
  }

  return drafts;
}

/**
 * The idempotency key for a draft. The server job upserts on this so re-runs don't spam:
 * the same stuck person, the same helper, the same problem is one introduction, written
 * once. Problem is folded to its normalised form via `titlesMatch`'s logic — but keyed
 * here on the raw triple, since the caller stores the raw problem on the doc.
 */
export function introKey(draft: Pick<IntroductionDraft, 'stuckUid' | 'helperUid' | 'problem'>): string {
  return `${draft.stuckUid}::${draft.helperUid}::${draft.problem.trim().toLowerCase()}`;
}
