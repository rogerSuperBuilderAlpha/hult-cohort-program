import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ludwitt } from "@/lib/config";

export type UserSession = {
  sub: string;
  email: string;
  name?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: number;
  sessionId: string;
  authMethod: "oauth" | "jwt_launch" | "dev";
};

const COOKIE = "dealforge_session";

function secretKey() {
  return new TextEncoder().encode(ludwitt.sessionSecret);
}

export async function setSession(user: UserSession): Promise<void> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<UserSession | null> {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const { payload } = await jwtVerify(raw, secretKey());
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  cookies().delete(COOKIE);
}

export async function requireSession(): Promise<UserSession | null> {
  return getSession();
}
