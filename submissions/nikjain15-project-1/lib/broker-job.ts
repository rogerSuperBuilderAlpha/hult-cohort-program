import { matchIntroductions, type HelperKnowledge, type IntroductionDraft, type StuckSignal } from './broker';
import { normaliseTitle } from './sense';

/**
 * The broker's run loop — everything the scheduled job does EXCEPT talk to Firestore.
 *
 * The Admin SDK needs a service-account credential only Nik can create, so the writes
 * live behind `BrokerDeps`: a fake in unit tests today, the Admin SDK the day the
 * credential exists. The credential is the last wire, not the architecture.
 *
 * The privacy asymmetry holds by construction here too: the only output is `upsert`
 * calls into `introductions` — the collection the rules make helper-only. This module
 * has no path to any cohort-readable surface.
 */

export type BrokerDeps = {
  /**
   * Assemble the run's inputs from visible activity and public record. The Admin
   * implementation reads tasks/recipes/cohortMembers; a test hands back fixtures.
   * Everything in the return type is activity or explicit opt-in — `StuckSignal`
   * cannot express absence, which is the point.
   */
  gather(): Promise<{ signals: StuckSignal[]; helpers: HelperKnowledge[] }>;
  /**
   * Write one introduction, addressed by `id`, CREATE-IF-ABSENT. Never overwrite:
   * the id is derived from the work (same struggle → same doc), so an existing doc
   * means this exact intro was already offered — and if the helper dismissed it,
   * overwriting would resurrect a declined ask, which "one ask, once" forbids.
   */
  upsert(id: string, draft: IntroductionDraft): Promise<void>;
};

export type BrokerRunResult = {
  /** Drafts the matcher proposed this run. */
  proposed: number;
  /** Upserts attempted (== proposed; the store decides create-vs-skip). */
  written: number;
};

/**
 * The introduction's address: same stuck person, same helper, same (normalised) problem
 * → same document, always. Identical reasoning to `sensedTaskId`: a derived id makes
 * re-run spam unrepresentable — the second run addresses the doc the first one made.
 *
 * The problem is HASHED, not embedded: a Firestore doc id may not contain `/`, and a
 * problem lifted from a branch title ("fix/oauth loop") legitimately does. Normalised
 * first, so a reworded-but-identical problem ("Fix the OAuth loop!!") stays the same
 * introduction rather than a fresh ask.
 */
export function introDocId(draft: Pick<IntroductionDraft, 'stuckUid' | 'helperUid' | 'problem'>): string {
  return `i_${draft.stuckUid}_${draft.helperUid}_${fnv1a(normaliseTitle(draft.problem))}`;
}

/**
 * One broker run: gather → match → upsert each draft at its derived address.
 *
 * Sequential upserts, not Promise.all: a run writes a handful of docs at most (one per
 * stuck person), and a deterministic order keeps a partial failure legible. A failed
 * upsert aborts the run loudly — half-written state is fine (idempotent re-run heals
 * it), a swallowed error is not.
 */
export async function runBroker(deps: BrokerDeps): Promise<BrokerRunResult> {
  const { signals, helpers } = await deps.gather();
  const drafts = matchIntroductions({ signals, helpers });

  for (const draft of drafts) {
    await deps.upsert(introDocId(draft), draft);
  }

  return { proposed: drafts.length, written: drafts.length };
}

/**
 * FNV-1a, 32-bit, as 8 hex chars — the same addressing hash as `sensedTaskId`
 * (lib/sense.ts keeps its copy private; duplicated here rather than exported so the
 * broker job stays importable by a future standalone runner without dragging the whole
 * sensing module's surface along). Not cryptographic and doesn't need to be: the rules
 * decide who may read, this only decides where a doc lives.
 */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
