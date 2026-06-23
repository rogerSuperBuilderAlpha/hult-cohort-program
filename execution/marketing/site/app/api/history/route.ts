import { logApiError } from '@/lib/api-log';
import { getUserHistorySummary } from '@/lib/history-server';
import { requireGithubSession } from '@/lib/require-enrolled';

export const runtime = 'nodejs';

const ROUTE = 'GET /api/history';

export async function GET(request: Request) {
  const guard = await requireGithubSession(request);
  if (!guard.ok) return guard.response;

  try {
    const summary = await getUserHistorySummary(guard.session.githubHandle);
    return Response.json(summary);
  } catch (err) {
    logApiError(ROUTE, err);
    return Response.json(
      { error: 'Could not load submission history. Try again shortly.' },
      { status: 500 }
    );
  }
}
