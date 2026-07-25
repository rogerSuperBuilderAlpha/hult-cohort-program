/**
 * Anti-gaming spine, end-to-end against the real emulator (Admin SDK). One suite that walks
 * every seam a collusion attack would probe: source-ref authorship, suggestion dedupe and
 * self-recognition, confirm/decline idempotence and self-award, and one-shot XP awards from
 * commitments and quests. XP is always asserted as a reduction over the append-only `xpEvents`
 * ledger (sum of points where profileUid == uid) — never a mutable counter.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { adminDb } from '@/lib/admin';
import { isAuthoredSource } from '@/lib/source-ref';
import {
  confirmRecognition,
  declineRecognition,
  suggestRecognition,
} from '@/lib/recognition-admin';
import { completeCommitment, trackCommitment } from '@/lib/commitment-admin';
import { completeQuest, seedQuests } from '@/lib/quest-admin';
import { clearFirestore } from './helpers';
import type { Firestore } from 'firebase-admin/firestore';

let db: Firestore;

// Synthetic identities only.
const HELPER = 'zz-test-helper';
const HELPED = 'zz-test-helped';
const OTHER = 'zz-test-other';

async function xpTotal(uid: string): Promise<number> {
  const snap = await db.collection('xpEvents').where('profileUid', '==', uid).get();
  return snap.docs.reduce((s, d) => s + (d.data().points ?? 0), 0);
}

beforeEach(async () => {
  const got = adminDb();
  if (!got) throw new Error('admin db unavailable — FIRESTORE_EMULATOR_HOST not set?');
  db = got;
  await clearFirestore();
  // A channel HELPED belongs to, with a message HELPED authored and one OTHER authored.
  await db.collection('channels').doc('zz-c1').set({ memberUids: [HELPED, HELPER], kind: 'channel', isPrivate: false });
  await db
    .collection('channels').doc('zz-c1').collection('messages').doc('mine')
    .set({ authorUid: HELPED, body: 'thanks for unblocking me!' });
  await db
    .collection('channels').doc('zz-c1').collection('messages').doc('theirs')
    .set({ authorUid: OTHER, body: 'hi' });
});
afterEach(async () => {
  await clearFirestore();
});

describe('isAuthoredSource anchors suggestions to real participation', () => {
  it('accepts a real self-authored message in a joined channel', async () => {
    expect(await isAuthoredSource(db, 'channels/zz-c1/messages/mine', HELPED)).toBe(true);
  });

  it('rejects a fabricated ref (message does not exist)', async () => {
    expect(await isAuthoredSource(db, 'channels/zz-c1/messages/ghost', HELPED)).toBe(false);
  });

  it('rejects a message authored by someone else', async () => {
    expect(await isAuthoredSource(db, 'channels/zz-c1/messages/theirs', HELPED)).toBe(false);
  });

  it('rejects when the caller is not a member of the channel', async () => {
    // OTHER authored "theirs" but is not in memberUids.
    expect(await isAuthoredSource(db, 'channels/zz-c1/messages/theirs', OTHER)).toBe(false);
  });

  it('rejects a reference into a channel that does not exist', async () => {
    expect(await isAuthoredSource(db, 'channels/zz-nope/messages/mine', HELPED)).toBe(false);
  });

  it('rejects a malformed ref', async () => {
    expect(await isAuthoredSource(db, 'not/a/valid/ref', HELPED)).toBe(false);
    expect(await isAuthoredSource(db, 'channels/zz-c1/messages', HELPED)).toBe(false);
    expect(await isAuthoredSource(db, '', HELPED)).toBe(false);
  });

  it('rejects a non-string ref', async () => {
    expect(await isAuthoredSource(db, null, HELPED)).toBe(false);
    expect(await isAuthoredSource(db, 42, HELPED)).toBe(false);
  });
});

describe('suggestRecognition dedupe and self-recognition', () => {
  it('refuses self-recognition (helper === helped)', async () => {
    const id = await suggestRecognition(db, {
      helperUid: HELPER,
      helpedUid: HELPER,
      sourceMsgRef: 'channels/zz-c1/messages/mine',
      kind: 'answered',
    });
    expect(id).toBeNull();
  });

  it('dedupes by (helper, helped, sourceMsgRef)', async () => {
    const a = await suggestRecognition(db, {
      helperUid: HELPER,
      helpedUid: HELPED,
      sourceMsgRef: 'channels/zz-c1/messages/mine',
      kind: 'unblocked',
    });
    const b = await suggestRecognition(db, {
      helperUid: HELPER,
      helpedUid: HELPED,
      sourceMsgRef: 'channels/zz-c1/messages/mine',
      kind: 'answered', // different kind, same triple → still deduped
    });
    expect(a).toBeTruthy();
    expect(b).toBeNull();
    expect((await db.collection('recognitions').get()).size).toBe(1);
  });

  it('a different source ref is a distinct suggestion', async () => {
    const a = await suggestRecognition(db, {
      helperUid: HELPER,
      helpedUid: HELPED,
      sourceMsgRef: 'channels/zz-c1/messages/mine',
      kind: 'unblocked',
    });
    const b = await suggestRecognition(db, {
      helperUid: HELPER,
      helpedUid: HELPED,
      sourceMsgRef: 'channels/zz-c1/messages/other',
      kind: 'unblocked',
    });
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
    expect(a).not.toBe(b);
    expect((await db.collection('recognitions').get()).size).toBe(2);
  });

  it('stores server-set points from the kind, not client input', async () => {
    const id = await suggestRecognition(db, {
      helperUid: HELPER,
      helpedUid: HELPED,
      sourceMsgRef: 'channels/zz-c1/messages/mine',
      kind: 'reviewed',
    });
    expect(id).toBeTruthy();
    const doc = await db.collection('recognitions').doc(id!).get();
    expect(doc.data()).toMatchObject({ status: 'suggested', kind: 'reviewed', points: 10 });
  });
});

async function seedSuggestion(kind = 'unblocked'): Promise<string> {
  const id = await suggestRecognition(db, {
    helperUid: HELPER,
    helpedUid: HELPED,
    sourceMsgRef: 'channels/zz-c1/messages/mine',
    kind,
  });
  if (!id) throw new Error('suggestion not created');
  return id;
}

describe('confirmRecognition awards through the ledger, exactly once', () => {
  it('awards the kind points to the helper and thanks to the helped peer', async () => {
    const id = await seedSuggestion('unblocked');
    const res = await confirmRecognition(db, id, HELPED);
    expect(res).toMatchObject({ ok: true, awarded: 12, alreadyDone: false });
    expect(await xpTotal(HELPER)).toBe(12);
    expect(await xpTotal(HELPED)).toBe(2);
  });

  it('awards points matching the kind schedule (answered = 8)', async () => {
    const id = await seedSuggestion('answered');
    const res = await confirmRecognition(db, id, HELPED);
    expect(res).toMatchObject({ ok: true, awarded: 8 });
    expect(await xpTotal(HELPER)).toBe(8);
  });

  it('is idempotent — a double confirm does not double-award', async () => {
    const id = await seedSuggestion('reviewed');
    const first = await confirmRecognition(db, id, HELPED);
    expect(first).toMatchObject({ ok: true, awarded: 10, alreadyDone: false });
    const second = await confirmRecognition(db, id, HELPED);
    expect(second).toMatchObject({ ok: true, alreadyDone: true });
    expect(await xpTotal(HELPER)).toBe(10); // not 20
    expect(await xpTotal(HELPED)).toBe(2); // not 4
  });

  it('rejects a non-helped peer (bystander) with no award', async () => {
    const id = await seedSuggestion();
    const res = await confirmRecognition(db, id, OTHER);
    expect(res).toMatchObject({ ok: false, reason: 'not_helped_peer' });
    expect(await xpTotal(HELPER)).toBe(0);
  });

  it('rejects a self-award attempt by the helper', async () => {
    const id = await seedSuggestion();
    // helper is not the helped peer, so the guard reports not_helped_peer first.
    const res = await confirmRecognition(db, id, HELPER);
    expect(res).toMatchObject({ ok: false, reason: 'not_helped_peer' });
    expect(await xpTotal(HELPER)).toBe(0);
  });

  it('reports not_found for an unknown recognition id', async () => {
    const res = await confirmRecognition(db, 'does-not-exist', HELPED);
    expect(res).toMatchObject({ ok: false, reason: 'not_found' });
  });

  it('a declined recognition can no longer be confirmed', async () => {
    const id = await seedSuggestion();
    const declined = await declineRecognition(db, id, HELPED);
    expect(declined).toMatchObject({ ok: true, alreadyDone: false });
    const after = await confirmRecognition(db, id, HELPED);
    expect(after).toMatchObject({ ok: false, reason: 'declined' });
    expect(await xpTotal(HELPER)).toBe(0);
  });
});

describe('declineRecognition closes with no points', () => {
  it('declining awards nothing and posts no pulse', async () => {
    const id = await seedSuggestion();
    const res = await declineRecognition(db, id, HELPED);
    expect(res).toMatchObject({ ok: true, awarded: 0 });
    expect(await xpTotal(HELPER)).toBe(0);
    expect((await db.collection('pulseEvents').get()).size).toBe(0);
  });

  it('a non-helped peer cannot decline', async () => {
    const id = await seedSuggestion();
    const res = await declineRecognition(db, id, OTHER);
    expect(res).toMatchObject({ ok: false, reason: 'not_helped_peer' });
  });
});

describe('completeCommitment awards on-time once, never punishes late', () => {
  async function seedCommitment(dueAt: number | null): Promise<string> {
    const { commitmentId } = await trackCommitment(db, null, {
      authorUid: HELPER,
      toUid: HELPED,
      sourceMsgRef: 'channels/zz-c1/messages/mine',
      text: 'ship the docs',
      dueAt,
    });
    return commitmentId;
  }

  it('awards on-time completion once', async () => {
    const id = await seedCommitment(1000);
    const res = await completeCommitment(db, id, 900);
    expect(res).toMatchObject({ ok: true, awarded: 6, onTime: true, alreadyDone: false });
    expect(await xpTotal(HELPER)).toBe(6);
  });

  it('is idempotent — a webhook replay completes once, no double award', async () => {
    const id = await seedCommitment(1000);
    await completeCommitment(db, id, 900);
    const second = await completeCommitment(db, id, 950);
    expect(second).toMatchObject({ ok: true, alreadyDone: true, awarded: 0 });
    expect(await xpTotal(HELPER)).toBe(6); // not 12
  });

  it('a null due date counts as on-time and awards', async () => {
    const id = await seedCommitment(null);
    const res = await completeCommitment(db, id, 999999);
    expect(res).toMatchObject({ ok: true, awarded: 6, onTime: true });
    expect(await xpTotal(HELPER)).toBe(6);
  });

  it('late completion awards nothing but still completes', async () => {
    const id = await seedCommitment(1000);
    const res = await completeCommitment(db, id, 5000);
    expect(res).toMatchObject({ ok: true, awarded: 0, onTime: false, alreadyDone: false });
    expect(await xpTotal(HELPER)).toBe(0);
    const doc = await db.collection('commitments').doc(id).get();
    expect(doc.data()).toMatchObject({ status: 'done', points: 0 });
  });

  it('reports not_found for an unknown commitment', async () => {
    const res = await completeCommitment(db, 'nope', 1);
    expect(res).toMatchObject({ ok: false, reason: 'not_found' });
  });
});

describe('completeQuest awards once then no-ops', () => {
  it('awards the reward the first time', async () => {
    await seedQuests(db, HELPER);
    const awarded = await completeQuest(db, HELPER, 'recognize');
    expect(awarded).toBe(true);
    expect(await xpTotal(HELPER)).toBe(5);
  });

  it('a second completion is a no-op — no double award', async () => {
    await seedQuests(db, HELPER);
    await completeQuest(db, HELPER, 'recognize');
    const again = await completeQuest(db, HELPER, 'recognize');
    expect(again).toBe(false);
    expect(await xpTotal(HELPER)).toBe(5); // not 10
  });

  it('completing a quest that was never seeded is a no-op', async () => {
    const awarded = await completeQuest(db, HELPER, 'commit');
    expect(awarded).toBe(false);
    expect(await xpTotal(HELPER)).toBe(0);
  });
});
