import { randomUUID } from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import {
  buildApplicationRecord,
  takeHomeRepoUrl,
  validateApplication,
} from '@/lib/applications';
import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import {
  bearerTokenFromRequest,
  verifyGithubIdToken,
} from '@/lib/firebase/verify-github-session';

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return Response.json({ error: 'Applications are temporarily unavailable.' }, { status: 503 });
  }

  const idToken = bearerTokenFromRequest(request);
  if (!idToken) {
    return Response.json({ error: 'Sign in with GitHub to apply.' }, { status: 401 });
  }

  let githubSession;
  try {
    githubSession = await verifyGithubIdToken(idToken);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid sign-in.';
    return Response.json({ error: message }, { status: 401 });
  }

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Honeypot — bots get a silent success, no write
  if (body._honeypot?.trim()) {
    return Response.json({ ok: true, id: randomUUID(), takeHomeRepoUrl: takeHomeRepoUrl() });
  }

  try {
    const input = validateApplication(body, { githubUrl: githubSession.githubUrl });
    const db = getAdminDb();

    const [byEmail, byHandle] = await Promise.all([
      db.collection('applications').where('email', '==', input.email).limit(5).get(),
      db
        .collection('applications')
        .where('githubHandle', '==', githubSession.githubHandle)
        .limit(5)
        .get(),
    ]);

    if (byEmail.docs.some((d) => d.data().cohort === 'fall26')) {
      return Response.json(
        {
          error:
            'We already have an application for this email. If you need to update it, email cohort@hult.edu.',
        },
        { status: 409 }
      );
    }

    if (byHandle.docs.some((d) => d.data().cohort === 'fall26')) {
      return Response.json(
        {
          error:
            'We already have an application for this GitHub account. If you need to update it, email cohort@hult.edu.',
        },
        { status: 409 }
      );
    }

    const id = randomUUID();
    const record = buildApplicationRecord(input, id);

    const doc: Record<string, unknown> = {
      ...record,
      firebaseUid: githubSession.firebaseUid,
      githubOAuthUid: githubSession.githubUid,
      takeHomeRepoUrl: takeHomeRepoUrl(),
      submittedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (!doc.hultStudentId) delete doc.hultStudentId;

    await db.collection('applications').doc(id).set(doc);

    return Response.json({ ok: true, id, takeHomeRepoUrl: takeHomeRepoUrl() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Submission failed';
    return Response.json({ error: message }, { status: 400 });
  }
}
