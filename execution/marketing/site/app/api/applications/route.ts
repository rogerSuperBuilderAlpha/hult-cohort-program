import { randomUUID } from 'crypto';
import { after } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import {
  applicationDocId,
  buildApplicationRecord,
  takeHomeRepoUrl,
  validateApplication,
} from '@/lib/applications';
import { cohortId } from '@/lib/cohort-config';
import { getAdminDb } from '@/lib/firebase/admin';
import { logApi, logApiError } from '@/lib/api-log';
import {
  sendApplicationConfirmationEmail,
  sendApplicationNotificationEmail,
} from '@/lib/email-server';
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

  const handleRate = checkRateLimit(
    `applications:handle:${guard.session.githubHandle}`,
    5,
    60_000
  );
  if (!handleRate.allowed) {
    return Response.json(
      { error: 'Too many applications from this account. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(handleRate.retryAfterSec) } }
    );
  }

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
    const handle = githubSession.githubHandle.toLowerCase();

    const byEmail = await db
      .collection('applications')
      .where('email', '==', input.email)
      .limit(5)
      .get();

    if (byEmail.docs.some((d) => d.data().cohort === id)) {
      return Response.json(
        {
          error:
            'We already have an application for this email. If you need to update it, email cohort@hult.edu.',
        },
        { status: 409 }
      );
    }

    const applicationId = applicationDocId(id, handle);
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

    try {
      // create() fails if the doc exists — closes the concurrent double-submit race
      await db.collection('applications').doc(applicationId).create(doc);
    } catch (err) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? Number((err as { code: number }).code)
          : 0;
      // Firestore ALREADY_EXISTS
      if (code === 6 || (err instanceof Error && /already exists/i.test(err.message))) {
        return Response.json(
          {
            error:
              'We already have an application for this GitHub account. If you need to update it, email cohort@hult.edu.',
          },
          { status: 409 }
        );
      }
      throw err;
    }

    // Send emails via after() so they run once the response is flushed AND the
    // serverless function stays alive until they finish. A bare `void send()`
    // is not guaranteed to complete on Vercel — the runtime can freeze/kill the
    // invocation after the response returns, silently dropping the applicant
    // confirmation and the staff notification.
    after(async () => {
      await sendApplicationConfirmationEmail({
        email: input.email,
        firstName: input.firstName,
        takeHomeRepoUrl: takeHomeRepoUrl(),
      }).catch((err) => logApiError(`${ROUTE} email`, err));

      await sendApplicationNotificationEmail({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        githubHandle: record.githubHandle,
        githubUrl: input.githubUrl,
        campus: input.campus,
        timezone: input.timezone,
        referralSource: input.referralSource,
        motivation: input.motivation,
        project1Idea: input.project1Idea,
      }).catch((err) => logApiError(`${ROUTE} notify`, err));
    });

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
