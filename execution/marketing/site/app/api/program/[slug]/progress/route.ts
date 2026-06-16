import { getProject } from '@/content/program';
import { getCohortStats } from '@/lib/cohort-stats-server';
import { getProjectProgress } from '@/lib/project-progress-server';
import { requireEnrolledSession } from '@/lib/require-enrolled';
import { logApiError } from '@/lib/api-log';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const guard = await requireEnrolledSession(request);
  if (!guard.ok) return guard.response;

  const { slug } = await context.params;
  if (!getProject(slug)) {
    return Response.json({ error: 'Unknown project.' }, { status: 404 });
  }

  try {
    const cohortStats = await getCohortStats(guard.session.cohortId);
    const progress = await getProjectProgress(guard.session.githubHandle, slug, cohortStats);

    if (!progress) {
      return Response.json({ error: 'Could not load progress.' }, { status: 500 });
    }

    return Response.json(progress);
  } catch (err) {
    logApiError(`GET /api/program/${slug}/progress`, err);
    return Response.json({ error: 'Could not load progress. Try again shortly.' }, { status: 500 });
  }
}
