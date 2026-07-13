import { FieldValue } from 'firebase-admin/firestore';
import { cohortId } from '@/lib/cohort-config';
import { peerRatingsVoterRef } from '@/lib/firestore-paths';
import type { PeerRating } from './project-progress-types';

function ratingsRef(projectSlug: string, voterHandle: string) {
  return peerRatingsVoterRef(cohortId(), projectSlug, voterHandle);
}

function parseRatingsMap(raw: unknown): Record<string, PeerRating> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, PeerRating> = {};
  for (const [handle, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === 'up' || value === 'down') out[handle] = value;
  }
  return out;
}

export async function getVoterRatingsMap(
  projectSlug: string,
  voterHandle: string
): Promise<Record<string, PeerRating>> {
  const doc = await ratingsRef(projectSlug, voterHandle).get();
  if (!doc.exists) return {};
  return parseRatingsMap(doc.data()?.ratings);
}

export async function setPeerRating(
  projectSlug: string,
  voterHandle: string,
  revieweeHandle: string,
  rating: PeerRating
): Promise<Record<string, PeerRating>> {
  const ref = ratingsRef(projectSlug, voterHandle);
  const fieldPath = `ratings.${revieweeHandle}`;

  // Read once, write, return in-memory map (no post-write re-get).
  const existing = await getVoterRatingsMap(projectSlug, voterHandle);
  const next = { ...existing, [revieweeHandle]: rating };

  try {
    await ref.update({
      [fieldPath]: rating,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code: string }).code)
        : '';
    if (code !== 'not-found' && code !== '5') {
      throw err;
    }
    await ref.set(
      {
        ratings: { [revieweeHandle]: rating },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  return next;
}
