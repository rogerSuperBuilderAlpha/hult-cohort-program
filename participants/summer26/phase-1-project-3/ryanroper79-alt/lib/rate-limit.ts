const buckets = new Map<string, { count: number; reset: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { allowed: true as const, retryAfterSec: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false as const,
      retryAfterSec: Math.ceil((bucket.reset - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true as const, retryAfterSec: 0 };
}

export function clientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
