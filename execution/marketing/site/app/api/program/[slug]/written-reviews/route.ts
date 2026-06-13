import { getProject } from '@/content/program';
import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { saveWrittenReview } from '@/lib/written-reviews-server';
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
    return Response.json({ error: 'Reviews unavailable.' }, { status: 503 });
  }

  const idToken = bearerTokenFromRequest(request);
  if (!idToken) {
    return Response.json({ error: 'Sign in with GitHub.' }, { status: 401 });
  }

  const { slug } = await context.params;
  const project = getProject(slug);
  if (!project?.reviews) {
    return Response.json({ error: 'This project has no peer reviews.' }, { status: 404 });
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

  let body: { revieweeHandle?: string; issueUrl?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const revieweeHandle = body.revieweeHandle?.trim().toLowerCase();
  const issueUrl = body.issueUrl?.trim();

  if (!revieweeHandle || !issueUrl) {
    return Response.json(
      { error: 'Provide revieweeHandle and issueUrl (GitHub issue you filed).' },
      { status: 400 }
    );
  }

  if (revieweeHandle === githubHandle) {
    return Response.json({ error: 'You cannot review your own submission.' }, { status: 400 });
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

  const expectedRepo = peerSubmission.data()!.repo as string;

  try {
    const saved = await saveWrittenReview(slug, githubHandle, revieweeHandle, issueUrl, expectedRepo);
    return Response.json({ revieweeHandle, issueUrl: saved.issueUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save review.';
    return Response.json({ error: message }, { status: 400 });
  }
}
