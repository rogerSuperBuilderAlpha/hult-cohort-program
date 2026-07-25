import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId } from '@/lib/cohort-config';
import { getCohortStats } from '@/lib/cohort-stats-server';
import { getExpectationsAcknowledgment } from '@/lib/expectations-ack-server';
import { getNextCohortInterest } from '@/lib/cohort-interest-server';
import { resolveEnrollment } from '@/lib/enrollment-server';
import { rosterMemberRef } from '@/lib/firestore-paths';
import { getParticipantSubmissions } from '@/lib/submissions-server';
import type { ApplicationStatus, ParticipantMe } from '@/lib/participant-status';
import type { SubmissionEntry } from '@/lib/submissions-types';

export type BuildMeOptions = {
  /** Full submission history — only for data export / explicit include. */
  includeSubmissions?: boolean;
};

/**
 * Shared /api/me payload builder. Default is slim (no submissions) for nav/footer.
 */
export async function buildParticipantMe(
  githubHandle: string,
  options: BuildMeOptions = {}
): Promise<ParticipantMe> {
  const db = getAdminDb();
  const id = cohortId();
  const includeSubmissions = options.includeSubmissions === true;

  const [appSnap, rosterDoc, cohortStats, nextCohortInterest] = await Promise.all([
    db.collection('applications').where('githubHandle', '==', githubHandle).limit(5).get(),
    rosterMemberRef(id, githubHandle).get(),
    getCohortStats(id),
    getNextCohortInterest(githubHandle),
  ]);

  const applicationDoc = appSnap.docs.find((d) => d.data().cohort === id);
  const appData = applicationDoc?.data();
  const rosterData = rosterDoc.exists ? rosterDoc.data() : null;
  const rosterActive = rosterDoc.exists ? rosterData?.active !== false : null;

  const enrollment = resolveEnrollment({
    applicationStatus: (appData?.status as ApplicationStatus) ?? null,
    rosterActive,
  });

  const [expectationsAcknowledgment, submissions] = await Promise.all([
    enrollment.canAccessEnrolledUi
      ? getExpectationsAcknowledgment(githubHandle, id)
      : Promise.resolve(null),
    includeSubmissions
      ? getParticipantSubmissions(id, githubHandle)
      : Promise.resolve([] as SubmissionEntry[]),
  ]);

  return {
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
}

export function meServiceAvailable(): boolean {
  return isAdminConfigured();
}
