/**
 * The collaboration engine — "Pulse spotted a connection."
 *
 * Pulse reads everyone's PUBLIC work (merged/open PRs in the public cohort repo — the same
 * facts the landing page already shows, which `lib/pre-index.ts` establishes are public
 * record, not a disclosure) and notices when two people are working on the same kind of
 * thing, so it can suggest they compare notes.
 *
 * The rails draw a hard line here, and this module stays on the safe side of it:
 *   - It uses ONLY public PR titles. It never touches the private "stuck" signal the Broker
 *     protects — this is generosity from public facts, not a "who needs help" list.
 *   - It is a PURE, heuristic matcher: term overlap, no model call. So there is no
 *     model-written narrative *about another member* (which would need their opt-in, rule 3)
 *     — only their own public PR title, quoted verbatim, and the plain fact that it overlaps
 *     your work.
 *   - It never ranks people or counts anyone. It surfaces at most one suggestion, on your
 *     own Home, about a shared topic.
 */

/** One member's public work — their handle, display name, and their public PR titles. */
export type MemberWork = {
  handle: string;
  displayName: string;
  prs: { number: number; title: string }[];
};

/** A suggested connection — all public facts. */
export type Connection = {
  handle: string;
  displayName: string;
  /** The public PR of theirs that overlaps your work. */
  prNumber: number;
  prTitle: string;
  /** The words the two share — what makes this a connection, shown plainly. */
  sharedTerms: string[];
};

// Words that carry no topic signal — verbs and glue common to task/PR titles. Overlap on
// these would connect everyone to everyone, which is noise, not a connection.
const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'to', 'for', 'of', 'in', 'on', 'with', 'my', 'your', 'this',
  'that', 'it', 'is', 'are', 'be', 'add', 'adds', 'added', 'fix', 'fixes', 'fixed', 'update',
  'updates', 'updated', 'wip', 'draft', 'feat', 'chore', 'refactor', 'test', 'tests', 'make',
  'use', 'set', 'get', 'new', 'up', 'out', 'into', 'from', 'work', 'working', 'task', 'project',
]);

/** Topic words in a string: lowercased, de-punctuated, stopwords and short tokens removed. */
export function topicTerms(s: string): Set<string> {
  const out = new Set<string>();
  for (const raw of s.toLowerCase().split(/[^a-z0-9]+/)) {
    const t = raw.trim();
    if (t.length >= 3 && !STOP.has(t)) out.add(t);
  }
  return out;
}

/**
 * The best connection between your work and the cohort's public work, or null.
 *
 * `myWork` is your own material — your board's task titles and/or your own PR titles. It's
 * yours, so comparing it costs nobody their privacy; the only thing ever surfaced is the
 * OTHER person's public PR. Requires at least `minShared` shared topic words, so a single
 * incidental word ("api") doesn't manufacture a connection.
 */
export function findConnection(
  myWork: string[],
  myHandle: string | null,
  others: MemberWork[],
  minShared = 1
): Connection | null {
  const mine = new Set<string>();
  for (const w of myWork) for (const t of topicTerms(w)) mine.add(t);
  if (mine.size === 0) return null;

  const meLower = myHandle?.toLowerCase() ?? null;
  let best: Connection | null = null;
  let bestScore = 0;

  for (const other of others) {
    if (meLower && other.handle.toLowerCase() === meLower) continue; // never yourself
    for (const pr of other.prs) {
      const shared: string[] = [];
      for (const t of topicTerms(pr.title)) if (mine.has(t)) shared.push(t);
      // Deterministic tie-break: more shared terms wins; then the lower PR number, so the
      // same inputs always yield the same suggestion (no Math.random reachable here anyway).
      if (shared.length > bestScore || (shared.length === bestScore && best && pr.number < best.prNumber)) {
        if (shared.length >= minShared) {
          best = {
            handle: other.handle,
            displayName: other.displayName,
            prNumber: pr.number,
            prTitle: pr.title,
            sharedTerms: shared.sort(),
          };
          bestScore = shared.length;
        }
      }
    }
  }

  return best;
}
