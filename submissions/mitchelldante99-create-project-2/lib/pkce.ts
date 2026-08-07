import { randomBytes, createHash } from "crypto";

function base64url(input: Buffer): string {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
  // 43-128 char URL-safe random string
  return base64url(randomBytes(64));
}

export function generateCodeChallenge(verifier: string): string {
  const hash = createHash("sha256").update(verifier).digest();
  return base64url(hash);
}

export function generateState(): string {
  return base64url(randomBytes(32));
}
