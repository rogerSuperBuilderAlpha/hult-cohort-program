export const LUDWITT_CLIENT_ID = "le_39d604ef92215c7b15c879";

export const LUDWITT_SCOPES = "profile credits:read credits:spend";

export const LUDWITT_URLS = {
  authorize: "https://pitchrise.ludwitt.com/oauth/authorize",
  token: "https://pitchrise.ludwitt.com/api/oauth/token",
  userinfo: "https://pitchrise.ludwitt.com/api/oauth/userinfo",
  revoke: "https://pitchrise.ludwitt.com/api/oauth/revoke",
  balance: "https://pitchrise.ludwitt.com/api/v1/credits/balance",
  aiMessages: "https://pitchrise.ludwitt.com/api/v1/ai/messages",
  topUp: "https://pitchrise.ludwitt.com/account/credits",
} as const;

const DEFAULT_REDIRECT =
  "https://triniiq-masterclass.vercel.app/auth/callback";

export function getLudwittRedirectUri(): string {
  return process.env.LUDWITT_REDIRECT_URI?.trim() || DEFAULT_REDIRECT;
}

export function getLudwittClientSecret(): string {
  const secret = process.env.LUDWITT_CLIENT_SECRET?.trim();
  if (!secret) {
    throw new Error("LUDWITT_CLIENT_SECRET is not configured");
  }
  return secret;
}

export function getSessionSecret(): string {
  const secret =
    process.env.SESSION_SECRET?.trim() ||
    process.env.LUDWITT_CLIENT_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET (or LUDWITT_CLIENT_SECRET) must be set for cookie encryption",
    );
  }
  return secret;
}

export const OAUTH_STATE_COOKIE = "triniiq_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "triniiq_oauth_verifier";
export const SESSION_COOKIE = "triniiq_ludwitt_session";
