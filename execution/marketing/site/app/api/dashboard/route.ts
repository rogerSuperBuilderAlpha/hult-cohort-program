import { getDashboardSummary } from '@/lib/dashboard-server';
import { requireEnrolledSession } from '@/lib/require-enrolled';
import { logApiError } from '@/lib/api-log';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = await requireEnrolledSession(request);
  if (!guard.ok) return guard.response;

  try {
    const summary = await getDashboardSummary(guard.session.githubHandle);
    return Response.json(summary);
  } catch (err) {
    logApiError('GET /api/dashboard', err);
    return Response.json({ error: 'Could not load dashboard.' }, { status: 500 });
  }
}
