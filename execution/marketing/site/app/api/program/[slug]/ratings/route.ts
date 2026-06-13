import { getProject } from '@/content/program';
import { getCohortStats } from '@/lib/cohort-stats-server';
import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import type { PeerRating } from '@/lib/project-progress-types';
import { setPeerRating } from '@/lib/ratings-server';
import { hasWrittenReview } from '@/lib/written-reviews-server';
import {
  bearerTokenFromRequest,
  verifyGithubIdToken,
} from '@/lib/firebase/verify-github-session';

export const runtime = 'nodejs';

async function requireEnrolledParticipant(githubHandle: string) {
  const cohort = 'fall26';
  const db = getAdminDb();
  const rosterDoc = await db
    .collection('roster')
    .doc(cohort)
    .collection('members')
    .doc(githubHandle)
    .get();

  if (!rosterDoc.exists || rosterDoc.data()?.active === false) {
    return null;
  }
  return cohort;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  if (!isAdminConfigured()) {
    return Response.json({ error: 'Ratings unavailable.' }, { status: 503 });
  }

  const idToken = bearerTokenFromRequest(request);
  if (!idToken) {
    return Response.json({ error: 'Sign in with GitHub.' }, { status: 401 });
  }

  const { slug } = await context.params;
  const project = getProject(slug);
  if (!project?.reviews) {
    return Response.json({ error: 'This project has no peer ratings.' }, { status: 404 });
  }

  let githubHandle: string;
  try {
    const session = await verifyGithubIdToken(idToken);
    githubHandle = session.githubHandle;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid sign-in.';
    return Response.json({ error: message }, { status: 401 });
  }

  const cohort = await requireEnrolledParticipant(githubHandle);
  if (!cohort) {
    return Response.json({ error: 'Enrolled participants only.' }, { status: 403 });
  }

  let body: { revieweeHandle?: string; rating?: PeerRating };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const revieweeHandle = body.revieweeHandle?.trim().toLowerCase();
  const rating = body.rating;

  if (!revieweeHandle || (rating !== 'up' && rating !== 'down')) {
    return Response.json(
      { error: 'Provide revieweeHandle and rating ("up" or "down").' },
      { status: 400 }
    );
  }

  if (revieweeHandle === githubHandle) {
    return Response.json({ error: 'You cannot rate your own submission.' }, { status: 400 });
  }

  const db = getAdminDb();
  const peerSubmission = await db
    .collection('submissions')
    .doc(cohort)
    .collection('projects')
    .doc(slug)
    .collection('entries')
    .doc(revieweeHandle)
    .get();

  if (!peerSubmission.exists || peerSubmission.data()?.merged !== true) {
    return Response.json({ error: 'That peer has no eligible merged submission.' }, { status: 400 });
  }

  const reviewOnFile = await hasWrittenReview(slug, githubHandle, revieweeHandle);
  if (!reviewOnFile) {
    return Response.json(
      {
        error:
          'File your GitHub review first (issue titled "Review by @{you}" on their repo), then vote.',
      },
      { status: 403 }
    );
  }

  try {
    const ratings = await setPeerRating(slug, githubHandle, revieweeHandle, rating);
    return Response.json({
      revieweeHandle,
      rating,
      completed: Object.keys(ratings).length,
    });
  } catch (err) {
    console.error(`POST /api/program/${slug}/ratings failed:`, err);
    return Response.json({ error: 'Could not save rating.' }, { status: 500 });
  }
}
