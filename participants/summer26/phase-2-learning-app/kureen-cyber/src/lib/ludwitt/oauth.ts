import { createHash, randomBytes } from "crypto";
import { getLudwittConfig } from "./config";
import { ludwittFetch } from "./client";

export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
};

export type UserInfo = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};

export function createPkcePair() {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function createOAuthState() {
  return randomBytes(32).toString("base64url");
}

export function buildAuthorizeUrl(state: string, codeChallenge: string) {
  const cfg = getLudwittConfig();
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: "code",
    scope: cfg.scopes,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${cfg.baseUrl}/oauth/authorize?${params.toString()}`;
}

export async function exchangeCode(
  code: string,
  codeVerifier: string,
): Promise<TokenResponse> {
  const cfg = getLudwittConfig();
  const response = await ludwittFetch("/api/oauth/token", {
    method: "POST",
    formBody: {
      grant_type: "authorization_code",
      code,
      redirect_uri: cfg.redirectUri,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      code_verifier: codeVerifier,
    },
  });
  return (await response.json()) as TokenResponse;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenResponse> {
  const cfg = getLudwittConfig();
  const response = await ludwittFetch("/api/oauth/token", {
    method: "POST",
    formBody: {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
    },
  });
  return (await response.json()) as TokenResponse;
}

export async function fetchUserInfo(accessToken: string): Promise<UserInfo> {
  const response = await ludwittFetch("/api/oauth/userinfo", {
    accessToken,
  });
  return (await response.json()) as UserInfo;
}

export async function revokeToken(token: string): Promise<void> {
  await ludwittFetch("/api/oauth/revoke", {
    method: "POST",
    formBody: { token },
  });
}
