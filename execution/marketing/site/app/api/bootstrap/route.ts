import { getDashboardSummary } from '@/lib/dashboard-server';
import { getSurveyState } from '@/lib/research/survey-server';
import { requireEnrolledSession } from '@/lib/require-enrolled';
import { logApiError } from '@/lib/api-log';

export const runtime = 'nodejs';

/**
 * Enrolled bootstrap: dashboard + survey in one round-trip.
 * Participant identity still comes from the shared /api/me provider.
 */
export async function GET(request: Request) {
  const guard = await requireEnrolledSession(request);
  if (!guard.ok) return guard.response;

  const githubHandle = guard.session.githubHandle;

  try {
    const [dashboard, survey] = await Promise.all([
      getDashboardSummary(githubHandle),
      getSurveyState(githubHandle),
    ]);

    return Response.json({ dashboard, survey });
  } catch (err) {
    logApiError('GET /api/bootstrap', err);
    return Response.json({ error: 'Could not load enrolled session.' }, { status: 500 });
  }
}
