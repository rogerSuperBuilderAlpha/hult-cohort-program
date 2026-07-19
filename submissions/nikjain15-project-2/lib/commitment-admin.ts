import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import type { PmAdapter } from './pm-adapter';
import { invalidateLeaderboard } from './leaderboard-admin';

/**
 * Commitments — "I'll do X by Y", captured with the person's consent, tracked to done.
 *
 * Server-side because completion carries XP and must not be client-forgeable: a client can
 * create/edit its own commitment text (rules allow that), but pmTaskUrl and the on-time award
 * are written here. The PM adapter is injected so this works with GitHub, with a fake in
 * tests, or with nothing at all (no adapter → commitment still recorded, just unlinked).
 *
 * XP is awarded ONCE, only when a commitment is completed on time, via the append-only ledger
 * — same anti-gaming spine as recognition. Missing a commitment is never punished (no negative
 * XP, no shame); it simply earns nothing. The game lifts, it does not dock.
 */

const ON_TIME_POINTS = 6;

export type TrackResult = {
  commitmentId: string;
  pmTaskUrl: string | null;
  pmExternalId: string | null;
};

/** Create a commitment the author confirmed, and (if a PM adapter is configured) a linked task. */
export async function trackCommitment(
  db: Firestore,
  adapter: PmAdapter | null,
  input: { authorUid: string; toUid?: string | null; sourceMsgRef: string; text: string; dueAt: number | null },
): Promise<TrackResult> {
  const ref = db.collection('commitments').doc();

  let pmTaskUrl: string | null = null;
  let pmExternalId: string | null = null;
  if (adapter) {
    try {
      const task = await adapter.createTask({
        title: input.text.slice(0, 120),
        body: `Commitment tracked from Rally.\n\nSource: ${input.sourceMsgRef}\nOwner: ${input.authorUid}`,
      });
      pmTaskUrl = task.url;
      pmExternalId = task.externalId;
    } catch {
      // A PM outage must not lose the commitment — record it unlinked and move on.
      pmTaskUrl = null;
      pmExternalId = null;
    }
  }

  await ref.set({
    authorUid: input.authorUid,
    toUid: input.toUid ?? null,
    sourceMsgRef: input.sourceMsgRef,
    text: input.text,
    dueAt: input.dueAt,
    status: 'open',
    pmTaskUrl,
    pmExternalId,
    points: 0,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { commitmentId: ref.id, pmTaskUrl, pmExternalId };
}

export type CompleteResult =
  | { ok: true; awarded: number; onTime: boolean; alreadyDone: boolean }
  | { ok: false; reason: 'not_found' };

/**
 * Mark a commitment done. `at` is when completion happened (webhook time / now). On-time
 * (at ≤ dueAt, or no due date) awards XP once; late still completes but earns nothing —
 * never a penalty. Idempotent: a webhook replay completes once.
 */
export async function completeCommitment(
  db: Firestore,
  commitmentId: string,
  at: number,
): Promise<CompleteResult> {
  const ref = db.collection('commitments').doc(commitmentId);
  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { ok: false, reason: 'not_found' } as const;
    const c = snap.data()!;
    if (c.status === 'done') return { ok: true, awarded: 0, onTime: false, alreadyDone: true } as const;

    const onTime = c.dueAt == null || at <= c.dueAt;
    const points = onTime ? ON_TIME_POINTS : 0;

    tx.update(ref, { status: 'done', points });
    if (points > 0) {
      tx.set(db.collection('xpEvents').doc(`xp_commit_${commitmentId}`), {
        profileUid: c.authorUid,
        source: 'commitment',
        refId: commitmentId,
        points,
        createdAt: FieldValue.serverTimestamp(),
      });
      tx.set(db.collection('pulseEvents').doc(`pulse_commit_${commitmentId}`), {
        actorUid: c.authorUid,
        verb: 'commitment_kept',
        object: c.authorUid,
        points,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
    return { ok: true, awarded: points, onTime, alreadyDone: false } as const;
  });
  if (result.ok && !result.alreadyDone && result.awarded > 0) invalidateLeaderboard();
  return result;
}

/** Find a commitment by its PM external id (issue number) — for webhook correlation. */
export async function findByExternalId(db: Firestore, externalId: string): Promise<string | null> {
  const q = await db.collection('commitments').where('pmExternalId', '==', externalId).limit(1).get();
  return q.empty ? null : q.docs[0].id;
}
