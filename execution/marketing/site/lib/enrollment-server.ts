import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId } from '@/lib/cohort-config';
import type { ApplicationStatus } from '@/lib/participant-status';
import type { EnrollmentInfo, EnrollmentState } from '@/lib/enrollment-types';

export type { EnrollmentInfo, EnrollmentState } from '@/lib/enrollment-types';

const IN_FLIGHT: ApplicationStatus[] = [
  'submitted',
  'take-home-sent',
  'take-home-submitted',
];

export function resolveEnrollment(params: {
  applicationStatus: ApplicationStatus | null;
  rosterActive: boolean | null;
}): EnrollmentInfo {
  const { applicationStatus, rosterActive } = params;

  if (rosterActive === false) {
    return {
      state: 'inactive',
      canAccessParticipantApis: false,
      canAccessEnrolledUi: false,
    };
  }

  if (rosterActive === true) {
    return {
      state: 'enrolled',
      canAccessParticipantApis: true,
      canAccessEnrolledUi: true,
    };
  }

  if (applicationStatus === 'admitted') {
    return {
      state: 'admitted-pending-roster',
      canAccessParticipantApis: false,
      canAccessEnrolledUi: false,
    };
  }

  if (applicationStatus && IN_FLIGHT.includes(applicationStatus)) {
    return {
      state: 'applicant-in-flight',
      canAccessParticipantApis: false,
      canAccessEnrolledUi: false,
    };
  }

  if (applicationStatus) {
    return {
      state: 'applicant',
      canAccessParticipantApis: false,
      canAccessEnrolledUi: false,
    };
  }

  return {
    state: 'signed-in',
    canAccessParticipantApis: false,
    canAccessEnrolledUi: false,
  };
}

export async function getRosterActive(githubHandle: string): Promise<boolean | null> {
  if (!isAdminConfigured()) return null;

  const db = getAdminDb();
  const doc = await db
    .collection('roster')
    .doc(cohortId())
    .collection('members')
    .doc(githubHandle)
    .get();

  if (!doc.exists) return null;
  return doc.data()?.active !== false;
}

export async function requireActiveRosterMember(githubHandle: string): Promise<boolean> {
  const active = await getRosterActive(githubHandle);
  return active === true;
}
