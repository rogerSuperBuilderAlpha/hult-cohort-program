/** Simple in-memory sliding-window rate limiter for serverless (best-effort per instance).
 *
 * Limits are NOT shared across Vercel function instances — treat as a soft guard only.
 * Authenticated routes also rate-limit by GitHub handle, which is the stronger defense.
 * IP keys use Vercel-set headers (x-vercel-forwarded-for) rather than spoofable x-forwarded-for.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

/** Client IP for rate-limit keys — prefer Vercel-set headers over spoofable x-forwarded-for. */
export function clientIp(request: Request): string {
  const vercelIp = request.headers.get('x-vercel-forwarded-for')?.trim();
  if (vercelIp) return vercelIp.split(',')[0]?.trim() || vercelIp;

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;

  return 'unknown';
}
