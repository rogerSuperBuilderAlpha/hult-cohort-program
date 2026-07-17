import { NextResponse } from 'next/server';
import { narrate, type NarrationResult } from '@/lib/narrate';
import type { Evidence } from '@/lib/types';

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
  cachedKey: string | null;
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

  const result: NarrationResult = await narrate({
    handle: body.handle,
    displayName: body.displayName,
    evidence: body.evidence,
    material: Array.isArray(body.material) ? body.material : [],
    commitShas: Array.isArray(body.commitShas) ? body.commitShas : [],
    otherMembers: Array.isArray(body.otherMembers) ? body.otherMembers : [],
    cachedKey: body.cachedKey ?? null,
  });

  // 200 on every path: facts_only and skipped_cached are outcomes the caller handles, not
  // errors. narrate() never throws.
  return NextResponse.json(result);
}
