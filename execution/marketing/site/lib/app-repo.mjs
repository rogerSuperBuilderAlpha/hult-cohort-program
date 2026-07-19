/** Parse the peer's app/build GitHub repo (`owner/name`) from a submission PR body. */

/**
 * @param {string} text
 * @returns {string | null} owner/repo
 */
export function parseGithubRepoFullName(text) {
  if (!text?.trim()) return null;
  const match = text.match(
    /https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?=[\/?#\s"'`)\]|,]|$)/i
  );
  if (!match) return null;
  const owner = match[1];
  const name = match[2].replace(/\.git$/i, '');
  if (!owner || !name) return null;
  if (owner.toLowerCase() === 'settings' || name.toLowerCase() === 'settings') return null;
  return `${owner}/${name}`;
}

/**
 * @param {string | null | undefined} prBody
 * @param {string | null | undefined} [excludeRepo] cohort monorepo to skip
 * @returns {string | null} owner/repo
 */
export function extractAppRepo(prBody, excludeRepo = null) {
  if (!prBody?.trim()) return null;

  const exclude = excludeRepo?.trim().toLowerCase() || null;
  const lines = prBody.split(/\r?\n/);
  const labelPattern =
    /^\s*(?:#{1,6}\s+|(?:[-*+]|\d+\.)\s+)?(?:\*\*)?(?:app\s+repo|build\s+repo|source(?:\s+repo)?|repository)(?:\*\*)?\s*:?\s*(.*)$/i;

  function accept(fullName) {
    if (!fullName) return null;
    if (exclude && fullName.toLowerCase() === exclude) return null;
    return fullName;
  }

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(labelPattern);
    if (!match) continue;

    const inline = accept(parseGithubRepoFullName(match[1] ?? ''));
    if (inline) return inline;

    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
      const line = lines[j].trim();
      if (!line) continue;
      const parsed = accept(parseGithubRepoFullName(line));
      if (parsed) return parsed;
      if (!line.match(/^[\s\-*#>]/)) break;
    }
  }

  // Fallback: first non-cohort github.com/owner/repo in the body (clone URLs, etc.)
  for (const line of lines) {
    const parsed = accept(parseGithubRepoFullName(line));
    if (parsed) return parsed;
  }

  return null;
}
