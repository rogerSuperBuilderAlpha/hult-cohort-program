/**
 * The brief's facts and its model-free fallback. **Client-safe** — no Anthropic import — so
 * both the server composer (lib/brief.ts) and the client hook (lib/use-brief.ts) can share
 * the type, and the hook can assemble a warm sentence without a model when the route
 * degrades. Kept out of lib/brief.ts on purpose: importing that module client-side would
 * bundle the Anthropic SDK (and its key-reading code) into the browser.
 */

/**
 * The facts a brief is written from. All derived client-side from the feed already in memory
 * — no new query, no cost. Aggregate by construction: the cohort numbers are collective, and
 * `you*` is the reader's own private part. Never a per-person breakdown of anyone else.
 */
export type BriefFacts = {
  displayName: string;
  cohortShipped: number;
  cohortFiguredOut: number;
  cohortUnstuck: number;
  shipStreakDays: number;
  youShipped: number;
  youUnstuck: number;
  youKudos: number;
  yourOpenTitles: string[];
};

/** True when the week is genuinely empty — nothing shipped, figured out, or unstuck, and no
 *  open work. Home shows nothing rather than narrate an empty week (VOICE rule 4 handles the
 *  invitation elsewhere; the brief simply stays quiet). */
export function briefIsEmpty(f: BriefFacts): boolean {
  return (
    f.cohortShipped === 0 &&
    f.cohortFiguredOut === 0 &&
    f.cohortUnstuck === 0 &&
    f.youShipped === 0 &&
    f.yourOpenTitles.length === 0
  );
}

/**
 * A warm, model-free brief assembled from the same facts. Used when the model is unavailable
 * (no key, outage) or the reader hasn't opted into narration — never an error, never a
 * fabricated number. On-voice: leads with what Pulse did, one idea per clause, no adjectives
 * about pace, no exclamation. Returns '' for an empty week, so the caller renders nothing.
 */
export function assembleBrief(f: BriefFacts): string {
  if (briefIsEmpty(f)) return '';

  const lead =
    f.youShipped > 0
      ? 'Your work moved to done and your team saw it — you didn’t type a thing.'
      : f.yourOpenTitles.length > 0
        ? 'Your board is up to date — Pulse moves these the moment you ship.'
        : 'The cohort is building. Here is where things stand.';

  const bits = [
    `shipped ${f.cohortShipped}`,
    f.cohortFiguredOut > 0 ? `figured out ${f.cohortFiguredOut}` : null,
    f.cohortUnstuck > 0 ? `unstuck ${f.cohortUnstuck}` : null,
  ].filter((b): b is string => b !== null);

  return `${lead} The cohort ${joinAnd(bits)} this week.`;
}

/** "a", "a and b", "a, b, and c" — serial comma, per VOICE. */
function joinAnd(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? '';
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}
