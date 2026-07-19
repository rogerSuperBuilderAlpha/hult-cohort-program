/**
 * Commitments end to end against a real Firestore (Admin SDK on the emulator), with a fake PM
 * adapter so no network is touched. Proves: Track it records the commitment and its PM link;
 * completion awards on-time XP once (idempotent under webhook replay); a late completion still
 * closes but earns nothing (never a penalty); and the PM outage path records the commitment
 * unlinked rather than losing it.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { adminDb } from '@/lib/admin';
import {
  completeCommitment,
  findByExternalId,
  trackCommitment,
} from '@/lib/commitment-admin';
import type { PmAdapter } from '@/lib/pm-adapter';
import { clearFirestore } from './helpers';
import type { Firestore } from 'firebase-admin/firestore';

let db: Firestore;

beforeEach(async () => {
  const got = adminDb();
  if (!got) throw new Error('admin db unavailable');
  db = got;
  await clearFirestore();
});
afterEach(async () => {
  await clearFirestore();
});

const AUTHOR = 'uid_author';

class FakeAdapter implements PmAdapter {
  readonly name = 'fake';
  created: { title: string; body: string }[] = [];
  async createTask(input: { title: string; body: string }) {
    this.created.push(input);
    return { externalId: '42', url: 'https://example.test/issues/42' };
  }
}

class BrokenAdapter implements PmAdapter {
  readonly name = 'broken';
  async createTask(): Promise<never> {
    throw new Error('PM down');
  }
}

async function xpTotal(uid: string): Promise<number> {
  const snap = await db.collection('xpEvents').where('profileUid', '==', uid).get();
  return snap.docs.reduce((s, d) => s + (d.data().points ?? 0), 0);
}

describe('Track it', () => {
  it('records the commitment and opens a linked PM task', async () => {
    const adapter = new FakeAdapter();
    const res = await trackCommitment(db, adapter, {
      authorUid: AUTHOR,
      sourceMsgRef: 'channels/general/messages/m1',
      text: 'I will open the PR by Friday',
      dueAt: Date.now() + 3_600_000,
    });
    expect(res.pmTaskUrl).toBe('https://example.test/issues/42');
    expect(res.pmExternalId).toBe('42');
    expect(adapter.created).toHaveLength(1);
    expect(await findByExternalId(db, '42')).toBe(res.commitmentId);
  });

  it('records the commitment UNLINKED when the PM integration is down (never lost)', async () => {
    const res = await trackCommitment(db, new BrokenAdapter(), {
      authorUid: AUTHOR,
      sourceMsgRef: 'channels/general/messages/m2',
      text: 'I will review the rules',
      dueAt: null,
    });
    expect(res.pmTaskUrl).toBeNull();
    const snap = await db.collection('commitments').doc(res.commitmentId).get();
    expect(snap.data()?.status).toBe('open');
  });

  it('works with NO adapter at all (degraded PM)', async () => {
    const res = await trackCommitment(db, null, {
      authorUid: AUTHOR,
      sourceMsgRef: 'channels/general/messages/m3',
      text: 'I will seed the demo data',
      dueAt: null,
    });
    expect(res.pmTaskUrl).toBeNull();
    expect(res.commitmentId).toBeTruthy();
  });
});

describe('completion + on-time award', () => {
  it('awards on-time XP once and is idempotent under webhook replay', async () => {
    const due = Date.now() + 3_600_000;
    const { commitmentId } = await trackCommitment(db, new FakeAdapter(), {
      authorUid: AUTHOR,
      sourceMsgRef: 'channels/general/messages/m1',
      text: 'ship it by EOD',
      dueAt: due,
    });

    const first = await completeCommitment(db, commitmentId, due - 60_000);
    expect(first).toMatchObject({ ok: true, onTime: true, alreadyDone: false });
    expect(await xpTotal(AUTHOR)).toBe(6);

    const replay = await completeCommitment(db, commitmentId, due - 60_000);
    expect(replay).toMatchObject({ ok: true, alreadyDone: true });
    expect(await xpTotal(AUTHOR)).toBe(6); // not 12

    const pulse = await db.collection('pulseEvents').get();
    expect(pulse.size).toBe(1);
    expect(pulse.docs[0].data()).toMatchObject({ verb: 'commitment_kept' });
  });

  it('a LATE completion closes but earns nothing — never a penalty', async () => {
    const due = Date.now() - 3_600_000; // already past
    const { commitmentId } = await trackCommitment(db, new FakeAdapter(), {
      authorUid: AUTHOR,
      sourceMsgRef: 'channels/general/messages/m1',
      text: 'late thing',
      dueAt: due,
    });
    const res = await completeCommitment(db, commitmentId, Date.now());
    expect(res).toMatchObject({ ok: true, onTime: false });
    expect(await xpTotal(AUTHOR)).toBe(0);
    // Still marked done — completion is never punished, just unrewarded.
    const snap = await db.collection('commitments').doc(commitmentId).get();
    expect(snap.data()?.status).toBe('done');
  });
});
