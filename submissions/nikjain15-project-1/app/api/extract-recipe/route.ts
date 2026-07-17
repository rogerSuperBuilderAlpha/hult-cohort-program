import { NextResponse } from 'next/server';
import { extractRecipe, type ExtractionResult } from '@/lib/extract';
import { evictExpired, hitRateLimit, type RateLimitState } from '@/lib/rate-limit';

/**
 * POST /api/extract-recipe — draft a recipe from a merged PR's public evidence.
 * LAYER-2-3-DESIGN.md, Layer 2.
 *
 * **Why a route.** Same two secrets as narration: ANTHROPIC_API_KEY makes the draft,
 * GITHUB_TOKEN fetches the PR's commits, and neither may ship to a browser. The client
 * sends a PR number and title; the server reads the rest from GitHub itself — commit
 * messages never round-trip through the client at all.
 *
 * **Why no auth, and why that's sound.** Everything read here is public GitHub record,
 * and everything returned is a private DRAFT that only becomes a recipe when a signed-in
 * human edits it and taps "Bank it" — the write path is `createRecipe`, which the rules
 * gate on the author's own uid. Calling this about someone else's PR buys you a summary
 * of public commit messages you could read on github.com.
 *
 * On every failure — no key, GitHub down, thin evidence, an unparseable reply — this
 * returns `thin: true` and extracts nothing. Never a fabricated recipe. Never a 500.
 */

/**
 * Tighter than narrate's 20: a legitimate tap is a human deciding to bank something,
 * which happens a few times a week per member, not per minute. Same best-effort,
 * per-instance semantics as lib/rate-limit documents.
 */
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;
const rateStore = new Map<string, RateLimitState>();

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || 'unknown';
}

export type ExtractRecipeRequest = {
  prNumber: number;
  prTitle: string;
};

export type { ExtractionResult };

export async function POST(request: Request) {
  let body: ExtractRecipeRequest;
  try {
    body = (await request.json()) as ExtractRecipeRequest;
  } catch {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  // A PR number is a small positive integer or the request is nonsense. Bounding it also
  // bounds the GitHub fetch — there is no array input here to cap, so this is the input
  // bound.
  if (
    typeof body?.prNumber !== 'number' ||
    !Number.isInteger(body.prNumber) ||
    body.prNumber < 1 ||
    body.prNumber > 1_000_000 ||
    typeof body.prTitle !== 'string'
  ) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  // Rate-check before any fetch or model call — the point is to not pay for abuse.
  const now = Date.now();
  evictExpired(rateStore, now, WINDOW_MS);
  const gate = hitRateLimit(rateStore, clientIp(request), now, RATE_LIMIT, WINDOW_MS);
  if (gate.limited) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(gate.retryAfterMs / 1000)) } }
    );
  }

  const result = await extractRecipe({
    prNumber: body.prNumber,
    prTitle: body.prTitle.slice(0, 300),
  });

  // 200 on every path: `thin` is an outcome the modal handles calmly, not an error.
  return NextResponse.json(result);
}
