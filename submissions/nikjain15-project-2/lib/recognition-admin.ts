import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import { invalidateLeaderboard } from './leaderboard-admin';

/**
 * The recognition ledger — Rally's motivation engine, server-side.
 *
 * The whole product promise ("the game lifts people, never punishes them; it can't be gamed")
 * lives or dies here. Rules make points client-unwritable; this module is the only thing that
 * legitimately writes them, and it does so ONLY when the *helped* peer confirms. Three
 * invariants it must never break:
 *   1. You cannot award yourself — a helper can't confirm their own recognition.
 *   2. Points are set by the server from the kind, never taken from client input.
 *   3. Confirm is idempotent — a double POST (two tabs, a retry) awards XP exactly once.
 * XP is written to the append-only `xpEvents` ledger; rank/reputation are computed from it,
 * never stored as a mutable total.
 */

export type RecognitionKind = 'answered' | 'unblocked' | 'reviewed' | 'paired';

/** Points per kind — the server's schedule, deliberately small and generosity-weighted. */
const POINTS: Record<RecognitionKind, number> = {
  answered: 8,
  unblocked: 12,
  reviewed: 10,
  paired: 10,
};

/** A small thank-you to the person who confirmed — receiving help and closing the loop counts. */
const CONFIRM_THANKS = 2;

export function pointsFor(kind: string): number {
  return POINTS[(kind as RecognitionKind)] ?? POINTS.answered;
}

/**
 * Create a *suggested* recognition (server-only; clients can't). Detection calls this. Never
 * awards anything — a suggestion is an invitation to the helped peer, not a fait accompli.
 * Deduped by (helper, helped, sourceMsgRef) so re-running detection on the same message can't
 * spawn duplicate suggestions.
 */
export async function suggestRecognition(
  db: Firestore,
  input: { helperUid: string; helpedUid: string; sourceMsgRef: string; kind: string },
): Promise<string | null> {
  if (input.helperUid === input.helpedUid) return null; // you don't get credit for helping yourself
  const kind = (input.kind as RecognitionKind) in POINTS ? (input.kind as RecognitionKind) : 'answered';
  const dedupeId = `sug_${input.helperUid}_${input.helpedUid}_${hash(input.sourceMsgRef)}`;
  const ref = db.collection('recognitions').doc(dedupeId);
  const created = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) return false;
    tx.set(ref, {
      helperUid: input.helperUid,
      helpedUid: input.helpedUid,
      sourceMsgRef: input.sourceMsgRef,
      kind,
      status: 'suggested',
      points: pointsFor(kind),
      createdAt: FieldValue.serverTimestamp(),
    });
    return true;
  });
  return created ? dedupeId : null;
}

export type ConfirmResult =
  | { ok: true; awarded: number; alreadyDone: boolean }
  | { ok: false; reason: 'not_found' | 'not_helped_peer' | 'self_award' | 'declined' };

/**
 * Confirm a recognition as the helped peer. Awards XP to the helper (and a small thanks to
 * the confirmer), appends a pulse event, and flips status — all in one transaction so a retry
 * can't double-award. `actingUid` is the authenticated caller (verified by the route).
 */
export async function confirmRecognition(
  db: Firestore,
  recognitionId: string,
  actingUid: string,
): Promise<ConfirmResult> {
  const recRef = db.collection('recognitions').doc(recognitionId);
  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(recRef);
    if (!snap.exists) return { ok: false, reason: 'not_found' } as const;
    const rec = snap.data()!;
    if (rec.helpedUid !== actingUid) return { ok: false, reason: 'not_helped_peer' } as const;
    if (rec.helperUid === actingUid) return { ok: false, reason: 'self_award' } as const;
    if (rec.status === 'declined') return { ok: false, reason: 'declined' } as const;
    // Idempotent: already confirmed → report success without re-awarding.
    if (rec.status === 'confirmed') return { ok: true, awarded: 0, alreadyDone: true } as const;

    const points: number = rec.points ?? pointsFor(rec.kind);

    tx.update(recRef, { status: 'confirmed' });

    // Ledger entries — deterministic ids keyed to the recognition so even a rules-bypassing
    // re-run can't create a second award for the same recognition.
    tx.set(db.collection('xpEvents').doc(`xp_help_${recognitionId}`), {
      profileUid: rec.helperUid,
      source: 'recognition',
      refId: recognitionId,
      points,
      createdAt: FieldValue.serverTimestamp(),
    });
    tx.set(db.collection('xpEvents').doc(`xp_thanks_${recognitionId}`), {
      profileUid: rec.helpedUid,
      source: 'recognition_confirmed',
      refId: recognitionId,
      points: CONFIRM_THANKS,
      createdAt: FieldValue.serverTimestamp(),
    });
    tx.set(db.collection('pulseEvents').doc(`pulse_rec_${recognitionId}`), {
      actorUid: rec.helperUid,
      verb: 'recognition_confirmed',
      object: rec.helpedUid,
      points,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { ok: true, awarded: points, alreadyDone: false } as const;
  });
  // XP changed → the cached leaderboard must recompute from the ledger on the next read.
  if (result.ok && !result.alreadyDone && result.awarded > 0) invalidateLeaderboard();
  return result;
}

/** Decline a recognition (helped peer only). No points, no pulse — quietly closes it. */
export async function declineRecognition(
  db: Firestore,
  recognitionId: string,
  actingUid: string,
): Promise<ConfirmResult> {
  const recRef = db.collection('recognitions').doc(recognitionId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(recRef);
    if (!snap.exists) return { ok: false, reason: 'not_found' } as const;
    const rec = snap.data()!;
    if (rec.helpedUid !== actingUid) return { ok: false, reason: 'not_helped_peer' } as const;
    if (rec.status === 'confirmed') return { ok: true, awarded: 0, alreadyDone: true } as const;
    tx.update(recRef, { status: 'declined' });
    return { ok: true, awarded: 0, alreadyDone: false } as const;
  });
}

/** FNV-1a → 8 hex chars. A stable dedupe suffix from a message ref; not security-sensitive. */
function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
