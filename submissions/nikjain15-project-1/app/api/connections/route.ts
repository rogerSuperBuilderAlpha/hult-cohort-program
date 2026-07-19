import { NextResponse } from 'next/server';
import { byAuthor, fetchCohortPulls } from '@/lib/github';
import { NON_PARTICIPANTS } from '@/lib/pre-index';
import { findConnection, type Connection, type MemberWork } from '@/lib/connections';

/**
 * POST /api/connections — "Pulse spotted a connection."
 *
 * Given your own work (your board's task titles, sent by the client), Pulse looks across the
 * cohort's PUBLIC PRs and finds one person working on the same kind of thing, so it can
 * suggest you compare notes.
 *
 * Rails (this is the most sensitive surface in the reshape, so the boundaries are explicit):
 *   - It reads ONLY the public cohort repo (`fetchCohortPulls`, the same source the signed-out
 *     landing page uses — public record, not a disclosure). It never touches the private
 *     "stuck" signal the Broker protects.
 *   - The match is a pure heuristic (`findConnection`) — no model call — so nothing here is a
 *     model-written characterisation of another member (which would need their opt-in). The
 *     only thing about the other person that ever leaves this route is their own public PR
 *     title, quoted verbatim.
 *   - It returns at most ONE suggestion, and only to you, about your own work. It never ranks
 *     anyone and never counts anyone.
 *
 * Degrades to `{ connection: null }` on any failure — no key needed (there is no model), and a
 * GitHub outage simply means no suggestion, never an error.
 */

type ConnRequest = { handle: unknown; workHints: unknown };

export async function POST(request: Request) {
  let body: ConnRequest;
  try {
    body = (await request.json()) as ConnRequest;
  } catch {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  const handle = typeof body.handle === 'string' && body.handle.trim() ? body.handle.trim() : null;
  const workHints = (Array.isArray(body.workHints) ? body.workHints : [])
    .filter((h): h is string => typeof h === 'string')
    .slice(0, 40)
    .map((h) => h.slice(0, 200));

  if (workHints.length === 0) {
    return NextResponse.json({ connection: null } satisfies { connection: Connection | null });
  }

  const result = await fetchCohortPulls();
  if (!result.ok) {
    // Degrade loudly-but-calmly: no suggestion, never a fabricated one.
    return NextResponse.json({ connection: null, reason: 'unreachable' });
  }

  const others: MemberWork[] = [];
  for (const [author, pulls] of byAuthor(result.data)) {
    if (NON_PARTICIPANTS.has(author.toLowerCase())) continue; // Roger isn't a participant
    others.push({
      handle: author,
      // The route has no display names (those live in Firestore); the client resolves the
      // handle to a member's name. Handle stands in until then.
      displayName: author,
      prs: pulls.slice(0, 20).map((p) => ({ number: p.number, title: p.title })),
    });
  }

  const connection = findConnection(workHints, handle, others);
  return NextResponse.json({ connection } satisfies { connection: Connection | null });
}
