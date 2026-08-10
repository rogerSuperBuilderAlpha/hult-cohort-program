import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";
import { cookies } from "next/headers";
import {
  getSessionSecret,
  SESSION_COOKIE,
} from "./config";

export type LudwittUser = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};

export type LudwittSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: LudwittUser;
};

function deriveKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

export function sealSession(session: LudwittSession): string {
  const key = deriveKey(getSessionSecret());
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(session), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function unsealSession(token: string): LudwittSession | null {
  try {
    const key = deriveKey(getSessionSecret());
    const buf = Buffer.from(token, "base64url");
    if (buf.length < 28) return null;
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    const parsed = JSON.parse(plaintext.toString("utf8")) as LudwittSession;
    if (
      !parsed?.accessToken ||
      !parsed?.refreshToken ||
      !parsed?.user?.sub ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function readSession(): Promise<LudwittSession | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return unsealSession(raw);
}

export async function writeSession(session: LudwittSession): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sealSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
