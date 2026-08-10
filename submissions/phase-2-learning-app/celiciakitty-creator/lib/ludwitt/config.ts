const LUDWITT_BASE_URL = "https://pitchrise.ludwitt.com";

export const ludwittConfig = {
  baseUrl: LUDWITT_BASE_URL,
  authorizeUrl: `${LUDWITT_BASE_URL}/oauth/authorize`,
  tokenUrl: `${LUDWITT_BASE_URL}/api/oauth/token`,
  userinfoUrl: `${LUDWITT_BASE_URL}/api/oauth/userinfo`,
  revokeUrl: `${LUDWITT_BASE_URL}/api/oauth/revoke`,
  scopes: "profile credits:read credits:spend",
  oauthStateCookie: "ludwitt_oauth_state",
  pkceVerifierCookie: "ludwitt_pkce_verifier",
  returnToCookie: "ludwitt_oauth_return_to",
  sessionCookie: "lexlearn_ludwitt_session",
  oauthCookieMaxAge: 60 * 10,
  sessionMaxAge: 60 * 60 * 24 * 7,
} as const;

function readTrimmedEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  if (!value) {
    return undefined;
  }
  return value;
}

export function getLudwittClientId(): string {
  const value = readTrimmedEnv("LUDWITT_CLIENT_ID");
  if (!value) {
    throw new Error("LUDWITT_CLIENT_ID is not configured");
  }
  return value;
}

export function getLudwittClientSecret(): string {
  const value = readTrimmedEnv("LUDWITT_CLIENT_SECRET");
  if (!value) {
    throw new Error("LUDWITT_CLIENT_SECRET is not configured");
  }
  return value;
}

export function getLudwittRedirectUri(): string {
  const value = readTrimmedEnv("LUDWITT_REDIRECT_URI");
  if (!value) {
    throw new Error("LUDWITT_REDIRECT_URI is not configured");
  }
  return value;
}

export function getLudwittSessionSecret(): string {
  const value = readTrimmedEnv("LUDWITT_SESSION_SECRET");
  if (!value || value.length < 32) {
    throw new Error(
      "LUDWITT_SESSION_SECRET must be set and at least 32 characters"
    );
  }
  return value;
}

export function isLudwittConfigured(): boolean {
  const sessionSecret = readTrimmedEnv("LUDWITT_SESSION_SECRET");
  return Boolean(
    readTrimmedEnv("LUDWITT_CLIENT_ID") &&
      readTrimmedEnv("LUDWITT_CLIENT_SECRET") &&
      readTrimmedEnv("LUDWITT_REDIRECT_URI") &&
      sessionSecret &&
      sessionSecret.length >= 32
  );
}
