import { NextResponse } from 'next/server';
import { byAuthor, fetchCohortPulls, type GitHubPull } from '@/lib/github';
import { normaliseHandle } from '@/lib/opt-out';

/**
 * GET /api/sense?handle=x — one member's public work in the cohort repo. DESIGN-SPEC §4.
 *
 * **Why this is a route and not a client fetch.** `GITHUB_TOKEN` is server-side only:
 * unauthenticated GitHub is 60 req/hr *per IP* and Vercel egresses from shared IPs, so
 * the token is what makes sensing work at all — and `NEXT_PUBLIC_`ing it would serve it
 * to every visitor. The browser gets the answer, never the key.
 *
 * **Facts only, and that's why this needs no auth.** Everything here is already public
 * record on GitHub: PR numbers, titles, branch names, state. This endpoint cannot return
 * a model-written sentence about anyone — narration lives behind /api/narrate and is
 * gated on that person's own opt-in. Reading it about yourself, or about anyone, tells
 * you nothing github.com wouldn't.
 *
 * The writes this feeds are done by the BROWSER, not here: Firestore rules require a
 * signed-in user and there is no Admin SDK in this project, so the server has no identity
 * to write as. That's a constraint, but it's also the right shape — a card that appears
 * on your board is created as you.
 */

export type SensedPull = {
  number: number;
  title: string;
  branch: string | null;
  state: 'open' | 'closed';
  merged: boolean;
  createdAt: string;
};

export type SenseResponse =
  | { ok: true; handle: string; pulls: SensedPull[] }
  /** Degrade loudly. The caller shows a banner; it never presents stale as live. */
  | { ok: false; failure: 'rate_limited' | 'unreachable'; resetAt: string | null };

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('handle');
  const handle = raw ? normaliseHandle(raw) : null;

  if (!handle) {
    return NextResponse.json({ error: 'invalid_handle' }, { status: 400 });
  }

  const result = await fetchCohortPulls();

  if (!result.ok) {
    const failure = result.failure;
    const body: SenseResponse = {
      ok: false,
      failure: failure.kind,
      resetAt: failure.kind === 'rate_limited' ? (failure.resetAt?.toISOString() ?? null) : null,
    };
    // 200, not 5xx: this is a known, handled degradation with a shape the caller reads,
    // not a server error. The caller's job is to say so out loud, not to retry blindly.
    return NextResponse.json(body);
  }

  const mine = byAuthor(result.data).get(handle) ?? [];

  const body: SenseResponse = { ok: true, handle, pulls: mine.map(toSensed) };
  return NextResponse.json(body);
}

function toSensed(pull: GitHubPull): SensedPull {
  return {
    number: pull.number,
    title: pull.title,
    branch: pull.head?.ref ?? null,
    state: pull.state,
    merged: pull.merged_at !== null,
    createdAt: pull.created_at,
  };
}
