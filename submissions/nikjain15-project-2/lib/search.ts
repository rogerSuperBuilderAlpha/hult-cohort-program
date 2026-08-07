/**
 * In-channel message search — pure helpers over the messages already held in memory (the channel
 * listener caps at 200), so search costs no extra reads. Case-insensitive substring match; the
 * highlight splitter is unit-tested so the UI can render matches without its own parsing.
 */

export function matchesQuery(body: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return body.toLowerCase().includes(q);
}

/** Split `body` into alternating [text, match, text, …] segments for highlight rendering. */
export function highlightSegments(body: string, query: string): { text: string; hit: boolean }[] {
  const q = query.trim();
  if (!q) return [{ text: body, hit: false }];
  const out: { text: string; hit: boolean }[] = [];
  const lower = body.toLowerCase();
  const needle = q.toLowerCase();
  let i = 0;
  while (i < body.length) {
    const at = lower.indexOf(needle, i);
    if (at < 0) {
      out.push({ text: body.slice(i), hit: false });
      break;
    }
    if (at > i) out.push({ text: body.slice(i, at), hit: false });
    out.push({ text: body.slice(at, at + needle.length), hit: true });
    i = at + needle.length;
  }
  return out;
}
