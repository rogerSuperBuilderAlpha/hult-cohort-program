/**
 * The Brief's data gathering against a real Firestore (Admin SDK on the emulator). Proves it
 * counts what actually has a claim on you — pending recognitions, your open commitments, and
 * genuinely-unread messages (not your own) — so the deterministic Brief is fed correct inputs.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { adminDb } from '@/lib/admin';
import { gatherBriefInput } from '@/lib/brief-admin';
import { clearFirestore } from './helpers';
import { FieldValue, type Firestore } from 'firebase-admin/firestore';

let db: Firestore;
const ME = 'uid_me';
const OTHER = 'uid_other';

beforeEach(async () => {
  const got = adminDb();
  if (!got) throw new Error('admin db unavailable');
  db = got;
  await clearFirestore();
});
afterEach(async () => {
  await clearFirestore();
});

describe('gatherBriefInput', () => {
  it('counts pending recognitions, open commitments, and others\' unread messages', async () => {
    // A channel I'm in, with messages from someone else after my (absent) read bookmark.
    await db.collection('channels').doc('general').set({
      slug: 'general', name: 'General', kind: 'channel', isPrivate: false,
      creatorUid: ME, memberUids: [ME, OTHER], createdAt: FieldValue.serverTimestamp(),
    });
    await db.collection('channels').doc('general').collection('messages').add({
      authorUid: OTHER, body: 'hi', parentId: null, createdAt: FieldValue.serverTimestamp(), editedAt: null,
    });
    await db.collection('channels').doc('general').collection('messages').add({
      authorUid: ME, body: 'my own message', parentId: null, createdAt: FieldValue.serverTimestamp(), editedAt: null,
    });

    // A recognition awaiting my confirm.
    await db.collection('recognitions').doc('r1').set({
      helperUid: OTHER, helpedUid: ME, sourceMsgRef: 'x', kind: 'answered', status: 'suggested', points: 8,
      createdAt: FieldValue.serverTimestamp(),
    });
    // One of my open commitments.
    await db.collection('commitments').doc('c1').set({
      authorUid: ME, toUid: null, sourceMsgRef: 'x', text: 'ship it', dueAt: Date.now() + 3_600_000,
      status: 'open', pmTaskUrl: null, pmExternalId: null, points: 0, createdAt: FieldValue.serverTimestamp(),
    });

    const input = await gatherBriefInput(db, ME, Date.now());
    expect(input.pendingRecognitions).toBe(1);
    expect(input.dueCommitments.map((c) => c.text)).toEqual(['ship it']);
    const general = input.unreadChannels.find((c) => c.name === 'General')!;
    expect(general.unread).toBe(1); // OTHER's message counts, mine does not
  });

  it('reports nothing pending for a caught-up member', async () => {
    const input = await gatherBriefInput(db, 'uid_clear', Date.now());
    expect(input.pendingRecognitions).toBe(0);
    expect(input.dueCommitments).toEqual([]);
  });
});
