import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

import { getLudwittSessionSecret } from "@/lib/ludwitt/config";

export type LudwittSession = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
};

export type PublicLudwittUser = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};

function deriveKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

export function encryptSession(session: LudwittSession): string {
  const key = deriveKey(getLudwittSessionSecret());
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = JSON.stringify(session);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptSession(payload: string): LudwittSession | null {
  try {
    const key = deriveKey(getLudwittSessionSecret());
    const data = Buffer.from(payload, "base64url");
    const iv = data.subarray(0, 12);
    const tag = data.subarray(12, 28);
    const encrypted = data.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
    const parsed = JSON.parse(decrypted) as LudwittSession;
    if (!parsed.sub || !parsed.accessToken || !parsed.refreshToken) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function toPublicUser(session: LudwittSession): PublicLudwittUser {
  return {
    sub: session.sub,
    email: session.email,
    name: session.name,
    picture: session.picture,
  };
}

export function isAccessTokenExpired(session: LudwittSession): boolean {
  return Date.now() >= session.accessTokenExpiresAt - 60_000;
}
