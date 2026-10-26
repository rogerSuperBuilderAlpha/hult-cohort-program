export const ludwitt = {
  clientId: process.env.LUDWITT_CLIENT_ID ?? "",
  clientSecret: process.env.LUDWITT_CLIENT_SECRET ?? "",
  authorizeUrl:
    process.env.LUDWITT_AUTHORIZE_URL ??
    "https://pitchrise.ludwitt.com/oauth/authorize",
  tokenUrl:
    process.env.LUDWITT_TOKEN_URL ??
    "https://pitchrise.ludwitt.com/api/oauth/token",
  userinfoUrl:
    process.env.LUDWITT_USERINFO_URL ??
    "https://pitchrise.ludwitt.com/api/oauth/userinfo",
  apiBase:
    process.env.LUDWITT_API_BASE ?? "https://pitchrise.ludwitt.com",
  redirectUri:
    process.env.LUDWITT_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth/ludwitt/callback`,
  aiModel: process.env.LUDWITT_AI_MODEL ?? "claude-sonnet-4-6",
  scopes:
    process.env.LUDWITT_SCOPES ?? "profile credits:read credits:spend",
  hultAppId: process.env.LUDWITT_HULT_APP_ID ?? "",
  hultApiKey: process.env.LUDWITT_HULT_API_KEY ?? "",
  hultEventsUrl:
    process.env.LUDWITT_HULT_EVENTS_URL ??
    "https://api.ludwitt.hult/v1",
  jwtSecret: process.env.LUDWITT_JWT_SECRET ?? "",
  sessionSecret: process.env.SESSION_SECRET ?? "dev-only-change-me",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

export function ludwittConfigured(): boolean {
  return Boolean(ludwitt.clientId && ludwitt.clientSecret);
}

export function hultEventsConfigured(): boolean {
  return Boolean(ludwitt.hultAppId && ludwitt.hultApiKey);
}
