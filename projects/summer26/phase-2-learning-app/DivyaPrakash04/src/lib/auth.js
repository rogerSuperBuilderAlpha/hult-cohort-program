import { createHash, randomBytes } from "crypto";
import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import { getRequiredEnv } from "./env";

export const sessionCookieName = "user_session";
export const oauthStateCookieName = "ludwitt_oauth_state";

function encryptionKey() {
  return createHash("sha256").update(getRequiredEnv().SESSION_SECRET).digest();
}

export function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

async function encrypt(payload, expiresIn) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .encrypt(encryptionKey());
}

async function decrypt(token) {
  const { payload } = await jwtDecrypt(token, encryptionKey());
  return payload;
}

export function createPkcePair() {
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export async function createOAuthState(verifier) {
  const state = randomBytes(32).toString("base64url");
  return { state, cookieValue: await encrypt({ state, verifier }, "10m") };
}

export async function readOAuthState(request) {
  try {
    const token = request.cookies.get(oauthStateCookieName)?.value;
    if (!token) return null;
    const payload = await decrypt(token);
    if (typeof payload.state !== "string" || typeof payload.verifier !== "string") return null;
    return { state: payload.state, verifier: payload.verifier };
  } catch {
    return null;
  }
}

export async function createSession({ profile, tokens }) {
  return encrypt(
    {
      sub: profile.sub,
      email: profile.email,
      name: profile.name ?? "",
      picture: profile.picture ?? "",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessTokenExpiresAt: Date.now() + Number(tokens.expires_in) * 1000,
    },
    "30d",
  );
}

export async function readSession(request) {
  try {
    const token = request
      ? request.cookies.get(sessionCookieName)?.value
      : (await cookies()).get(sessionCookieName)?.value;
    if (!token) return null;
    const payload = await decrypt(token);
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.accessToken !== "string" ||
      typeof payload.refreshToken !== "string" ||
      typeof payload.accessTokenExpiresAt !== "number"
    ) return null;
    return payload;
  } catch {
    return null;
  }
}

export function publicProfile(session) {
  return { sub: session.sub, email: session.email, name: session.name, picture: session.picture };
}
