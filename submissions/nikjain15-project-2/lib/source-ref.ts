import type { Firestore } from 'firebase-admin/firestore';

/**
 * A recognition suggestion is only legitimate if it hangs off a REAL message that the helped
 * party actually posted in a channel they belong to. Without this check, /api/detect trusts a
 * client-supplied `sourceMsgRef` string: two colluding accounts could POST fabricated refs
 * ("channels/x/messages/1", "/2", …), each seeding a fresh suggested recognition (dedupe is by
 * ref hash), then self-confirm them — minting XP for a "helper" who never helped. Anchoring the
 * suggestion to an authored message bounds it to real participation: you can only credit someone
 * from a thank-you you genuinely wrote.
 */

/** Parse "channels/<channelId>/messages/<messageId>" → parts, or null if malformed. Pure. */
export function parseMessageRef(ref: unknown): { channelId: string; messageId: string } | null {
  if (typeof ref !== 'string') return null;
  const parts = ref.split('/');
  if (parts.length !== 4 || parts[0] !== 'channels' || parts[2] !== 'messages') return null;
  const [, channelId, , messageId] = parts;
  if (!channelId || !messageId) return null;
  return { channelId, messageId };
}

/**
 * True iff `sourceMsgRef` points at an existing message authored by `authorUid` in a channel
 * `authorUid` is a member of. Server-side (Admin SDK). Any miss (malformed ref, missing channel,
 * non-member, missing message, wrong author) returns false — the caller then declines to suggest.
 */
export async function isAuthoredSource(
  db: Firestore,
  sourceMsgRef: unknown,
  authorUid: string,
): Promise<boolean> {
  const parsed = parseMessageRef(sourceMsgRef);
  if (!parsed) return false;
  const chSnap = await db.collection('channels').doc(parsed.channelId).get();
  if (!chSnap.exists) return false;
  const members = (chSnap.data()?.memberUids as string[] | undefined) ?? [];
  if (!members.includes(authorUid)) return false;
  const msgSnap = await db
    .collection('channels').doc(parsed.channelId).collection('messages').doc(parsed.messageId).get();
  if (!msgSnap.exists) return false;
  return (msgSnap.data()?.authorUid as string | undefined) === authorUid;
}
