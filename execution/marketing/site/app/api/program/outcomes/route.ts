import { getPhase1Outcomes } from '@/lib/project-outcomes-server';
import { logApiError } from '@/lib/api-log';
import { requireEnrolledSession } from '@/lib/require-enrolled';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = await requireEnrolledSession(request);
  if (!guard.ok) return guard.response;

  try {
    const outcomes = await getPhase1Outcomes(guard.session.cohortId);
    return Response.json({ outcomes });
  } catch (err) {
    logApiError('GET /api/program/outcomes', err);
    return Response.json({ error: 'Could not load contest outcomes.' }, { status: 500 });
  }
}
