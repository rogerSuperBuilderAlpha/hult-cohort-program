import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId } from '@/lib/cohort-config';
import { rosterMemberRef } from '@/lib/firestore-paths';
import type { ApplicationStatus } from '@/lib/participant-status';
import type { EnrollmentInfo } from '@/lib/enrollment-types';

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

async function readRosterActive(githubHandle: string, id: string): Promise<boolean | null> {
  const doc = await rosterMemberRef(id, githubHandle).get();
  if (!doc.exists) return null;
  return doc.data()?.active !== false;
}

/** Request-deduped + 60s cached roster membership check. */
export const getRosterActive = cache(async (githubHandle: string): Promise<boolean | null> => {
  if (!isAdminConfigured()) return null;
  const id = cohortId();
  const cached = unstable_cache(
    () => readRosterActive(githubHandle, id),
    ['roster-active', id, githubHandle.toLowerCase()],
    { revalidate: 60, tags: [`roster-member:${id}:${githubHandle.toLowerCase()}`] }
  );
  return cached();
});

export async function requireActiveRosterMember(githubHandle: string): Promise<boolean> {
  const active = await getRosterActive(githubHandle);
  return active === true;
}
