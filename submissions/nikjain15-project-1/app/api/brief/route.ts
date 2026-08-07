import { NextResponse } from 'next/server';
import { composeBrief, type BriefResult } from '@/lib/brief';
import type { BriefFacts } from '@/lib/brief-fallback';
import { evictExpired, hitRateLimit, type RateLimitState } from '@/lib/rate-limit';

/**
 * POST /api/brief — the sentence or two Pulse greets you with on Home. Phase 1 of the
 * conversational Home.
 *
 * **Why a route.** `ANTHROPIC_API_KEY` is server-side only and must never be `NEXT_PUBLIC_`
 * (AGENTS rule 8), the same as /api/narrate. The browser gets a sentence back, never the key.
 *
 * **Why the caller decides the opt-in.** The brief is self-narration — it describes the
 * reader's own week and the cohort's collective momentum, never another named individual.
 * `narrationOptIn` lives on the reader's own consent doc, which only they can read under the
 * rules, so the gate is asked of the one person entitled to answer. If they haven't opted in,
 * the client never calls this route at all and shows the model-free `assembleBrief` instead;
 * this route trusts that gate the way /api/narrate does.
 *
 * On every failure — no key, model down, rate limit — it returns `facts_only`, and the client
 * falls back to the warm assembled sentence. Never a 500, never a fabricated number.
 */

const RATE_LIMIT = 20;
const WINDOW_MS = 60_000;
const rateStore = new Map<string, RateLimitState>();

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || 'unknown';
}

function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

/** Coerce an untrusted body into safe, bounded facts. Never trusts, always defaults — the
 *  route has no auth (no server session, no Admin SDK), so its job is to refuse to turn one
 *  request into an unbounded bill, exactly as /api/narrate bounds its arrays. */
function toFacts(body: unknown): BriefFacts | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  if (typeof b.displayName !== 'string' || b.displayName.trim().length === 0) return null;
  const titles = Array.isArray(b.yourOpenTitles) ? b.yourOpenTitles : [];
  return {
    displayName: b.displayName.slice(0, 120),
    cohortShipped: num(b.cohortShipped),
    cohortFiguredOut: num(b.cohortFiguredOut),
    cohortUnstuck: num(b.cohortUnstuck),
    shipStreakDays: num(b.shipStreakDays),
    youShipped: num(b.youShipped),
    youUnstuck: num(b.youUnstuck),
    youKudos: num(b.youKudos),
    yourOpenTitles: titles
      .filter((t): t is string => typeof t === 'string')
      .slice(0, 12)
      .map((t) => t.slice(0, 160)),
  };
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  const facts = toFacts(raw);
  if (!facts) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const now = Date.now();
  evictExpired(rateStore, now, WINDOW_MS);
  const gate = hitRateLimit(rateStore, clientIp(request), now, RATE_LIMIT, WINDOW_MS);
  if (gate.limited) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(gate.retryAfterMs / 1000)) } }
    );
  }

  const result: BriefResult = await composeBrief(facts);
  // 200 on every path: facts_only is an outcome the client handles (warm fallback), not an
  // error. composeBrief never throws.
  return NextResponse.json(result);
}
