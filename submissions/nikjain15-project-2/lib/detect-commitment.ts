/**
 * Commitment detection — the deterministic baseline (the model path layers on and falls back
 * here). Reads a first-person promise out of a message so the UI can offer "Track it". It
 * NEVER creates anything: capture is always the author's explicit confirm. Inference is only
 * an affordance, never an action — a wrongly-detected commitment costs nothing because nothing
 * happens until the person taps Track it.
 */

export type DetectedCommitment = {
  text: string;
  /** Rough due hint in the text ("by Friday", "tomorrow") — parsed to a timestamp elsewhere. */
  dueHint: string | null;
};

const PROMISE = /\b(i(?:'|’)ll|i will|i'?m going to|i am going to|i plan to|let me|i can)\b/i;
const DUE = /\b(by\s+\w+|today|tonight|tomorrow|this\s+(?:week|weekend|afternoon|evening)|next\s+week|eod|eow|end of (?:day|week))\b/i;

/** Return the commitment a message implies, or null. Single, because a message is one promise. */
export function detectCommitment(body: string): DetectedCommitment | null {
  const text = body.trim();
  if (!text) return null;
  if (!PROMISE.test(text)) return null;
  // Questions aren't commitments.
  if (text.endsWith('?')) return null;
  const due = text.match(DUE);
  return { text, dueHint: due ? due[0] : null };
}
