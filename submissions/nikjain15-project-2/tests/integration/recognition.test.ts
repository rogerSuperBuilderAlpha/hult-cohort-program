/**
 * The recognition ledger against a real Firestore (Admin SDK on the emulator) — the whole
 * motivation engine's integrity, asserted. These are the tests that prove the game is fair:
 * XP is awarded only on the helped peer's confirm, exactly once, never to oneself, and the
 * total is a reduction over the append-only ledger — not a mutable counter anyone can bump.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { adminDb } from '@/lib/admin';
import {
  confirmRecognition,
  declineRecognition,
  suggestRecognition,
} from '@/lib/recognition-admin';
import { clearFirestore } from './helpers';
import type { Firestore } from 'firebase-admin/firestore';

let db: Firestore;

beforeEach(async () => {
  const got = adminDb();
  if (!got) throw new Error('admin db unavailable — FIRESTORE_EMULATOR_HOST not set?');
  db = got;
  await clearFirestore();
});
afterEach(async () => {
  await clearFirestore();
});

const HELPER = 'uid_helper';
const HELPED = 'uid_helped';

async function xpTotal(uid: string): Promise<number> {
  const snap = await db.collection('xpEvents').where('profileUid', '==', uid).get();
  return snap.docs.reduce((s, d) => s + (d.data().points ?? 0), 0);
}

async function seedSuggestion(kind = 'unblocked'): Promise<string> {
  const id = await suggestRecognition(db, {
    helperUid: HELPER,
    helpedUid: HELPED,
    sourceMsgRef: 'channels/general/messages/m1',
    kind,
  });
  if (!id) throw new Error('suggestion not created');
  return id;
}

describe('confirm awards XP through the ledger', () => {
  it('the helped peer confirming awards the helper (and a small thanks to themselves)', async () => {
    const id = await seedSuggestion('unblocked');
    const res = await confirmRecognition(db, id, HELPED);
    expect(res).toMatchObject({ ok: true, awarded: 12, alreadyDone: false });
    expect(await xpTotal(HELPER)).toBe(12);
    expect(await xpTotal(HELPED)).toBe(2);

    // …and a pulse event announced it.
    const pulse = await db.collection('pulseEvents').get();
    expect(pulse.size).toBe(1);
    expect(pulse.docs[0].data()).toMatchObject({ actorUid: HELPER, verb: 'recognition_confirmed', points: 12 });
  });

  it('is idempotent — a double confirm awards exactly once', async () => {
    const id = await seedSuggestion('answered');
    await confirmRecognition(db, id, HELPED);
    const second = await confirmRecognition(db, id, HELPED);
    expect(second).toMatchObject({ ok: true, alreadyDone: true });
    expect(await xpTotal(HELPER)).toBe(8); // not 16
  });
});

describe('the game cannot be gamed', () => {
  it('the helper cannot confirm their own recognition (self-award)', async () => {
    const id = await seedSuggestion();
    const res = await confirmRecognition(db, id, HELPER);
    expect(res).toMatchObject({ ok: false, reason: 'not_helped_peer' });
    expect(await xpTotal(HELPER)).toBe(0);
  });

  it('a bystander cannot confirm a recognition that is not about them', async () => {
    const id = await seedSuggestion();
    const res = await confirmRecognition(db, id, 'uid_bystander');
    expect(res).toMatchObject({ ok: false, reason: 'not_helped_peer' });
    expect(await xpTotal(HELPER)).toBe(0);
  });

  it('you get no credit for helping yourself (suggestion refused)', async () => {
    const id = await suggestRecognition(db, {
      helperUid: HELPER,
      helpedUid: HELPER,
      sourceMsgRef: 'channels/general/messages/m2',
      kind: 'answered',
    });
    expect(id).toBeNull();
  });

  it('detection re-running on the same message does not duplicate the suggestion', async () => {
    const a = await seedSuggestion('answered');
    const b = await suggestRecognition(db, {
      helperUid: HELPER,
      helpedUid: HELPED,
      sourceMsgRef: 'channels/general/messages/m1',
      kind: 'answered',
    });
    expect(b).toBeNull(); // same (helper, helped, ref) → deduped
    expect(a).toBeTruthy();
  });
});

describe('decline closes quietly', () => {
  it('declining awards nothing and posts no pulse', async () => {
    const id = await seedSuggestion();
    const res = await declineRecognition(db, id, HELPED);
    expect(res).toMatchObject({ ok: true });
    expect(await xpTotal(HELPER)).toBe(0);
    expect((await db.collection('pulseEvents').get()).size).toBe(0);
    // A declined recognition can no longer be confirmed into points.
    const after = await confirmRecognition(db, id, HELPED);
    expect(after).toMatchObject({ ok: false, reason: 'declined' });
  });
});
