import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "ef_session";

/** App-owned session lifetime (separate from Ludwitt launch JWT). */
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export type SessionPayload = {
  /** app_users.id */
  userId: string;
  ludwittSub: string;
  email: string;
};

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    ludwittSub: payload.ludwittSub,
    email: payload.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return null;

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] },
    );

    const userId = payload.userId;
    const ludwittSub = payload.ludwittSub;
    const email = payload.email;

    if (
      typeof userId !== "string" ||
      typeof ludwittSub !== "string" ||
      typeof email !== "string"
    ) {
      return null;
    }

    return { userId, ludwittSub, email };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
