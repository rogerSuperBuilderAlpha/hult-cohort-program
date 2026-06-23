import { logApiError } from '@/lib/api-log';
import { setNextCohortInterest } from '@/lib/cohort-interest-server';
import { nextCohortId } from '@/lib/cohort-config';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { requireGithubSession } from '@/lib/require-enrolled';

export const runtime = 'nodejs';

const ROUTE = 'POST /api/cohort-interest';

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = checkRateLimit(`cohort-interest:${ip}`, 20, 60_000);
  if (!rate.allowed) {
    return Response.json(
      { error: 'Too many requests. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
    );
  }

  if (!nextCohortId()) {
    return Response.json({ error: 'Next cohort interest is not open yet.' }, { status: 503 });
  }

  const guard = await requireGithubSession(request);
  if (!guard.ok) return guard.response;

  try {
    const interest = await setNextCohortInterest({
      githubHandle: guard.session.githubHandle,
      firebaseUid: guard.session.firebaseUid,
      githubOAuthUid: guard.session.githubUid,
    });
    return Response.json({ ok: true, ...interest });
  } catch (err) {
    logApiError(ROUTE, err);
    const message = err instanceof Error ? err.message : 'Could not save your interest.';
    return Response.json({ error: message }, { status: 500 });
  }
}
