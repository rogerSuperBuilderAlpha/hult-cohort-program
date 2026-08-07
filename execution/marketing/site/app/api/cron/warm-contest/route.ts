import { programProjects } from '@/content/program';
import { fetchContestState } from '@/lib/contest-state-server';
import { reviewWindowStatus } from '@/lib/program-schedule';
import { logApi, logApiError } from '@/lib/api-log';

export const runtime = 'nodejs';

const ROUTE = 'GET /api/cron/warm-contest';

/**
 * Warm shared contest-state cache for projects with an open review window.
 * Secure with CRON_SECRET (Authorization: Bearer …) or Vercel Cron.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get('authorization');
  const isProd =
    process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  if (secret) {
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: 'Unauthorized.' }, { status: 401 });
    }
  } else if (isProd) {
    return Response.json({ error: 'CRON_SECRET not configured.' }, { status: 503 });
  }

  const open = programProjects.filter(
    (p) => p.reviews && reviewWindowStatus(p) === 'open'
  );

  try {
    const warmed = [];
    for (const project of open) {
      const state = await fetchContestState(project.slug);
      warmed.push({
        slug: project.slug,
        submissions: state.submissions.length,
        reviewers: Object.keys(state.reviews).length,
      });
    }
    logApi(ROUTE, 'info', 'Contest cache warmed', { count: warmed.length });
    return Response.json({ ok: true, warmed });
  } catch (err) {
    logApiError(ROUTE, err);
    return Response.json({ error: 'Warm failed.' }, { status: 500 });
  }
}
