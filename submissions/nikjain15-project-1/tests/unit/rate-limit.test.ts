import { describe, expect, it } from 'vitest';
import { evictExpired, hitRateLimit, type RateLimitState } from '@/lib/rate-limit';

/**
 * The limiter that stops a stranger from draining the pilot's ~$11 of Anthropic credit
 * through the unauthenticated /api/narrate route. Pure and clock-injected, so these run
 * without a network or a real timer.
 */
describe('hitRateLimit — fixed window per key', () => {
  const LIMIT = 3;
  const WINDOW = 1000;

  it('allows up to the limit, then blocks', () => {
    const store = new Map<string, RateLimitState>();
    for (let i = 1; i <= LIMIT; i++) {
      expect(hitRateLimit(store, 'ip', 0, LIMIT, WINDOW).limited, `hit ${i}`).toBe(false);
    }
    // The (limit+1)th hit inside the window is blocked.
    expect(hitRateLimit(store, 'ip', 0, LIMIT, WINDOW).limited).toBe(true);
  });

  it('reports the time until the window resets', () => {
    const store = new Map<string, RateLimitState>();
    hitRateLimit(store, 'ip', 0, LIMIT, WINDOW); // window opens at t=0
    for (let i = 0; i < LIMIT; i++) hitRateLimit(store, 'ip', 200, LIMIT, WINDOW);
    const blocked = hitRateLimit(store, 'ip', 200, LIMIT, WINDOW);
    expect(blocked.limited).toBe(true);
    // window opened at 0, we're at 200, window is 1000 → 800 left.
    expect(blocked.retryAfterMs).toBe(800);
  });

  it('lets the same key through again once the window elapses', () => {
    const store = new Map<string, RateLimitState>();
    for (let i = 0; i < LIMIT; i++) hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    expect(hitRateLimit(store, 'ip', 0, LIMIT, WINDOW).limited).toBe(true);
    // A full window later, the count resets.
    expect(hitRateLimit(store, 'ip', WINDOW, LIMIT, WINDOW).limited).toBe(false);
  });

  it('meters each key independently — one abuser does not block everyone', () => {
    const store = new Map<string, RateLimitState>();
    for (let i = 0; i <= LIMIT; i++) hitRateLimit(store, 'abuser', 0, LIMIT, WINDOW);
    expect(hitRateLimit(store, 'abuser', 0, LIMIT, WINDOW).limited).toBe(true);
    // A different IP is untouched.
    expect(hitRateLimit(store, 'someone-else', 0, LIMIT, WINDOW).limited).toBe(false);
  });
});

describe('evictExpired — the store cannot grow without bound', () => {
  it('drops only fully-elapsed windows', () => {
    const store = new Map<string, RateLimitState>();
    hitRateLimit(store, 'old', 0, 3, 1000);
    hitRateLimit(store, 'fresh', 900, 3, 1000);
    evictExpired(store, 1000, 1000); // 'old' opened at 0, now 1000 → elapsed; 'fresh' at 900 → not
    expect(store.has('old')).toBe(false);
    expect(store.has('fresh')).toBe(true);
  });
});
