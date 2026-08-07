import { cohortId } from '@/lib/cohort-config';
import { peerRatingsVoterRef } from '@/lib/firestore-paths';
import type { PeerRating } from './project-progress-types';

function ratingsRef(projectSlug: string, voterHandle: string) {
  return peerRatingsVoterRef(cohortId(), projectSlug, voterHandle);
}

export async function getVoterRatingsMap(
  projectSlug: string,
  voterHandle: string
): Promise<Record<string, PeerRating>> {
  const doc = await ratingsRef(projectSlug, voterHandle).get();
  if (!doc.exists) return {};

  const raw = doc.data()?.ratings ?? {};
  const out: Record<string, PeerRating> = {};
  for (const [handle, value] of Object.entries(raw)) {
    if (value === 'up' || value === 'down') out[handle] = value;
  }
  return out;
}

export async function setPeerRating(
  projectSlug: string,
  voterHandle: string,
  revieweeHandle: string,
  rating: PeerRating
): Promise<Record<string, PeerRating>> {
  const ref = ratingsRef(projectSlug, voterHandle);
  const existing = await ref.get();
  const ratings: Record<string, PeerRating> = existing.exists
    ? { ...(existing.data()?.ratings ?? {}) }
    : {};

  ratings[revieweeHandle] = rating;

  await ref.set(
    {
      ratings,
      updatedAt: new Date(),
    },
    { merge: true }
  );

  return ratings;
}
