import { jwtVerify, SignJWT } from "jose";

export type SessionUser = {
  sub: string;
  email: string | null;
  appId: string | null;
};

const SESSION_COOKIE = "ai-onramp-session";
const SESSION_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? process.env.LUDWITT_JWT_SECRET ?? "dev-secret-change-me"
);
const SESSION_TTL = "24h";

export async function verifyLaunchToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    if (!payload.sub) return null;
    return {
      sub: String(payload.sub),
      email: typeof payload.email === "string" ? payload.email : null,
      appId: typeof payload.app_id === "string" ? payload.app_id : null,
    };
  } catch {
    return null;
  }
}

function getSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ?? process.env.JWT_SECRET ?? "ai-onramp-dev-session"
  );
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email, app_id: user.appId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecret());
}

export async function readSessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return {
      sub: String(payload.sub),
      email: typeof payload.email === "string" ? payload.email : null,
      appId: typeof payload.app_id === "string" ? payload.app_id : null,
    };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;