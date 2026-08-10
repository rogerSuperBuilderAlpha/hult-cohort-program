export type LudwittConfig = {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  scopes: string;
  redirectUri: string;
  aiModel: string;
  sessionSecret: string;
  cookieSecure: boolean;
};

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function getLudwittConfig(): LudwittConfig {
  return {
    clientId: required("LUDWITT_CLIENT_ID"),
    clientSecret: required("LUDWITT_CLIENT_SECRET"),
    baseUrl: (process.env.LUDWITT_BASE_URL || "https://pitchrise.ludwitt.com").replace(
      /\/$/,
      "",
    ),
    scopes:
      process.env.LUDWITT_SCOPES ||
      "profile credits:read credits:spend data:read data:write",
    redirectUri:
      process.env.LUDWITT_REDIRECT_URI ||
      "http://localhost:3000/api/auth/callback",
    aiModel: process.env.LUDWITT_AI_MODEL || "claude-sonnet-4-6",
    sessionSecret: required("SESSION_SECRET"),
    cookieSecure: process.env.COOKIE_SECURE === "true",
  };
}

export function hasLudwittCredentials(): boolean {
  return Boolean(
    process.env.LUDWITT_CLIENT_ID?.trim() &&
      process.env.LUDWITT_CLIENT_SECRET?.trim() &&
      process.env.SESSION_SECRET?.trim(),
  );
}

export const LUDWITT_TOP_UP_URL =
  "https://pitchrise.ludwitt.com/account/credits";
