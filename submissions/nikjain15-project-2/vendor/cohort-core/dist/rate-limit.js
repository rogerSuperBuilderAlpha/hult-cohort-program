/**
 * A fixed-window rate limiter, kept pure so it can be tested without a clock or a network.
 *
 * **What this is and isn't.** `/api/narrate` has no auth — there's no server session and no
 * Admin SDK, a limitation the PR states plainly. Input bounds already stop one request from
 * becoming an enormous bill; this stops MANY cheap requests from doing the same. It is the
 * second half of "don't let a stranger drain ~$11 of pilot credit".
 *
 * It is deliberately in-memory and therefore **best-effort on Vercel**: serverless instances
 * don't share memory, so the real ceiling is (limit × warm instances), not `limit`. That is
 * fine for its actual job — it turns "unlimited from one IP" into "bounded per instance",
 * which defeats a naive loop from a single origin. A hard, shared quota is a Firestore- or
 * Redis-backed counter, and that's the documented next step, not this.
 *
 * Fixed window, not sliding: a sliding log would retain one timestamp per hit and become its
 * own small memory leak under abuse — exactly the condition a rate limiter exists for. A
 * window that resets wholesale keeps at most one small record per key.
 */
/**
 * Record a hit and decide whether it's over the limit.
 *
 * Mutates `store` in place — the caller owns the Map's lifetime (a module-level singleton in
 * the route, a fresh Map in a test). `now` and the limits are injected so a test controls
 * both without touching Date.now().
 */
export function hitRateLimit(store, key, now, limit, windowMs) {
    const state = store.get(key);
    // No window yet, or the previous one has fully elapsed — start a fresh one.
    if (!state || now - state.windowStart >= windowMs) {
        store.set(key, { count: 1, windowStart: now });
        return { limited: false, retryAfterMs: 0 };
    }
    state.count += 1;
    if (state.count > limit) {
        return { limited: true, retryAfterMs: windowMs - (now - state.windowStart) };
    }
    return { limited: false, retryAfterMs: 0 };
}
/**
 * Drop windows that have fully elapsed, so an attacker cycling through many IPs can't grow
 * the map without bound. Called opportunistically by the route, not on a timer.
 */
export function evictExpired(store, now, windowMs) {
    for (const [key, state] of store) {
        if (now - state.windowStart >= windowMs)
            store.delete(key);
    }
}
