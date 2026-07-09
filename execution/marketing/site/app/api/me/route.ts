import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId } from '@/lib/cohort-config';
import { getCohortStats } from '@/lib/cohort-stats-server';
import { getExpectationsAcknowledgment } from '@/lib/expectations-ack-server';
import { getNextCohortInterest } from '@/lib/cohort-interest-server';
import { resolveEnrollment } from '@/lib/enrollment-server';
import { rosterMemberRef } from '@/lib/firestore-paths';
import { getParticipantSubmissions } from '@/lib/submissions-server';
import { deleteParticipantAccount } from '@/lib/account-server';
import type { ApplicationStatus, ParticipantMe } from '@/lib/participant-status';
import { logApiError } from '@/lib/api-log';
import { requireGithubSession } from '@/lib/require-enrolled';

export const runtime = 'nodejs';

const ROUTE = '/api/me';

export async function GET(request: Request) {
  const guard = await requireGithubSession(request);
  if (!guard.ok) return guard.response;

  const githubHandle = guard.session.githubHandle;

  try {
    const db = getAdminDb();
    const id = cohortId();

    const [appSnap, rosterDoc, cohortStats, submissions, nextCohortInterest] = await Promise.all([
      db.collection('applications').where('githubHandle', '==', githubHandle).limit(5).get(),
      rosterMemberRef(id, githubHandle).get(),
      getCohortStats(id),
      getParticipantSubmissions(id, githubHandle),
      getNextCohortInterest(githubHandle),
    ]);

    const applicationDoc = appSnap.docs.find((d) => d.data().cohort === id);
    const appData = applicationDoc?.data();
    const rosterData = rosterDoc.exists ? rosterDoc.data() : null;

    const enrollment = resolveEnrollment({
      applicationStatus: (appData?.status as ApplicationStatus) ?? null,
      rosterActive: rosterData ? rosterData.active !== false : null,
    });

    const expectationsAcknowledgment = enrollment.canAccessEnrolledUi
      ? await getExpectationsAcknowledgment(githubHandle, id)
      : null;

    const payload: ParticipantMe = {
      githubHandle,
      cohortStats,
      submissions,
      enrollment,
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
      nextCohortInterest,
      expectationsAcknowledgment,
    };

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
    const db = getAdminDb();
    const rosterDoc = await rosterMemberRef(cohortId(), githubHandle).get();
    if (rosterDoc.exists && rosterDoc.data()?.active !== false) {
      return Response.json(
        {
          error:
            'Enrolled participants cannot delete their account here. Email cohort@hult.edu for help.',
        },
        { status: 403 }
      );
    }

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
