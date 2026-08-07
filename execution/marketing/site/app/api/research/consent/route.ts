import { requireEnrolledSession } from '@/lib/require-enrolled';
import { saveConsent } from '@/lib/research/survey-server';
import { logApiError } from '@/lib/api-log';

export const runtime = 'nodejs';

const ROUTE = '/api/research/consent';

export async function POST(request: Request) {
  const guard = await requireEnrolledSession(request);
  if (!guard.ok) return guard.response;

  let body: { consented?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body.consented !== 'boolean') {
    return Response.json({ error: 'Provide consented (true or false).' }, { status: 400 });
  }

  try {
    await saveConsent(guard.session.githubHandle, body.consented);
    return Response.json({ ok: true, consented: body.consented });
  } catch (err) {
    logApiError(`${ROUTE} POST`, err);
    return Response.json({ error: 'Could not record your choice. Try again shortly.' }, { status: 500 });
  }
}
