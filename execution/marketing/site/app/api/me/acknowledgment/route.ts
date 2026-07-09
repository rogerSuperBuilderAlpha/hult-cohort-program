import { getExpectationsAcknowledgment, signExpectationsAcknowledgment } from '@/lib/expectations-ack-server';
import { logApiError } from '@/lib/api-log';
import { requireEnrolledSession } from '@/lib/require-enrolled';

export const runtime = 'nodejs';

const ROUTE = '/api/me/acknowledgment';

export async function GET(request: Request) {
  const guard = await requireEnrolledSession(request);
  if (!guard.ok) return guard.response;

  try {
    const record = await getExpectationsAcknowledgment(guard.session.githubHandle);
    return Response.json({ signed: Boolean(record), record });
  } catch (err) {
    logApiError(`${ROUTE} GET`, err);
    return Response.json({ error: 'Could not load acknowledgment status.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await requireEnrolledSession(request);
  if (!guard.ok) return guard.response;

  let body: { showcaseOptOut?: boolean; confirm?: boolean };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (body.confirm !== true) {
    return Response.json({ error: 'You must confirm the acknowledgment.' }, { status: 400 });
  }

  try {
    const record = await signExpectationsAcknowledgment(guard.session.githubHandle, {
      showcaseOptOut: body.showcaseOptOut === true,
    });
    return Response.json({ signed: true, record });
  } catch (err) {
    logApiError(`${ROUTE} POST`, err);
    return Response.json({ error: 'Could not save acknowledgment.' }, { status: 500 });
  }
}
