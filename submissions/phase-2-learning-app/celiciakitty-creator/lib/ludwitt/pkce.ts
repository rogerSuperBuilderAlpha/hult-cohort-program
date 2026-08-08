import { createHash, randomBytes } from "crypto";

/** URL-safe base64 without padding (RFC 7636). */
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Generate a PKCE code_verifier (43–128 URL-safe characters). */
export function generateCodeVerifier(): string {
  return base64UrlEncode(randomBytes(32));
}

/** S256 code challenge from verifier. */
export function generateCodeChallenge(verifier: string): string {
  const digest = createHash("sha256").update(verifier).digest();
  return base64UrlEncode(digest);
}

/** CSRF state token for OAuth authorize redirect. */
export function generateOAuthState(): string {
  return base64UrlEncode(randomBytes(32));
}
