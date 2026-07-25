import { FieldValue } from 'firebase-admin/firestore';
import { cohortId } from '@/lib/cohort-config';
import { isAdminConfigured } from '@/lib/firebase/admin';
import { expectationsAcknowledgmentRef } from '@/lib/firestore-paths';

import type { ExpectationsAckRecord } from './expectations-ack-types';

export type { ExpectationsAckRecord };

const ACK_VERSION = 'community-2026-07';

export async function getExpectationsAcknowledgment(
  githubHandle: string,
  id = cohortId()
): Promise<ExpectationsAckRecord | null> {
  if (!isAdminConfigured()) return null;

  const snap = await expectationsAcknowledgmentRef(id, githubHandle).get();
  if (!snap.exists) return null;

  const data = snap.data();
  const signedAt = data?.signedAt?.toDate?.()?.toISOString?.() ?? null;
  if (!signedAt) return null;

  return {
    signedAt,
    showcaseOptOut: data?.showcaseOptOut === true,
    version: typeof data?.version === 'string' ? data.version : ACK_VERSION,
  };
}

export async function signExpectationsAcknowledgment(
  githubHandle: string,
  options: { showcaseOptOut: boolean },
  id = cohortId()
): Promise<ExpectationsAckRecord> {
  const ref = expectationsAcknowledgmentRef(id, githubHandle);
  await ref.set(
    {
      signedAt: FieldValue.serverTimestamp(),
      showcaseOptOut: options.showcaseOptOut,
      version: ACK_VERSION,
    },
    { merge: true }
  );

  const snap = await ref.get();
  const data = snap.data();
  return {
    signedAt: data?.signedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    showcaseOptOut: options.showcaseOptOut,
    version: ACK_VERSION,
  };
}
