import { createSession, readSession } from "./auth";
import { refreshAccessToken } from "./ludwitt";

export async function getActiveSession(request) {
  const session = await readSession(request);
  if (!session) return { session: null, cookieValue: null };

  if (session.accessTokenExpiresAt > Date.now() + 60_000) {
    return { session, cookieValue: null };
  }

  const tokens = await refreshAccessToken(session.refreshToken);
  const refreshed = {
    ...session,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    accessTokenExpiresAt: Date.now() + Number(tokens.expires_in) * 1000,
  };
  const cookieValue = await createSession({ profile: refreshed, tokens });
  return { session: refreshed, cookieValue };
}
