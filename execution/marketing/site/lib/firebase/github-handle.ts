const HANDLE_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export function parseGithubHandle(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const handle = value.trim();
  if (!HANDLE_RE.test(handle)) return null;
  return handle.toLowerCase();
}

type GithubProviderInfo = {
  federatedId?: string;
  rawId?: string;
};

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'hult-cohort-apply',
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Authoritative reverse lookup: GitHub exposes a user by their immutable numeric
 * id at /user/{id}, returning the current login. Firebase always provides this id
 * (rawId/federatedId), so this resolves the handle without guessing from display
 * names — which are frequently a person's real name, not their login.
 */
async function lookupGithubLoginById(githubUserId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/user/${encodeURIComponent(githubUserId)}`, {
      headers: githubHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { login?: string };
    return parseGithubHandle(data.login);
  } catch {
    return null;
  }
}

/**
 * Resolves a GitHub login strictly from the immutable numeric id Firebase provides.
 * We never guess the handle from display names or token claims — if the id lookup
 * fails, we return null and the caller surfaces a retryable error.
 */
export async function resolveGithubHandle(github: GithubProviderInfo): Promise<string | null> {
  const githubUserId = github.federatedId?.trim() || github.rawId?.trim();
  if (!githubUserId) return null;
  return lookupGithubLoginById(githubUserId);
}
