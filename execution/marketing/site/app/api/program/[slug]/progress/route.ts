import { getProject } from '@/content/program';
import { getCohortStats } from '@/lib/cohort-stats-server';
import { getProjectProgress } from '@/lib/project-progress-server';
import {
  bearerTokenFromRequest,
  verifyGithubIdToken,
} from '@/lib/firebase/verify-github-session';
import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  if (!isAdminConfigured()) {
    return Response.json({ error: 'Progress unavailable.' }, { status: 503 });
  }

  const idToken = bearerTokenFromRequest(request);
  if (!idToken) {
    return Response.json({ error: 'Sign in with GitHub.' }, { status: 401 });
  }

  const { slug } = await context.params;
  if (!getProject(slug)) {
    return Response.json({ error: 'Unknown project.' }, { status: 404 });
  }

  let githubHandle: string;
  try {
    const session = await verifyGithubIdToken(idToken);
    githubHandle = session.githubHandle;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid sign-in.';
    return Response.json({ error: message }, { status: 401 });
  }

  try {
    const cohort = 'fall26';
    const db = getAdminDb();
    const rosterDoc = await db
      .collection('roster')
      .doc(cohort)
      .collection('members')
      .doc(githubHandle)
      .get();

    if (!rosterDoc.exists || rosterDoc.data()?.active === false) {
      return Response.json({ error: 'Enrolled participants only.' }, { status: 403 });
    }

    const cohortStats = await getCohortStats(cohort);
    const progress = await getProjectProgress(cohort, githubHandle, slug, cohortStats);

    if (!progress) {
      return Response.json({ error: 'Could not load progress.' }, { status: 500 });
    }

    return Response.json(progress);
  } catch (err) {
    console.error(`GET /api/program/${slug}/progress failed:`, err);
    return Response.json({ error: 'Could not load progress. Try again shortly.' }, { status: 500 });
  }
}
