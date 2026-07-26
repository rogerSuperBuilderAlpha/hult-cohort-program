import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ensureUserFromSession } from "./db";
export { hashPassword, verifyPassword } from "./password";

export const SESSION_COOKIE = "comms_session";

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  name: string;
  role: "MEMBER" | "ADMIN";
};

function secretKey() {
  // Prefer AUTH_SECRET; fall back so Vercel demos still sign sessions when env is unset.
  const secret =
    process.env.AUTH_SECRET?.trim() ||
    (process.env.NODE_ENV === "production"
      ? "comms-vercel-demo-auth-secret-change-me"
      : "comms-dev-auth-secret");
  return new TextEncoder().encode(secret);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secretKey());
}

export async function createSession(user: SessionUser) {
  const token = await signSessionToken(user);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.id !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.username !== "string" ||
      typeof payload.name !== "string" ||
      (payload.role !== "MEMBER" && payload.role !== "ADMIN")
    ) {
      return null;
    }
    return {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  // Prefer store row when present; otherwise rehydrate from JWT so serverless
  // cold starts do not treat a valid session as logged out.
  const dbUser = await ensureUserFromSession(user);
  return {
    id: dbUser.id,
    email: dbUser.email,
    username: dbUser.username,
    name: dbUser.name,
    role: dbUser.role,
  } satisfies SessionUser;
}
