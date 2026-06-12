const HANDLE_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export function parseGithubHandle(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const handle = value.trim();
  if (!HANDLE_RE.test(handle)) return null;
  return handle.toLowerCase();
}

export function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  if (!payload) return {};
  const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = Buffer.from(padded, 'base64').toString('utf8');
  try {
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

type GithubProviderInfo = {
  displayName?: string;
  screenName?: string;
  federatedId?: string;
  rawId?: string;
};

export function githubHandleCandidates(
  idToken: string,
  github: GithubProviderInfo,
  hint?: string
): string[] {
  const claims = decodeJwtPayload(idToken);
  const firebase = claims.firebase as
    | { sign_in_attributes?: { login?: string; screenName?: string } }
    | undefined;
  const attrs = firebase?.sign_in_attributes;

  const raw = [
    attrs?.login,
    attrs?.screenName,
    claims.name,
    github.screenName,
    github.displayName,
    hint,
  ];

  const seen = new Set<string>();
  const handles: string[] = [];
  for (const value of raw) {
    const handle = parseGithubHandle(value);
    if (handle && !seen.has(handle)) {
      seen.add(handle);
      handles.push(handle);
    }
  }
  return handles;
}

export async function verifyGithubHandleForUserId(
  handle: string,
  githubUserId: string
): Promise<boolean> {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(handle)}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'hult-cohort-apply',
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { id?: number };
    return String(data.id) === String(githubUserId);
  } catch {
    return false;
  }
}

export async function resolveGithubHandle(
  idToken: string,
  github: GithubProviderInfo,
  hint?: string
): Promise<string | null> {
  const githubUserId = github.federatedId?.trim() || github.rawId?.trim();
  if (!githubUserId) return null;

  const candidates = githubHandleCandidates(idToken, github, hint);
  for (const handle of candidates) {
    if (await verifyGithubHandleForUserId(handle, githubUserId)) {
      return handle;
    }
  }
  return null;
}
