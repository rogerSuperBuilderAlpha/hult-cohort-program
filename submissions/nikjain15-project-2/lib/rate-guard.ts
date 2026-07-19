import { evictExpired, hitRateLimit, type RateLimitState } from '@cohort/core/rate-limit';

/**
 * Per-route rate limiting for the model/detection endpoints, keyed by uid.
 *
 * The model routes cost money and read attacker-influenced text; an unbounded loop from one
 * account is both a bill and a spam vector (flooding a peer with suggested recognitions). This
 * caps calls per uid per window. Best-effort/in-memory like Pulse's — the real ceiling on
 * Vercel is (limit × warm instances), which still turns "unlimited from one account" into
 * "bounded", the actual job here. A hard shared quota is a Firestore counter, the documented
 * next step.
 */
const stores = new Map<string, Map<string, RateLimitState>>();

function storeFor(bucket: string): Map<string, RateLimitState> {
  let s = stores.get(bucket);
  if (!s) {
    s = new Map();
    stores.set(bucket, s);
  }
  return s;
}

/** Returns true if this call is allowed, false if it should be rejected (429). */
export function allow(bucket: string, uid: string, limit: number, windowMs: number, now: number): boolean {
  const store = storeFor(bucket);
  evictExpired(store, now, windowMs);
  return !hitRateLimit(store, uid, now, limit, windowMs).limited;
}
