import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { getCohortStats } from '@/lib/cohort-stats-server';
import { getParticipantSubmissions } from '@/lib/submissions-server';
import { deleteParticipantAccount } from '@/lib/account-server';
import type { ApplicationStatus, ParticipantMe } from '@/lib/participant-status';
import {
  bearerTokenFromRequest,
  verifyGithubIdToken,
} from '@/lib/firebase/verify-github-session';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  if (!isAdminConfigured()) {
    return Response.json({ error: 'Participant status unavailable.' }, { status: 503 });
  }

  const idToken = bearerTokenFromRequest(request);
  if (!idToken) {
    return Response.json({ error: 'Sign in with GitHub.' }, { status: 401 });
  }

  let githubHandle: string;
  try {
    const session = await verifyGithubIdToken(idToken);
    githubHandle = session.githubHandle;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid sign-in.';
    return Response.json({ error: message }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const cohort = 'fall26';

    const [appSnap, rosterDoc, cohortStats, submissions] = await Promise.all([
      db.collection('applications').where('githubHandle', '==', githubHandle).limit(5).get(),
      db.collection('roster').doc(cohort).collection('members').doc(githubHandle).get(),
      getCohortStats(cohort),
      getParticipantSubmissions(cohort, githubHandle),
    ]);

    const applicationDoc = appSnap.docs.find((d) => d.data().cohort === cohort);
    const appData = applicationDoc?.data();

    const rosterData = rosterDoc.exists ? rosterDoc.data() : null;

    const payload: ParticipantMe = {
      githubHandle,
      cohortStats,
      submissions,
      application: appData
        ? {
            id: applicationDoc!.id,
            status: appData.status as ApplicationStatus,
            firstName: appData.firstName,
            lastName: appData.lastName,
            email: appData.email,
            takeHomeRepoUrl: appData.takeHomeRepoUrl,
            campus: appData.campus,
            cohort: appData.cohort,
          }
        : null,
      roster: rosterData
        ? {
            displayName: rosterData.displayName,
            campus: rosterData.campus,
            roles: rosterData.roles ?? ['participant'],
            active: rosterData.active !== false,
          }
        : null,
    };

    return Response.json(payload);
  } catch (err) {
    console.error('GET /api/me failed:', err);
    return Response.json(
      { error: 'Could not load your participant status. Try again shortly.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!isAdminConfigured()) {
    return Response.json({ error: 'Account management unavailable.' }, { status: 503 });
  }

  const idToken = bearerTokenFromRequest(request);
  if (!idToken) {
    return Response.json({ error: 'Sign in with GitHub.' }, { status: 401 });
  }

  let githubHandle: string;
  let firebaseUid: string;
  try {
    const session = await verifyGithubIdToken(idToken);
    githubHandle = session.githubHandle;
    firebaseUid = session.firebaseUid;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid sign-in.';
    return Response.json({ error: message }, { status: 401 });
  }

  try {
    const result = await deleteParticipantAccount({ githubHandle, firebaseUid });
    return Response.json({ ok: true, deleted: result });
  } catch (err) {
    console.error('DELETE /api/me failed:', err);
    return Response.json(
      { error: 'Could not delete your account. Email cohort@hult.edu for help.' },
      { status: 500 }
    );
  }
}
