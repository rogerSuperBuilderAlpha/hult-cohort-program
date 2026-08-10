import {
  clearSessionCookie,
  readSessionCookie,
  setSessionCookie,
} from "@/lib/ludwitt/cookies";
import {
  exchangeAuthorizationCode,
  fetchUserInfo,
  refreshAccessToken,
  revokeToken,
  type TokenResponse,
} from "@/lib/ludwitt/oauth-client";
import {
  decryptSession,
  encryptSession,
  isAccessTokenExpired,
  toPublicUser,
  type LudwittSession,
  type PublicLudwittUser,
} from "@/lib/ludwitt/session-crypto";

function sessionFromTokenResponse(
  tokens: TokenResponse,
  userinfo: { sub: string; email?: string; name?: string; picture?: string }
): LudwittSession {
  return {
    sub: userinfo.sub,
    email: userinfo.email,
    name: userinfo.name,
    picture: userinfo.picture,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    accessTokenExpiresAt: Date.now() + tokens.expires_in * 1000,
  };
}

export async function createSessionFromAuthCode(
  code: string,
  codeVerifier: string
): Promise<LudwittSession> {
  const tokens = await exchangeAuthorizationCode(code, codeVerifier);
  const userinfo = await fetchUserInfo(tokens.access_token);
  const session = sessionFromTokenResponse(tokens, userinfo);
  await persistSession(session);
  return session;
}

async function persistSession(session: LudwittSession): Promise<void> {
  const encrypted = encryptSession(session);
  await setSessionCookie(encrypted);
}

async function refreshSessionIfNeeded(
  session: LudwittSession
): Promise<LudwittSession | null> {
  if (!isAccessTokenExpired(session)) {
    return session;
  }

  try {
    const tokens = await refreshAccessToken(session.refreshToken);
    const refreshed: LudwittSession = {
      ...session,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessTokenExpiresAt: Date.now() + tokens.expires_in * 1000,
    };
    await persistSession(refreshed);
    return refreshed;
  } catch {
    await destroySession(session);
    return null;
  }
}

export async function getLudwittSession(): Promise<LudwittSession | null> {
  const cookie = await readSessionCookie();
  if (!cookie) return null;

  const session = decryptSession(cookie);
  if (!session) {
    await clearSessionCookie();
    return null;
  }

  return refreshSessionIfNeeded(session);
}

export async function getPublicLudwittUser(): Promise<PublicLudwittUser | null> {
  const session = await getLudwittSession();
  if (!session) return null;
  return toPublicUser(session);
}

export async function destroySession(
  session?: LudwittSession | null
): Promise<void> {
  const existing = session ?? (await getLudwittSession());
  if (existing?.accessToken) {
    try {
      await revokeToken(existing.accessToken);
    } catch {
      // Revocation is best-effort per RFC 7009
    }
  }
  await clearSessionCookie();
}

/** Server-only accessor for future Ludwitt API calls (not exposed to browser). */
export async function getLudwittAccessToken(): Promise<string | null> {
  const session = await getLudwittSession();
  return session?.accessToken ?? null;
}
