/**
 * Minimal markdown-ish renderer for message bodies (bold/italic/code/links).
 * Keeps Step 4 free of heavy editor deps.
 */
export function formatMessageHtml(raw: string): string {
  const escaped = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    .replace(
      /(^|[\s(])(https?:\/\/[^\s<]+)/g,
      '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>',
    )
    .replace(/\n/g, "<br />");
}

/** Extract @Display Name mentions that match known members (longest-name-first). */
export function extractMentionIds(
  body: string,
  members: { id: string; display_name: string }[],
): string[] {
  const sorted = [...members].sort(
    (a, b) => b.display_name.length - a.display_name.length,
  );
  const found = new Set<string>();
  for (const m of sorted) {
    const token = `@${m.display_name}`;
    if (body.includes(token)) found.add(m.id);
  }
  return [...found];
}

export function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function canEditMessage(createdAt: string, editedAt: string | null, now = Date.now()) {
  const start = new Date(editedAt || createdAt).getTime();
  return now - start <= 15 * 60 * 1000;
}
