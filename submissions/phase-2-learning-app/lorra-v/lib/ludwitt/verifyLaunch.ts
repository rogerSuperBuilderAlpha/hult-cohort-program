import { jwtVerify } from "jose";
import { containsBlockedIdentifier } from "./blockedIdentifiers";

export type LaunchClaims = {
  sub: string;
  email: string;
  app_id: string;
};

export type VerifyLaunchResult =
  | { ok: true; claims: LaunchClaims }
  | { ok: false; reason: string };

function getSecretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

/**
 * Verify a Ludwitt launch JWT (HS256).
 * Rejects expired, tampered, missing-claim, wrong-app, and blocked-identifier tokens.
 */
export async function verifyLaunchToken(
  token: string,
): Promise<VerifyLaunchResult> {
  const jwtSecret = process.env.LUDWITT_JWT_SECRET;
  const appId = process.env.LUDWITT_APP_ID;

  if (!jwtSecret || !appId) {
    return { ok: false, reason: "missing_server_config" };
  }

  if (!token || typeof token !== "string") {
    return { ok: false, reason: "missing_token" };
  }

  let payload: Record<string, unknown>;
  try {
    const verified = await jwtVerify(token, getSecretKey(jwtSecret), {
      algorithms: ["HS256"],
    });
    payload = verified.payload as Record<string, unknown>;
  } catch {
    return { ok: false, reason: "invalid_or_expired" };
  }

  const sub = payload.sub;
  const email = payload.email;
  const tokenAppId = payload.app_id;

  if (typeof sub !== "string" || !sub) {
    return { ok: false, reason: "missing_sub" };
  }
  if (typeof email !== "string" || !email) {
    return { ok: false, reason: "missing_email" };
  }
  if (typeof tokenAppId !== "string" || !tokenAppId) {
    return { ok: false, reason: "missing_app_id" };
  }
  if (tokenAppId !== appId) {
    return { ok: false, reason: "app_id_mismatch" };
  }

  // Anti-gaming: reject before any session is created.
  if (containsBlockedIdentifier(sub) || containsBlockedIdentifier(email)) {
    return { ok: false, reason: "blocked_identifier" };
  }

  return {
    ok: true,
    claims: { sub, email, app_id: tokenAppId },
  };
}
