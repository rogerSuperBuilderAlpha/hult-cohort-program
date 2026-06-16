import { getProject } from '@/content/program';
import { getEligiblePeerRepo, isEligiblePeer } from '@/lib/eligible-peers-server';
import { isReviewWindowOpen, reviewWindowStatus } from '@/lib/program-schedule';
import { saveWrittenReview } from '@/lib/written-reviews-server';
import { requireEnrolledSession } from '@/lib/require-enrolled';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { logApiError } from '@/lib/api-log';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const ip = clientIp(request);
  const rate = checkRateLimit(`written-reviews:${ip}`, 60, 60_000);
  if (!rate.allowed) {
    return Response.json(
      { error: 'Too many requests. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
    );
  }

  const guard = await requireEnrolledSession(request);
  if (!guard.ok) return guard.response;

  const { slug } = await context.params;
  const project = getProject(slug);
  if (!project?.reviews) {
    return Response.json({ error: 'This project has no peer reviews.' }, { status: 404 });
  }

  const window = reviewWindowStatus(project);
  if (window === 'not-yet') {
    return Response.json({ error: 'Review week has not opened yet.' }, { status: 403 });
  }
  if (window === 'closed' && !isReviewWindowOpen(project)) {
    return Response.json({ error: 'Review week is closed for this project.' }, { status: 403 });
  }

  let body: { revieweeHandle?: string; issueUrl?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const revieweeHandle = body.revieweeHandle?.trim().toLowerCase();
  const issueUrl = body.issueUrl?.trim();
  const githubHandle = guard.session.githubHandle;

  if (!revieweeHandle || !issueUrl) {
    return Response.json(
      { error: 'Provide revieweeHandle and issueUrl (GitHub issue you filed).' },
      { status: 400 }
    );
  }

  if (revieweeHandle === githubHandle) {
    return Response.json({ error: 'You cannot review your own submission.' }, { status: 400 });
  }

  const eligible = await isEligiblePeer(slug, githubHandle, revieweeHandle);
  if (!eligible) {
    return Response.json({ error: 'That peer has no eligible merged submission.' }, { status: 400 });
  }

  const expectedRepo = await getEligiblePeerRepo(slug, githubHandle, revieweeHandle);
  if (!expectedRepo) {
    return Response.json({ error: 'That peer has no eligible merged submission.' }, { status: 400 });
  }

  try {
    const saved = await saveWrittenReview(slug, githubHandle, revieweeHandle, issueUrl, expectedRepo);
    return Response.json({ revieweeHandle, issueUrl: saved.issueUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save review.';
    return Response.json({ error: message }, { status: 400 });
  }
}
