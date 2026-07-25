import { NextResponse } from 'next/server';
import { narrate, type NarrationResult } from '@/lib/narrate';
import { evictExpired, hitRateLimit, type RateLimitState } from '@/lib/rate-limit';
import type { Evidence } from '@/lib/types';

/**
 * Per-IP rate limit, module-level so it survives between requests on a warm instance.
 *
 * 20 model calls per minute per IP. A real member's sync narrates a handful of times and is
 * SHA-range-cached besides, so this never touches a legitimate user; it caps a loop from one
 * origin at 20/min/instance instead of unbounded. Best-effort by design (see lib/rate-limit).
 */
const RATE_LIMIT = 20;
const WINDOW_MS = 60_000;
const rateStore = new Map<string, RateLimitState>();

/** The caller's IP, as Vercel's proxy reports it. Falls back to a shared bucket. */
function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || 'unknown';
}

/**
 * POST /api/narrate — one sentence about what YOU shipped. DESIGN-SPEC §4.
 *
 * **Why a route.** `ANTHROPIC_API_KEY` is server-side only and must never be
 * `NEXT_PUBLIC_`. The browser gets a sentence back; it never gets the key, and the model
 * is never called from a client.
 *
 * **Why the caller decides the opt-in, and why that's sound.** A narrative may only ever
 * describe the actor, and the actor here is the signed-in member asking about themselves.
 * Consent lives on `githubLinks/{uid}` — the doc only they can write (`isSelf(uid)`), and
 * the authoritative record per `types.ts`. So the gate is "did I agree to be narrated",
 * asked of the one person entitled to answer. The server can't check it: the rules require
 * auth for that read and there's no Admin SDK here.
 *
 * That leaves the obvious question — can I ask for a sentence about someone else? You can
 * pass any handle, but it buys nothing:
 *   - `checkNarrative` rejects any narrative naming another member, which is injection's
 *     entire payoff, and it runs before this route returns anything;
 *   - the `pulse` rules only let you publish events attributed to yourself;
 *   - the material you'd pass is public GitHub text you could read anyway.
 * The output is a sentence about the actor or nothing at all.
 *
 * On every failure — no key, rate limit, refusal, a narrative that fails the check — this
 * returns `facts_only`. The facts came from the API and cannot be wrong, so they are always
 * publishable. A sensing failure must never block the board or surface a scary error.
 */

export type NarrateRequest = {
  handle: string;
  displayName: string;
  evidence: Evidence;
  /** Commit messages, PR titles, branch names. Attacker-controlled — never file contents. */
  material: string[];
  /** Identity of the work being described. See the cache note in lib/sync.ts. */
  commitShas: string[];
  otherMembers: { handle: string | null; displayName: string }[];
  /** Every work key already narrated for this member. A set — see lib/types.ts. */
  narratedKeys: string[];
};

export async function POST(request: Request) {
  let body: NarrateRequest;
  try {
    body = (await request.json()) as NarrateRequest;
  } catch {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  if (typeof body?.handle !== 'string' || !body.handle || typeof body.displayName !== 'string') {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  // Rate-check before the model call — the whole point is to not pay for the abusive one.
  const now = Date.now();
  evictExpired(rateStore, now, WINDOW_MS);
  const gate = hitRateLimit(rateStore, clientIp(request), now, RATE_LIMIT, WINDOW_MS);
  if (gate.limited) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(gate.retryAfterMs / 1000)) } }
    );
  }

  /**
   * Bound every array before it reaches the model.
   *
   * This route has no auth — it can't, there's no server session and no Admin SDK, which
   * is a real limitation stated in the PR. What it CAN do is refuse to turn one request
   * into an unbounded bill. `buildPrompt` already caps each line at 500 chars but never
   * capped the array, so a single POST with a 200k-element `material` was one enormous
   * input-token charge against ~$11 of pilot credit. A real member's week is a handful of
   * commits; these ceilings are far above that and far below abuse.
   */
  const result: NarrationResult = await narrate({
    handle: body.handle.slice(0, 39),
    displayName: body.displayName.slice(0, 120),
    // Defaulted, not trusted: an omitted or malformed evidence would throw inside
    // formatEvidence, and narrate() promises never to throw.
    evidence: isEvidence(body.evidence)
      ? body.evidence
      : { commits: 0, prNumbers: [], files: [], spanHours: null },
    material: (Array.isArray(body.material) ? body.material : []).slice(0, 50),
    commitShas: (Array.isArray(body.commitShas) ? body.commitShas : []).slice(0, 200),
    otherMembers: (Array.isArray(body.otherMembers) ? body.otherMembers : []).slice(0, 100),
    // Bounded like the rest: the set grows with a member's shipped work, but a single
    // request must never turn it into an unbounded input. 1000 PRs is far above a pilot.
    narratedKeys: (Array.isArray(body.narratedKeys) ? body.narratedKeys : []).slice(0, 1000),
  });

  // 200 on every path: facts_only and skipped_cached are outcomes the caller handles, not
  // errors. narrate() never throws.
  return NextResponse.json(result);
}

/** Enough of an Evidence shape that formatEvidence won't throw on it. */
function isEvidence(v: unknown): v is import('@/lib/types').Evidence {
  if (typeof v !== 'object' || v === null) return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.commits === 'number' &&
    Array.isArray(e.prNumbers) &&
    Array.isArray(e.files) &&
    (e.spanHours === null || typeof e.spanHours === 'number')
  );
}
