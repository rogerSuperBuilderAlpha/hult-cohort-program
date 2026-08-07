import type { Firestore } from 'firebase-admin/firestore';
import { buildBrief, type Brief, type BriefInput } from './brief';

/**
 * Gather the Brief's inputs from Firestore (server-side, Admin SDK) and build it. Reads only
 * what has a claim on the caller: recognitions awaiting their confirm, their open commitments,
 * and per-channel unread since their read bookmark. Whole-collection reads are fine at cohort
 * scale (~65) and keep this one call instead of a lattice of indexes.
 */
export async function gatherBrief(db: Firestore, uid: string, nowMs: number): Promise<Brief> {
  const input = await gatherBriefInput(db, uid, nowMs);
  return buildBrief(input);
}

export async function gatherBriefInput(db: Firestore, uid: string, nowMs: number): Promise<BriefInput> {
  const [recs, commits, channels] = await Promise.all([
    db.collection('recognitions').where('helpedUid', '==', uid).where('status', '==', 'suggested').get(),
    db.collection('commitments').where('authorUid', '==', uid).where('status', '==', 'open').get(),
    db.collection('channels').where('memberUids', 'array-contains', uid).get(),
  ]);

  const dueCommitments = commits.docs.map((d) => ({
    text: (d.data().text as string) ?? '',
    dueAtMs: (d.data().dueAt as number | null) ?? null,
  }));

  // Per-channel unread: count messages created after the caller's lastReadAt for that channel.
  const unreadChannels = await Promise.all(
    channels.docs.map(async (ch) => {
      const readSnap = await db.collection('channels').doc(ch.id).collection('reads').doc(uid).get();
      const lastRead = readSnap.exists ? (readSnap.data()?.lastReadAt?.toMillis?.() ?? 0) : 0;
      // Cap the read: the Brief only needs "how busy" for the busiest-channel line, not an
      // exact count. A brand-new member (no read bookmark) would otherwise scan the entire
      // channel history; limit bounds every gather to a small, constant read.
      const msgs = await db
        .collection('channels')
        .doc(ch.id)
        .collection('messages')
        .where('createdAt', '>', new Date(lastRead))
        .limit(50)
        .get();
      // Don't count your own messages as unread.
      const unread = msgs.docs.filter((m) => m.data().authorUid !== uid).length;
      return { name: (ch.data().name as string) ?? ch.id, unread };
    }),
  );

  return {
    pendingRecognitions: recs.size,
    dueCommitments,
    unreadChannels,
    nowMs,
  };
}
