import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { getCookieSecure, getSessionSecret, isDemoMode } from "./app-config";
import {
  fetchUserInfo,
  refreshAccessToken,
  type UserInfo,
} from "./ludwitt/oauth";

export type AppSession = {
  isLoggedIn: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
  user?: UserInfo;
  oauthState?: string;
  codeVerifier?: string;
  demo?: boolean;
};

export const defaultSession: AppSession = {
  isLoggedIn: false,
};

function sessionOptions(): SessionOptions {
  return {
    password: getSessionSecret(),
    cookieName: "interview_forge_session",
    cookieOptions: {
      httpOnly: true,
      secure: getCookieSecure(),
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getSession() {
  return getIronSession<AppSession>(await cookies(), sessionOptions());
}

export async function requireSession() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.accessToken || !session.user) {
    throw new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Local demo sessions never refresh against Ludwitt
  if (session.demo || isDemoMode()) {
    return session as AppSession & {
      accessToken: string;
      user: UserInfo;
    };
  }

  const now = Math.floor(Date.now() / 1000);
  if ((session.expiresAt ?? 0) <= now + 60) {
    if (!session.refreshToken) {
      session.destroy();
      throw new Response(JSON.stringify({ error: "session_expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const tokens = await refreshAccessToken(session.refreshToken);
    session.accessToken = tokens.access_token;
    session.refreshToken = tokens.refresh_token ?? session.refreshToken;
    session.expiresAt = now + (tokens.expires_in || 3600);
    session.scope = tokens.scope ?? session.scope;
    await session.save();
  }

  return session as AppSession & {
    accessToken: string;
    user: UserInfo;
  };
}

export async function hydrateUser(accessToken: string) {
  return fetchUserInfo(accessToken);
}

export async function createDemoSession() {
  const session = await getSession();
  session.isLoggedIn = true;
  session.demo = true;
  session.accessToken = "demo_local_token";
  session.refreshToken = undefined;
  session.expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  session.scope = "demo";
  session.user = {
    sub: "demo-user",
    name: "Practice Guest",
    email: "guest@interviewforge.local",
  };
  session.oauthState = undefined;
  session.codeVerifier = undefined;
  await session.save();
  return session;
}
