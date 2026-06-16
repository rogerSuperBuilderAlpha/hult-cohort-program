import { getCohortStats } from '@/lib/cohort-stats-server';
import { logApiError } from '@/lib/api-log';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const stats = await getCohortStats();
    if (!stats.available) {
      return Response.json(
        { error: 'Cohort stats temporarily unavailable.' },
        { status: 503 }
      );
    }
    return Response.json(stats);
  } catch (err) {
    logApiError('GET /api/cohort/stats', err);
    return Response.json({ error: 'Cohort stats temporarily unavailable.' }, { status: 503 });
  }
}
