import { randomUUID } from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import {
  buildApplicationRecord,
  takeHomeRepoUrl,
  validateApplication,
} from '@/lib/applications';
import { cohortId } from '@/lib/cohort-config';
import { getAdminDb } from '@/lib/firebase/admin';
import { logApi, logApiError } from '@/lib/api-log';
import { sendApplicationConfirmationEmail } from '@/lib/email-server';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { requireGithubSession } from '@/lib/require-enrolled';

export const runtime = 'nodejs';

const ROUTE = 'POST /api/applications';

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = checkRateLimit(`applications:${ip}`, 10, 60_000);
  if (!rate.allowed) {
    return Response.json(
      { error: 'Too many applications from this network. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
    );
  }

  try {
    return await handlePost(request);
  } catch (err) {
    logApiError(ROUTE, err);
    return Response.json(
      {
        error:
          'Something went wrong saving your application. Try again in a minute or email cohort@hult.edu.',
      },
      { status: 500 }
    );
  }
}

async function handlePost(request: Request) {
  const guard = await requireGithubSession(request);
  if (!guard.ok) return guard.response;

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const githubSession = guard.session;

  if (body._honeypot?.trim()) {
    return Response.json({ ok: true, id: randomUUID(), takeHomeRepoUrl: takeHomeRepoUrl() });
  }

  try {
    const input = validateApplication(body, { githubUrl: githubSession.githubUrl });
    const db = getAdminDb();
    const id = cohortId();

    const [byEmail, byHandle] = await Promise.all([
      db.collection('applications').where('email', '==', input.email).limit(5).get(),
      db
        .collection('applications')
        .where('githubHandle', '==', githubSession.githubHandle)
        .limit(5)
        .get(),
    ]);

    if (byEmail.docs.some((d) => d.data().cohort === id)) {
      return Response.json(
        {
          error:
            'We already have an application for this email. If you need to update it, email cohort@hult.edu.',
        },
        { status: 409 }
      );
    }

    if (byHandle.docs.some((d) => d.data().cohort === id)) {
      return Response.json(
        {
          error:
            'We already have an application for this GitHub account. If you need to update it, email cohort@hult.edu.',
        },
        { status: 409 }
      );
    }

    const applicationId = randomUUID();
    const record = buildApplicationRecord(input, applicationId);

    const doc: Record<string, unknown> = {
      ...record,
      firebaseUid: githubSession.firebaseUid,
      githubOAuthUid: githubSession.githubUid,
      takeHomeRepoUrl: takeHomeRepoUrl(),
      submittedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (!doc.hultStudentId) delete doc.hultStudentId;

    await db.collection('applications').doc(applicationId).set(doc);

    void sendApplicationConfirmationEmail({
      email: input.email,
      firstName: input.firstName,
      takeHomeRepoUrl: takeHomeRepoUrl(),
    }).catch((err) => logApiError(`${ROUTE} email`, err));

    logApi(ROUTE, 'info', 'Application submitted', {
      applicationId,
      githubHandle: record.githubHandle,
    });

    return Response.json({ ok: true, id: applicationId, takeHomeRepoUrl: takeHomeRepoUrl() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Submission failed';
    return Response.json({ error: message }, { status: 400 });
  }
}
