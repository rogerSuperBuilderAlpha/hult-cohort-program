/** Parse deploy URL from submission PR body (Production URL / Deploy URL label). */

function extractFirstHttpsUrl(text) {
  const match = text.match(/https:\/\/[^\s<>\]"')]+/i);
  if (!match) return null;
  return match[0].replace(/[.,;]+$/, '');
}

/** @param {string | null | undefined} prBody */
export function extractDeployUrl(prBody) {
  if (!prBody?.trim()) return null;

  const lines = prBody.split(/\r?\n/);
  const labelPattern =
    /^\s*(?:\*\*)?(?:production\s+url|deploy(?:ment)?\s+url)(?:\*\*)?\s*:?\s*(.*)$/i;

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
      if (!line.match(/^[\s\-*]/)) break;
    }
  }

  return null;
}
