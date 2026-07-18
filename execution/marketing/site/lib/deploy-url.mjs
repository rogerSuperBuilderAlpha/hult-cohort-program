/** Parse deploy URL from submission PR body (Production URL / Deploy URL label). */

function extractFirstHttpsUrl(text) {
  const match = text.match(/https:\/\/[^\s<>\]"'`)]+/i);
  if (!match) return null;
  // Strip trailing markdown / punctuation (e.g. vercel.app** or vercel.app).)
  return match[0].replace(/(?:[.,;:!?)]|\*\*)+$/g, '').replace(/\*+$/g, '');
}

/** @param {string | null | undefined} prBody */
export function extractDeployUrl(prBody) {
  if (!prBody?.trim()) return null;

  const lines = prBody.split(/\r?\n/);
  // Allow markdown headings / list markers before the label:
  //   Production URL: https://…
  //   **Production URL:** https://…
  //   ## Production URL
  //   - Production URL: https://…
  const labelPattern =
    /^\s*(?:#{1,6}\s+|(?:[-*+]|\d+\.)\s+)?(?:\*\*)?(?:production\s+url|deploy(?:ment)?\s+url)(?:\*\*)?\s*:?\s*(.*)$/i;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(labelPattern);
    if (!match) continue;

    const inline = extractFirstHttpsUrl(match[1] ?? '');
    if (inline) return inline;

    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
      const line = lines[j].trim();
      if (!line) continue;
      const url = extractFirstHttpsUrl(line);
      if (url) return url;
      if (!line.match(/^[\s\-*#>]/)) break;
    }
  }

  return null;
}
