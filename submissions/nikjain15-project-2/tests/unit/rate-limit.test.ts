import { describe, expect, it } from 'vitest';
import { evictExpired, hitRateLimit, type RateLimitState } from '@cohort/core/rate-limit';

describe('rate-limit (shared @cohort/core) — guards Rally\'s model routes', () => {
  it('allows up to the limit, then blocks within the window', () => {
    const store = new Map<string, RateLimitState>();
    const key = 'ip';
    for (let i = 0; i < 3; i++) {
      expect(hitRateLimit(store, key, 1000, 3, 60_000).limited).toBe(false);
    }
    const over = hitRateLimit(store, key, 1000, 3, 60_000);
    expect(over.limited).toBe(true);
    expect(over.retryAfterMs).toBeGreaterThan(0);
  });

  it('resets after the window elapses', () => {
    const store = new Map<string, RateLimitState>();
    hitRateLimit(store, 'ip', 0, 1, 60_000);
    expect(hitRateLimit(store, 'ip', 100, 1, 60_000).limited).toBe(true);
    expect(hitRateLimit(store, 'ip', 60_001, 1, 60_000).limited).toBe(false);
  });

  it('evicts fully-elapsed windows so the map cannot grow unbounded', () => {
    const store = new Map<string, RateLimitState>();
    hitRateLimit(store, 'a', 0, 5, 60_000);
    evictExpired(store, 60_001, 60_000);
    expect(store.has('a')).toBe(false);
  });
});
