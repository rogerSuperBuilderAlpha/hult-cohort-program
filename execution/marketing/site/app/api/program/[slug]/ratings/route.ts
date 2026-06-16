import { getProject } from '@/content/program';
import { getEligiblePeerRepo, isEligiblePeer } from '@/lib/eligible-peers-server';
import type { PeerRating } from '@/lib/project-progress-types';
import { isReviewWindowOpen, reviewWindowStatus } from '@/lib/program-schedule';
import { setPeerRating } from '@/lib/ratings-server';
import { hasWrittenReview } from '@/lib/written-reviews-server';
import { requireEnrolledSession } from '@/lib/require-enrolled';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { logApiError } from '@/lib/api-log';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const ip = clientIp(request);
  const rate = checkRateLimit(`ratings:${ip}`, 60, 60_000);
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
    return Response.json({ error: 'This project has no peer ratings.' }, { status: 404 });
  }

  const window = reviewWindowStatus(project);
  if (window === 'not-yet') {
    return Response.json({ error: 'Review week has not opened yet.' }, { status: 403 });
  }
  if (window === 'closed' && !isReviewWindowOpen(project)) {
    return Response.json({ error: 'Review week is closed for this project.' }, { status: 403 });
  }

  let body: { revieweeHandle?: string; rating?: PeerRating };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const revieweeHandle = body.revieweeHandle?.trim().toLowerCase();
  const rating = body.rating;
  const githubHandle = guard.session.githubHandle;

  if (!revieweeHandle || (rating !== 'up' && rating !== 'down')) {
    return Response.json(
      { error: 'Provide revieweeHandle and rating ("up" or "down").' },
      { status: 400 }
    );
  }

  if (revieweeHandle === githubHandle) {
    return Response.json({ error: 'You cannot rate your own submission.' }, { status: 400 });
  }

  const eligible = await isEligiblePeer(slug, githubHandle, revieweeHandle);
  if (!eligible) {
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
    logApiError(`POST /api/program/${slug}/ratings`, err);
    return Response.json({ error: 'Could not save rating.' }, { status: 500 });
  }
}
