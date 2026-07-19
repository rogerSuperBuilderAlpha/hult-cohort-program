import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verify a GitHub webhook signature (X-Hub-Signature-256: sha256=<hex>) over the RAW body
 * with the shared secret. A webhook is an unauthenticated public endpoint that triggers a
 * privileged action (marking a commitment done, awarding XP), so the signature is the only
 * thing standing between "GitHub said so" and "anyone with the URL said so". Constant-time
 * compare so a timing side-channel can't leak the expected digest.
 */
export function verifyGithubSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret) return false;
  const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
