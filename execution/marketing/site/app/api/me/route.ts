import { buildParticipantMe } from '@/lib/participant-me-server';
import { deleteParticipantAccount } from '@/lib/account-server';
import { logApiError } from '@/lib/api-log';
import { requireGithubSession } from '@/lib/require-enrolled';

export const runtime = 'nodejs';

const ROUTE = '/api/me';

export async function GET(request: Request) {
  const guard = await requireGithubSession(request);
  if (!guard.ok) return guard.response;

  const githubHandle = guard.session.githubHandle;
  const includeSubmissions =
    new URL(request.url).searchParams.get('include')?.split(',').includes('submissions') === true;

  try {
    const payload = await buildParticipantMe(githubHandle, { includeSubmissions });
    return Response.json(payload);
  } catch (err) {
    logApiError(`${ROUTE} GET`, err);
    return Response.json(
      { error: 'Could not load your participant status. Try again shortly.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const guard = await requireGithubSession(request);
  if (!guard.ok) return guard.response;

  const { githubHandle, firebaseUid } = guard.session;

  try {
    const result = await deleteParticipantAccount({ githubHandle, firebaseUid });
    return Response.json({ ok: true, deleted: result });
  } catch (err) {
    logApiError(`${ROUTE} DELETE`, err);
    return Response.json(
      { error: 'Could not delete your account. Email cohort@hult.edu for help.' },
      { status: 500 }
    );
  }
}
