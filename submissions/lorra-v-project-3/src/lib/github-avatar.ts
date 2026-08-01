/**
 * Parse a GitHub profile URL into a username.
 * Accepts https://github.com/username and trailing-slash variants.
 */
export function githubUsernameFromProfileUrl(
  url: string | null | undefined,
): string | null {
  if (!url?.trim()) return null;

  try {
    const parsed = new URL(url.trim());
    if (!/(^|\.)github\.com$/i.test(parsed.hostname)) return null;

    const segments = parsed.pathname
      .replace(/\/+$/, "")
      .split("/")
      .map((p) => p.trim())
      .filter(Boolean);

    // Profile URLs are https://github.com/{username}[/]
    if (segments.length !== 1) return null;
    const username = segments[0]!;
    if (!/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(username)) {
      return null;
    }
    return username;
  } catch {
    return null;
  }
}

/** Public GitHub avatar URL — no API call required. */
export function githubAvatarUrlFromProfileUrl(
  url: string | null | undefined,
): string | null {
  const username = githubUsernameFromProfileUrl(url);
  if (!username) return null;
  return `https://github.com/${username}.png`;
}
