import { describe, expect, it } from 'vitest';
import {
  evictExpired,
  hitRateLimit,
  type RateLimitResult,
  type RateLimitState,
} from '@/lib/rate-limit';

/**
 * Additional edge-case coverage for the fixed-window limiter guarding /api/narrate.
 * Companion to rate-limit.test.ts — focuses on exact boundaries (the limit itself,
 * the window edge where `>=` decides reset-vs-block), retryAfter arithmetic across the
 * whole window, eviction corner cases, and clock-skew / degenerate-limit behaviour.
 * Pure and clock-injected: no timer, no network, no emulator.
 */

const LIMIT = 3;
const WINDOW = 1000;

function freshStore() {
  return new Map<string, RateLimitState>();
}

describe('hitRateLimit — the limit boundary', () => {
  it('allows exactly `limit` hits inside one window', () => {
    const store = freshStore();
    for (let i = 1; i <= LIMIT; i++) {
      expect(hitRateLimit(store, 'ip', 10, LIMIT, WINDOW).limited, `hit ${i}`).toBe(false);
    }
  });

  it('blocks the (limit+1)th hit and every hit after it in the window', () => {
    const store = freshStore();
    for (let i = 1; i <= LIMIT; i++) hitRateLimit(store, 'ip', 10, LIMIT, WINDOW);
    expect(hitRateLimit(store, 'ip', 10, LIMIT, WINDOW).limited).toBe(true);
    expect(hitRateLimit(store, 'ip', 10, LIMIT, WINDOW).limited).toBe(true);
    expect(hitRateLimit(store, 'ip', 10, LIMIT, WINDOW).limited).toBe(true);
  });

  it('the hit that reaches count===limit is NOT limited (strict > comparison)', () => {
    const store = freshStore();
    hitRateLimit(store, 'ip', 0, LIMIT, WINDOW); // count 1
    hitRateLimit(store, 'ip', 0, LIMIT, WINDOW); // count 2
    const atLimit = hitRateLimit(store, 'ip', 0, LIMIT, WINDOW); // count 3 === LIMIT
    expect(atLimit.limited).toBe(false);
    expect(store.get('ip')?.count).toBe(LIMIT);
  });

  it('a limit of 1 allows a single hit then blocks the second', () => {
    const store = freshStore();
    expect(hitRateLimit(store, 'ip', 0, 1, WINDOW).limited).toBe(false);
    expect(hitRateLimit(store, 'ip', 0, 1, WINDOW).limited).toBe(true);
  });

  it('a limit of 0 still lets the very first hit through — fresh-window path skips the check', () => {
    // NOTE: the fresh-window branch never consults `limit`, so the opening hit of every
    // window is unconditionally allowed regardless of how low the limit is set.
    const store = freshStore();
    expect(hitRateLimit(store, 'ip', 0, 0, WINDOW).limited).toBe(false);
    // The second hit is count 2 > 0 → blocked.
    expect(hitRateLimit(store, 'ip', 0, 0, WINDOW).limited).toBe(true);
  });

  it('a negative limit blocks from the second hit (first still passes)', () => {
    const store = freshStore();
    expect(hitRateLimit(store, 'ip', 0, -5, WINDOW).limited).toBe(false);
    expect(hitRateLimit(store, 'ip', 0, -5, WINDOW).limited).toBe(true);
  });

  it('non-limited results always carry retryAfterMs of 0', () => {
    const store = freshStore();
    for (let i = 1; i <= LIMIT; i++) {
      const r = hitRateLimit(store, 'ip', 5, LIMIT, WINDOW);
      expect(r.retryAfterMs).toBe(0);
    }
  });
});

describe('hitRateLimit — the window edge (>= vs <)', () => {
  it('one millisecond before the edge stays in the SAME window (still blocked)', () => {
    const store = freshStore();
    for (let i = 0; i < LIMIT; i++) hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    // now - windowStart = WINDOW - 1 < WINDOW → same window, over limit → blocked.
    const r = hitRateLimit(store, 'ip', WINDOW - 1, LIMIT, WINDOW);
    expect(r.limited).toBe(true);
    expect(r.retryAfterMs).toBe(1);
  });

  it('exactly at the window edge resets (now - windowStart === windowMs)', () => {
    const store = freshStore();
    for (let i = 0; i < LIMIT; i++) hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    // now - windowStart = WINDOW, and the guard is `>=`, so a brand-new window opens.
    const r = hitRateLimit(store, 'ip', WINDOW, LIMIT, WINDOW);
    expect(r.limited).toBe(false);
    expect(r.retryAfterMs).toBe(0);
    expect(store.get('ip')).toEqual({ count: 1, windowStart: WINDOW });
  });

  it('past the edge opens a fresh window and re-anchors windowStart to now', () => {
    const store = freshStore();
    hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    hitRateLimit(store, 'ip', 5000, LIMIT, WINDOW); // way past edge
    expect(store.get('ip')).toEqual({ count: 1, windowStart: 5000 });
  });

  it('after a rollover the fresh window grants a full new allowance of `limit` hits', () => {
    const store = freshStore();
    for (let i = 0; i < LIMIT; i++) hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    expect(hitRateLimit(store, 'ip', 0, LIMIT, WINDOW).limited).toBe(true);
    // New window at t=WINDOW: first opens it, then LIMIT-1 more are allowed, then block.
    expect(hitRateLimit(store, 'ip', WINDOW, LIMIT, WINDOW).limited).toBe(false); // count 1
    for (let i = 2; i <= LIMIT; i++) {
      expect(hitRateLimit(store, 'ip', WINDOW, LIMIT, WINDOW).limited, `new hit ${i}`).toBe(false);
    }
    expect(hitRateLimit(store, 'ip', WINDOW, LIMIT, WINDOW).limited).toBe(true);
  });

  it('windowStart is anchored to the FIRST hit, not subsequent ones inside the window', () => {
    const store = freshStore();
    hitRateLimit(store, 'ip', 100, LIMIT, WINDOW); // opens window at 100
    hitRateLimit(store, 'ip', 400, LIMIT, WINDOW);
    hitRateLimit(store, 'ip', 900, LIMIT, WINDOW);
    expect(store.get('ip')?.windowStart).toBe(100);
    // Edge is measured from 100, so it resets at now=1100, not before.
    expect(hitRateLimit(store, 'ip', 1099, LIMIT, WINDOW).limited).toBe(true);
    expect(hitRateLimit(store, 'ip', 1100, LIMIT, WINDOW).limited).toBe(false);
  });
});

describe('hitRateLimit — retryAfterMs arithmetic', () => {
  it('equals the full window when the blocking hit lands at the exact window start', () => {
    const store = freshStore();
    for (let i = 0; i < LIMIT; i++) hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    const r = hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    expect(r.limited).toBe(true);
    expect(r.retryAfterMs).toBe(WINDOW); // windowMs - 0
  });

  it('shrinks as `now` advances through the window', () => {
    const store = freshStore();
    for (let i = 0; i < LIMIT; i++) hitRateLimit(store, 'ip', 200, LIMIT, WINDOW); // window opens at 200
    expect(hitRateLimit(store, 'ip', 200, LIMIT, WINDOW).retryAfterMs).toBe(1000);
    expect(hitRateLimit(store, 'ip', 500, LIMIT, WINDOW).retryAfterMs).toBe(700);
    expect(hitRateLimit(store, 'ip', 950, LIMIT, WINDOW).retryAfterMs).toBe(250);
    expect(hitRateLimit(store, 'ip', 1199, LIMIT, WINDOW).retryAfterMs).toBe(1);
  });

  it('is always strictly positive on a limited result and never exceeds the window (no skew)', () => {
    const store = freshStore();
    for (let i = 0; i < LIMIT; i++) hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    for (const now of [0, 1, 250, 500, 999]) {
      const r = hitRateLimit(store, 'ip', now, LIMIT, WINDOW);
      expect(r.limited).toBe(true);
      expect(r.retryAfterMs).toBeGreaterThan(0);
      expect(r.retryAfterMs).toBeLessThanOrEqual(WINDOW);
    }
  });

  it('backward clock skew inflates retryAfter beyond the window (now < windowStart)', () => {
    // Documents a real quirk: a `now` earlier than windowStart yields
    // windowMs - (negative) > windowMs. Worth noting, not fixing here.
    const store = freshStore();
    for (let i = 0; i < LIMIT; i++) hitRateLimit(store, 'ip', 500, LIMIT, WINDOW);
    const r = hitRateLimit(store, 'ip', 300, LIMIT, WINDOW); // now < windowStart
    expect(r.limited).toBe(true);
    expect(r.retryAfterMs).toBe(WINDOW - (300 - 500)); // 1200
  });
});

describe('hitRateLimit — state, mutation and key isolation', () => {
  it('mutates the caller-owned Map in place rather than returning a new store', () => {
    const store = freshStore();
    const before = store;
    hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    expect(store).toBe(before);
    expect(store.has('ip')).toBe(true);
  });

  it('increments count on the same state object across in-window hits', () => {
    const store = freshStore();
    hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    const stateRef = store.get('ip');
    hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    // Same object identity, count advanced.
    expect(store.get('ip')).toBe(stateRef);
    expect(store.get('ip')?.count).toBe(3);
  });

  it('keeps counting past the limit while blocked (count is not clamped)', () => {
    const store = freshStore();
    for (let i = 0; i < LIMIT + 3; i++) hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    expect(store.get('ip')?.count).toBe(LIMIT + 3);
  });

  it('rollover replaces the state object and resets count to 1', () => {
    const store = freshStore();
    hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    const first = store.get('ip');
    hitRateLimit(store, 'ip', WINDOW, LIMIT, WINDOW); // new window
    expect(store.get('ip')).not.toBe(first);
    expect(store.get('ip')?.count).toBe(1);
  });

  it('two keys hold independent windowStarts and counts', () => {
    const store = freshStore();
    hitRateLimit(store, 'a', 0, LIMIT, WINDOW);
    hitRateLimit(store, 'b', 600, LIMIT, WINDOW);
    hitRateLimit(store, 'a', 0, LIMIT, WINDOW);
    expect(store.get('a')).toEqual({ count: 2, windowStart: 0 });
    expect(store.get('b')).toEqual({ count: 1, windowStart: 600 });
  });

  it('exhausting one key never blocks another, and empty-string is its own key', () => {
    const store = freshStore();
    for (let i = 0; i <= LIMIT; i++) hitRateLimit(store, 'abuser', 0, LIMIT, WINDOW);
    expect(hitRateLimit(store, 'abuser', 0, LIMIT, WINDOW).limited).toBe(true);
    expect(hitRateLimit(store, '', 0, LIMIT, WINDOW).limited).toBe(false);
    expect(hitRateLimit(store, 'other', 0, LIMIT, WINDOW).limited).toBe(false);
  });

  it('one abuser rolling over does not disturb a second key still inside its window', () => {
    const store = freshStore();
    for (let i = 0; i < LIMIT; i++) hitRateLimit(store, 'a', 0, LIMIT, WINDOW);
    hitRateLimit(store, 'b', 800, LIMIT, WINDOW);
    hitRateLimit(store, 'a', WINDOW, LIMIT, WINDOW); // a rolls over
    expect(store.get('b')).toEqual({ count: 1, windowStart: 800 });
  });

  it('the result shape is exactly { limited, retryAfterMs }', () => {
    const store = freshStore();
    const r: RateLimitResult = hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    expect(Object.keys(r).sort()).toEqual(['limited', 'retryAfterMs']);
  });
});

describe('evictExpired — bounded memory', () => {
  it('is a no-op on an empty store', () => {
    const store = freshStore();
    expect(() => evictExpired(store, 1000, WINDOW)).not.toThrow();
    expect(store.size).toBe(0);
  });

  it('deletes a window that is exactly at the edge (>= boundary)', () => {
    const store = freshStore();
    hitRateLimit(store, 'edge', 0, LIMIT, WINDOW);
    evictExpired(store, WINDOW, WINDOW); // now - start === windowMs → evict
    expect(store.has('edge')).toBe(false);
  });

  it('keeps a window one millisecond short of the edge', () => {
    const store = freshStore();
    hitRateLimit(store, 'young', 0, LIMIT, WINDOW);
    evictExpired(store, WINDOW - 1, WINDOW);
    expect(store.has('young')).toBe(true);
  });

  it('evicts only the elapsed keys and leaves the rest untouched', () => {
    const store = freshStore();
    hitRateLimit(store, 'expired-1', 0, LIMIT, WINDOW);
    hitRateLimit(store, 'expired-2', 50, LIMIT, WINDOW);
    hitRateLimit(store, 'fresh', 900, LIMIT, WINDOW);
    evictExpired(store, 1100, WINDOW);
    expect(store.has('expired-1')).toBe(false);
    expect(store.has('expired-2')).toBe(false);
    expect(store.has('fresh')).toBe(true);
    expect(store.size).toBe(1);
  });

  it('clears every key when all windows have elapsed', () => {
    const store = freshStore();
    hitRateLimit(store, 'a', 0, LIMIT, WINDOW);
    hitRateLimit(store, 'b', 100, LIMIT, WINDOW);
    hitRateLimit(store, 'c', 200, LIMIT, WINDOW);
    evictExpired(store, 10000, WINDOW);
    expect(store.size).toBe(0);
  });

  it('does not evict a window whose start is in the future (forward skew)', () => {
    const store = freshStore();
    hitRateLimit(store, 'future', 5000, LIMIT, WINDOW);
    evictExpired(store, 1000, WINDOW); // now < windowStart → negative, not >= windowMs
    expect(store.has('future')).toBe(true);
  });

  it('an evicted key can be re-added as a brand-new window by the next hit', () => {
    const store = freshStore();
    for (let i = 0; i < LIMIT + 1; i++) hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    evictExpired(store, WINDOW, WINDOW);
    expect(store.has('ip')).toBe(false);
    const r = hitRateLimit(store, 'ip', WINDOW, LIMIT, WINDOW);
    expect(r.limited).toBe(false);
    expect(store.get('ip')).toEqual({ count: 1, windowStart: WINDOW });
  });

  it('leaves an already-blocked but still-active key in place', () => {
    const store = freshStore();
    for (let i = 0; i < LIMIT + 2; i++) hitRateLimit(store, 'ip', 0, LIMIT, WINDOW);
    evictExpired(store, WINDOW - 1, WINDOW); // still inside window
    expect(store.has('ip')).toBe(true);
    // and it stays blocked
    expect(hitRateLimit(store, 'ip', WINDOW - 1, LIMIT, WINDOW).limited).toBe(true);
  });
});
