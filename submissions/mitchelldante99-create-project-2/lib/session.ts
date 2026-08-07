import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import type { TokenResponse, UserInfo } from "./ludwitt";

const SECRET = process.env.SESSION_SECRET || "dev-only-insecure-secret";

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

function pack(payload: object): string {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString("base64url");
  const sig = sign(b64);
  return `${b64}.${sig}`;
}

function unpack<T>(cookieValue: string): T | null {
  const [b64, sig] = cookieValue.split(".");
  if (!b64 || !sig) return null;
  const expected = sign(b64);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(b64, "base64url").toString("utf-8")) as T;
  } catch {
    return null;
  }
}

// --- Short-lived cookie for the OAuth handshake (state + PKCE verifier) ---

export async function setOAuthFlowCookie(state: string, codeVerifier: string) {
  const store = await cookies();
  store.set("ludwitt_oauth_flow", pack({ state, codeVerifier }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });
}

export async function getOAuthFlowCookie(): Promise<{ state: string; codeVerifier: string } | null> {
  const store = await cookies();
  const raw = store.get("ludwitt_oauth_flow")?.value;
  if (!raw) return null;
  return unpack(raw);
}

export async function clearOAuthFlowCookie() {
  const store = await cookies();
  store.delete("ludwitt_oauth_flow");
}

// --- User session, set once the token exchange succeeds ---

interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix ms
  user: UserInfo;
}

export async function setSession(tokens: TokenResponse, user: UserInfo) {
  const store = await cookies();
  const data: SessionData = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    user,
  };
  store.set("ludwitt_session", pack(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days (refresh token carries us past access token expiry)
    path: "/",
  });
}

export async function getSession(): Promise<SessionData | null> {
  const store = await cookies();
  const raw = store.get("ludwitt_session")?.value;
  if (!raw) return null;
  return unpack<SessionData>(raw);
}

export async function clearSession() {
  const store = await cookies();
  store.delete("ludwitt_session");
}
