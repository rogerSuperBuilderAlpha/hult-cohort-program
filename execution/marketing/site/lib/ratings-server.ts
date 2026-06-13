import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import type { Firestore } from 'firebase-admin/firestore';
import type { PeerRating } from './project-progress-types';

const COHORT = 'fall26';

function ratingsRef(db: Firestore, projectSlug: string, voterHandle: string) {
  return db
    .collection('peerRatings')
    .doc(COHORT)
    .collection('projects')
    .doc(projectSlug)
    .collection('voters')
    .doc(voterHandle);
}

export async function getVoterRatingsMap(
  projectSlug: string,
  voterHandle: string
): Promise<Record<string, PeerRating>> {
  if (!isAdminConfigured()) return {};

  const db = getAdminDb();
  const doc = await ratingsRef(db, projectSlug, voterHandle).get();
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
  const db = getAdminDb();
  const ref = ratingsRef(db, projectSlug, voterHandle);
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

/** Staff-only aggregate tally — not exposed to participants during voting */
export async function tallyThumbsUp(
  projectSlug: string
): Promise<{ handle: string; thumbsUp: number; thumbsDown: number }[]> {
  const db = getAdminDb();
  const snap = await db
    .collection('peerRatings')
    .doc(COHORT)
    .collection('projects')
    .doc(projectSlug)
    .collection('voters')
    .get();

  const totals = new Map<string, { up: number; down: number }>();

  for (const voterDoc of snap.docs) {
    const ratings = voterDoc.data()?.ratings ?? {};
    for (const [handle, value] of Object.entries(ratings)) {
      if (value !== 'up' && value !== 'down') continue;
      const row = totals.get(handle) ?? { up: 0, down: 0 };
      if (value === 'up') row.up += 1;
      else row.down += 1;
      totals.set(handle, row);
    }
  }

  return [...totals.entries()]
    .map(([handle, { up, down }]) => ({
      handle,
      thumbsUp: up,
      thumbsDown: down,
    }))
    .sort((a, b) => b.thumbsUp - a.thumbsUp);
}
