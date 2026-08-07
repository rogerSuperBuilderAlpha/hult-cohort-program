import { isEligiblePeer } from '@/lib/eligible-peers-server';
import type { PeerRating } from '@/lib/project-progress-types';
import { requireReviewRouteAccess } from '@/lib/review-window-guard';
import { setPeerRating } from '@/lib/ratings-server';
import { hasWrittenReview } from '@/lib/written-reviews-server';
import { logApiError } from '@/lib/api-log';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const guard = await requireReviewRouteAccess(request, slug, 'ratings');
  if (!guard.ok) return guard.response;

  let body: { revieweeHandle?: string; rating?: PeerRating };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const revieweeHandle = body.revieweeHandle?.trim().toLowerCase();
  const rating = body.rating;
  const githubHandle = guard.githubHandle;

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
