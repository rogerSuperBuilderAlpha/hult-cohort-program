import { nextCohortId } from '@/lib/cohort-config';
import { cohortInterestRef } from '@/lib/firestore-paths';
import type { NextCohortInterest } from '@/lib/cohort-interest-types';

export type { NextCohortInterest } from '@/lib/cohort-interest-types';

export async function getNextCohortInterest(
  githubHandle: string
): Promise<NextCohortInterest | null> {
  const id = nextCohortId();
  if (!id) return null;

  const doc = await cohortInterestRef(id, githubHandle).get();
  if (!doc.exists) {
    return { cohortId: id, interested: false };
  }

  const data = doc.data();
  return {
    cohortId: id,
    interested: true,
    indicatedAt: data?.indicatedAt?.toDate?.()?.toISOString?.(),
  };
}

export async function setNextCohortInterest(params: {
  githubHandle: string;
  firebaseUid?: string;
  githubOAuthUid?: string;
}): Promise<NextCohortInterest> {
  const id = nextCohortId();
  if (!id) {
    throw new Error('Next cohort interest is not open yet.');
  }

  const now = new Date();
  await cohortInterestRef(id, params.githubHandle).set({
    githubHandle: params.githubHandle,
    firebaseUid: params.firebaseUid ?? null,
    githubOAuthUid: params.githubOAuthUid ?? null,
    indicatedAt: now,
    updatedAt: now,
  });

  return {
    cohortId: id,
    interested: true,
    indicatedAt: now.toISOString(),
  };
}
