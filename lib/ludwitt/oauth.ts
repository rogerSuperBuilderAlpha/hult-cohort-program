import { createHash, randomBytes } from "crypto";
import {
  getLudwittClientSecret,
  getLudwittRedirectUri,
  LUDWITT_CLIENT_ID,
  LUDWITT_SCOPES,
  LUDWITT_URLS,
} from "./config";
import type { LudwittSession, LudwittUser } from "./session";

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

function base64Url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createOAuthState(): string {
  return base64Url(randomBytes(32));
}

export function createPkcePair(): { verifier: string; challenge: string } {
  const verifier = base64Url(randomBytes(32));
  const challenge = base64Url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

export function buildAuthorizeUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    client_id: LUDWITT_CLIENT_ID,
    redirect_uri: getLudwittRedirectUri(),
    response_type: "code",
    scope: LUDWITT_SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${LUDWITT_URLS.authorize}?${params.toString()}`;
}

async function postToken(
  body: URLSearchParams,
): Promise<TokenResponse> {
  const res = await fetch(LUDWITT_URLS.token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as TokenResponse & {
    error?: string;
    error_description?: string;
  };

  if (!res.ok) {
    throw new Error(
      data.error_description || data.error || `Token exchange failed (${res.status})`,
    );
  }
  if (!data.access_token || !data.refresh_token) {
    throw new Error("Token response missing access_token or refresh_token");
  }
  return data;
}

export async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getLudwittRedirectUri(),
    client_id: LUDWITT_CLIENT_ID,
    client_secret: getLudwittClientSecret(),
    code_verifier: codeVerifier,
  });
  return postToken(body);
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: LUDWITT_CLIENT_ID,
    client_secret: getLudwittClientSecret(),
  });
  return postToken(body);
}

export async function fetchUserinfo(accessToken: string): Promise<LudwittUser> {
  const res = await fetch(LUDWITT_URLS.userinfo, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as LudwittUser & {
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !data.sub) {
    throw new Error(
      data.error_description || data.error || `Userinfo failed (${res.status})`,
    );
  }
  return {
    sub: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

export async function revokeToken(token: string): Promise<void> {
  try {
    await fetch(LUDWITT_URLS.revoke, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
      cache: "no-store",
    });
  } catch {
    // RFC 7009 — always treat revoke as best-effort
  }
}

export function sessionFromTokens(
  tokens: TokenResponse,
  user: LudwittUser,
): LudwittSession {
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    user,
  };
}
