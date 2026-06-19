import { getEligiblePeerRow } from '@/lib/eligible-peers-server';
import { requireReviewRouteAccess } from '@/lib/review-window-guard';
import { saveWrittenReview } from '@/lib/written-reviews-server';
import { logApiError } from '@/lib/api-log';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const guard = await requireReviewRouteAccess(request, slug, 'written-reviews');
  if (!guard.ok) return guard.response;

  let body: { revieweeHandle?: string; issueUrl?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const revieweeHandle = body.revieweeHandle?.trim().toLowerCase();
  const issueUrl = body.issueUrl?.trim();
  const githubHandle = guard.githubHandle;

  if (!revieweeHandle || !issueUrl) {
    return Response.json(
      { error: 'Provide revieweeHandle and issueUrl (GitHub issue you filed).' },
      { status: 400 }
    );
  }

  if (revieweeHandle === githubHandle) {
    return Response.json({ error: 'You cannot review your own submission.' }, { status: 400 });
  }

  const peer = await getEligiblePeerRow(slug, githubHandle, revieweeHandle);
  if (!peer) {
    return Response.json({ error: 'That peer has no eligible merged submission.' }, { status: 400 });
  }

  try {
    const saved = await saveWrittenReview(slug, githubHandle, revieweeHandle, issueUrl, peer.repo);
    return Response.json({ revieweeHandle, issueUrl: saved.issueUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save review.';
    return Response.json({ error: message }, { status: 400 });
  }
}
