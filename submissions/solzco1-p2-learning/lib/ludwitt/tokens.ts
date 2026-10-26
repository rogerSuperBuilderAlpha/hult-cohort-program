import { ludwitt } from "@/lib/config";
import { getSession, setSession, type UserSession } from "@/lib/ludwitt/session";

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

export async function exchangeRefreshToken(
  refreshToken: string
): Promise<TokenResponse | null> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: ludwitt.clientId,
    client_secret: ludwitt.clientSecret,
  });

  const res = await fetch(ludwitt.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) return null;
  return (await res.json()) as TokenResponse;
}

function tokenExpired(session: UserSession): boolean {
  if (!session.tokenExpiresAt) return false;
  return Date.now() >= session.tokenExpiresAt - 60_000;
}

export async function getAccessToken(
  session: UserSession
): Promise<{ accessToken: string; session: UserSession } | null> {
  if (!session.accessToken) return null;

  if (!tokenExpired(session)) {
    return { accessToken: session.accessToken, session };
  }

  if (!session.refreshToken) return null;

  const tokens = await exchangeRefreshToken(session.refreshToken);
  if (!tokens) return null;

  const updated: UserSession = {
    ...session,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? session.refreshToken,
    tokenExpiresAt: Date.now() + tokens.expires_in * 1000,
  };
  await setSession(updated);
  return { accessToken: tokens.access_token, session: updated };
}

export async function requireAccessToken(): Promise<{
  accessToken: string;
  session: UserSession;
} | null> {
  const session = await getSession();
  if (!session) return null;
  return getAccessToken(session);
}
