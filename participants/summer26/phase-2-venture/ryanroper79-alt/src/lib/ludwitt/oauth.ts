import { randomBytes } from 'crypto';

export const OAUTH_STATE_COOKIE = 'ceal_oauth_state';

export type LudwittUserInfo = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
};

export function oauthConfig() {
  const base = (process.env.LUDWITT_OAUTH_BASE ?? 'https://pitchrise.ludwitt.com').replace(/\/$/, '');
  return {
    clientId: process.env.LUDWITT_CLIENT_ID?.trim() ?? '',
    clientSecret: process.env.LUDWITT_CLIENT_SECRET?.trim() ?? '',
    base,
    authorizeUrl: `${base}/oauth/authorize`,
    tokenUrl: `${base}/api/oauth/token`,
    userinfoUrl: `${base}/api/oauth/userinfo`,
    scopes: 'profile credits:read credits:spend',
  };
}

export function isOAuthConfigured(): boolean {
  const c = oauthConfig();
  return Boolean(c.clientId && c.clientSecret);
}

export function createOAuthState(): string {
  return randomBytes(32).toString('base64url');
}

export function buildAuthorizeUrl(opts: { redirectUri: string; state: string }): string {
  const c = oauthConfig();
  const params = new URLSearchParams({
    client_id: c.clientId,
    redirect_uri: opts.redirectUri,
    response_type: 'code',
    scope: c.scopes,
    state: opts.state,
  });
  return `${c.authorizeUrl}?${params.toString()}`;
}

export function oauthCookieOptions(maxAgeSec = 600) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSec,
  };
}

export async function exchangeAuthorizationCode(opts: {
  code: string;
  redirectUri: string;
}): Promise<{ ok: true; accessToken: string } | { ok: false; error: string }> {
  const c = oauthConfig();
  if (!c.clientId || !c.clientSecret) {
    return { ok: false, error: 'OAuth not configured' };
  }
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: opts.code,
    redirect_uri: opts.redirectUri,
    client_id: c.clientId,
    client_secret: c.clientSecret,
  });
  const res = await fetch(c.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });
  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    const error =
      typeof json.error === 'string' ? json.error : `Token exchange failed (${res.status})`;
    return { ok: false, error };
  }
  const accessToken = typeof json.access_token === 'string' ? json.access_token : '';
  if (!accessToken) return { ok: false, error: 'Token response missing access_token' };
  return { ok: true, accessToken };
}

export async function fetchUserInfo(
  accessToken: string
): Promise<{ ok: true; user: LudwittUserInfo } | { ok: false; error: string }> {
  const c = oauthConfig();
  const res = await fetch(c.userinfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    return {
      ok: false,
      error: typeof json.error === 'string' ? json.error : `Userinfo failed (${res.status})`,
    };
  }
  const sub = typeof json.sub === 'string' ? json.sub : '';
  const email = typeof json.email === 'string' ? json.email : '';
  if (!sub || !email) return { ok: false, error: 'Userinfo missing sub or email' };
  return {
    ok: true,
    user: {
      sub,
      email,
      name: typeof json.name === 'string' ? json.name : undefined,
      picture: typeof json.picture === 'string' ? json.picture : undefined,
    },
  };
}
