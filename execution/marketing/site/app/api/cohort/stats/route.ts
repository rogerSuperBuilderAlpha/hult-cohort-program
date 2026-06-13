import { getCohortStats } from '@/lib/cohort-stats-server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const stats = await getCohortStats('fall26');
    return Response.json(stats);
  } catch (err) {
    console.error('GET /api/cohort/stats failed:', err);
    return Response.json(
      { cohortId: 'fall26', enrolledCount: 0, peerReviewCount: 0 },
      { status: 500 }
    );
  }
}
