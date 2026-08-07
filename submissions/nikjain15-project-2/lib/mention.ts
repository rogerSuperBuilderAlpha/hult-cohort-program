/**
 * @mention autocomplete — pure text helpers so the Composer's dropdown logic is unit-tested and
 * caret math is deterministic. No DOM here; the component owns focus/rendering.
 */

export type MentionQuery = { query: string; start: number };

/**
 * If the caret sits at the end of an "@token" (token = the run of non-space chars after an "@"
 * that begins at the start of the text or right after whitespace), return the token and the "@"
 * index. Otherwise null. This is what decides whether the suggestion dropdown is open.
 */
export function mentionQuery(text: string, caret: number): MentionQuery | null {
  const upto = text.slice(0, caret);
  const at = upto.lastIndexOf('@');
  if (at < 0) return null;
  // The char before "@" must be a boundary (start or whitespace), else it's an email/mid-word @.
  if (at > 0 && !/\s/.test(upto[at - 1])) return null;
  const token = upto.slice(at + 1);
  if (/\s/.test(token)) return null; // a space closed the mention
  return { query: token, start: at };
}

/**
 * Replace the active "@token" (from `start` to `caret`) with `@<name> ` and report the new caret
 * position (just past the inserted trailing space).
 */
export function applyMention(
  text: string,
  start: number,
  caret: number,
  name: string,
): { text: string; caret: number } {
  const before = text.slice(0, start);
  const after = text.slice(caret);
  const insert = `@${name} `;
  return { text: before + insert + after, caret: (before + insert).length };
}

/** Rank members for a mention query: prefix matches first, then substring, case-insensitive. */
export function rankMentions<T extends { displayName: string; handle?: string | null }>(
  members: T[],
  query: string,
  limit = 6,
): T[] {
  const q = query.toLowerCase();
  const scored = members
    .map((m) => {
      const name = m.displayName.toLowerCase();
      const handle = (m.handle ?? '').toLowerCase();
      let score = -1;
      if (name.startsWith(q) || handle.startsWith(q)) score = 2;
      else if (name.includes(q) || handle.includes(q)) score = 1;
      return { m, score };
    })
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.m);
}
