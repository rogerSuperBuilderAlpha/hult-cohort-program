import { byAuthor, evidenceFor, fetchCohortPulls } from './github';
import { ENROLLED, type CohortSnapshot, type PublicMember } from './cohort';

/**
 * Read the public cohort repo and build the cohort as facts.
 *
 * Server-side. No auth, no Firestore, no model — this runs for a signed-out visitor, so
 * there is no signup wall in front of the value. Roughly one API call: a single request
 * returns 100 PRs, which covers the cohort.
 *
 * ⚠️ **Facts only, and that boundary is the whole ethical design.** Merged PRs are public
 * record and showing them isn't a disclosure. A model-written sentence about someone who
 * never opted in would be. Nothing here calls a model; `narrationOptIn` gates that, and it
 * defaults to false for every person who has never signed up.
 */
export async function buildCohortSnapshot(): Promise<CohortSnapshot> {
  const fetchedAt = new Date().toISOString();
  const result = await fetchCohortPulls();

  if (!result.ok) {
    // Degrade loudly and honestly. An empty cohort rendered as though it were the truth is
    // the exact lie this product exists to avoid — the caller shows the banner.
    return {
      members: [],
      enrolled: ENROLLED,
      fetchedAt,
      degraded: {
        kind: result.failure.kind,
        resetAt:
          result.failure.kind === 'rate_limited' && result.failure.resetAt
            ? result.failure.resetAt.toISOString()
            : null,
      },
    };
  }

  const members: PublicMember[] = [];

  for (const [handle, pulls] of byAuthor(result.data)) {
    const latest = pulls
      .map((p) => new Date(p.updated_at).getTime())
      .filter((t) => !Number.isNaN(t));

    members.push({
      handle,
      evidence: evidenceFor(pulls),
      lastSeenAt: new Date(latest.length ? Math.max(...latest) : Date.now()).toISOString(),
      // False for everyone here, always. These people have not signed up, let alone
      // agreed to be written about. Only /connect can flip this, and only for yourself.
      narrationOptIn: false,
    });
  }

  return { members, enrolled: ENROLLED, fetchedAt, degraded: null };
}

/**
 * The repo's own maintainer is not a cohort participant.
 *
 * Counting Roger inflates "N people have shipped this week" — the one number the landing
 * page leads with. It has to be true or the page's whole argument is worthless.
 */
export const NON_PARTICIPANTS = new Set(['rogersuperbuilderalpha']);

export function participantsOnly(members: PublicMember[]): PublicMember[] {
  return members.filter((m) => !NON_PARTICIPANTS.has(m.handle.toLowerCase()));
}
