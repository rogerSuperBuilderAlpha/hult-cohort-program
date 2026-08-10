import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export const SESSION_COOKIE = "score_session";

export type LearnerSession = {
  userId: string;
  email?: string;
  appId?: string;
  sessionId: string;
  launchedAt: string;
  source: "ludwitt" | "dev-bypass";
};

export async function readSession(): Promise<LearnerSession | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LearnerSession;
    if (!parsed.userId || !parsed.sessionId) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Call only from Route Handlers / Server Actions. */
export async function writeDevBypassSession(): Promise<LearnerSession> {
  const session: LearnerSession = {
    userId: "dev-local-user",
    email: "dev@localhost",
    sessionId: randomUUID(),
    launchedAt: new Date().toISOString(),
    source: "dev-bypass",
  };
  const jar = await cookies();
  jar.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return session;
}
