import { requireEnrolledSession } from '@/lib/require-enrolled';
import { getSurveyState, saveSurveyResponse } from '@/lib/research/survey-server';
import { logApiError } from '@/lib/api-log';

export const runtime = 'nodejs';

const ROUTE = '/api/research/survey';

export async function GET(request: Request) {
  const guard = await requireEnrolledSession(request);
  if (!guard.ok) return guard.response;

  try {
    const state = await getSurveyState(guard.session.githubHandle);
    return Response.json(state);
  } catch (err) {
    logApiError(`${ROUTE} GET`, err);
    return Response.json({ error: 'Could not load the survey. Try again shortly.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await requireEnrolledSession(request);
  if (!guard.ok) return guard.response;

  let body: { wave?: string; answers?: Record<string, unknown> };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body.wave || typeof body.answers !== 'object' || body.answers === null) {
    return Response.json({ error: 'Provide wave and answers.' }, { status: 400 });
  }

  try {
    const result = await saveSurveyResponse(guard.session.githubHandle, body.wave, body.answers);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json({ ok: true });
  } catch (err) {
    logApiError(`${ROUTE} POST`, err);
    return Response.json({ error: 'Could not save your responses. Try again shortly.' }, { status: 500 });
  }
}
