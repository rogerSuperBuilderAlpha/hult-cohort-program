/**
 * The anti-farming anchor: a recognition suggestion is only legitimate if the helped party
 * actually authored the source message in a channel they belong to. This is what stops two
 * colluding accounts from fabricating sourceMsgRefs to mint XP (see lib/source-ref.ts).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { adminDb } from '@/lib/admin';
import { isAuthoredSource } from '@/lib/source-ref';
import { clearFirestore } from './helpers';
import type { Firestore } from 'firebase-admin/firestore';

let db: Firestore;
const ME = 'uid_me';
const OTHER = 'uid_other';

beforeEach(async () => {
  const got = adminDb();
  if (!got) throw new Error('admin db unavailable — FIRESTORE_EMULATOR_HOST not set?');
  db = got;
  await clearFirestore();
  await db.collection('channels').doc('c1').set({ memberUids: [ME], kind: 'channel', isPrivate: false });
  await db.collection('channels').doc('c1').collection('messages').doc('mine').set({ authorUid: ME, body: 'thanks!' });
  await db.collection('channels').doc('c1').collection('messages').doc('theirs').set({ authorUid: OTHER, body: 'hi' });
});
afterEach(async () => {
  await clearFirestore();
});

describe('isAuthoredSource', () => {
  it('accepts a real message the caller authored in a channel they belong to', async () => {
    expect(await isAuthoredSource(db, 'channels/c1/messages/mine', ME)).toBe(true);
  });

  it('rejects a fabricated ref (message does not exist)', async () => {
    expect(await isAuthoredSource(db, 'channels/c1/messages/ghost', ME)).toBe(false);
  });

  it('rejects a message the caller did not author', async () => {
    expect(await isAuthoredSource(db, 'channels/c1/messages/theirs', ME)).toBe(false);
  });

  it('rejects a channel the caller is not a member of', async () => {
    expect(await isAuthoredSource(db, 'channels/c1/messages/mine', OTHER)).toBe(false);
  });

  it('rejects a malformed ref', async () => {
    expect(await isAuthoredSource(db, 'not/a/valid/ref', ME)).toBe(false);
    expect(await isAuthoredSource(db, '', ME)).toBe(false);
  });
});
