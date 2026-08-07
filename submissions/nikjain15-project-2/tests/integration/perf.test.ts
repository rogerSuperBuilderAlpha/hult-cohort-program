/**
 * Performance at cohort scale (Testing regime D). Seeds SYNTHETIC data only — ~65 users,
 * three channels, a few thousand messages, a ledger — then measures the operations that run on
 * a real page load: the open-channel message query, the Brief gather, and the leaderboard
 * compute. Bounds are generous (emulator, cold) and exist to catch a regression into
 * accidental O(n²) or an unindexed scan, not to benchmark hardware. Measured ms are logged.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { adminDb } from '@/lib/admin';
import { gatherBriefInput } from '@/lib/brief-admin';
import { computeLeaderboard } from '@/lib/leaderboard-admin';
import { clearFirestore } from './helpers';
import { FieldValue, type Firestore } from 'firebase-admin/firestore';

let db: Firestore;
const USERS = 65;
const MESSAGES_PER_CHANNEL = 700; // ~2,100 total across 3 channels
const CHANNELS = ['general', 'help', 'wins'];

function uid(i: number): string {
  return `perf_u${i}`;
}

beforeAll(async () => {
  const got = adminDb();
  if (!got) throw new Error('admin db unavailable');
  db = got;
  await clearFirestore();

  const members = Array.from({ length: USERS }, (_, i) => uid(i));

  // Profiles.
  let batch = db.batch();
  let ops = 0;
  const flush = async () => {
    if (ops > 0) await batch.commit();
    batch = db.batch();
    ops = 0;
  };
  const add = async (ref: FirebaseFirestore.DocumentReference, data: Record<string, unknown>) => {
    batch.set(ref, data);
    if (++ops >= 400) await flush();
  };

  for (let i = 0; i < USERS; i++) {
    await add(db.collection('profiles').doc(uid(i)), {
      uid: uid(i), handle: `gh_${i}`, displayName: `Member ${i}`, avatarUrl: null,
      githubLogin: `gh_${i}`, createdAt: FieldValue.serverTimestamp(),
    });
  }
  // Channels — everyone a member.
  for (const slug of CHANNELS) {
    await add(db.collection('channels').doc(slug), {
      slug, name: slug, kind: 'channel', isPrivate: false, creatorUid: uid(0),
      memberUids: members, createdAt: FieldValue.serverTimestamp(),
    });
  }
  // Messages.
  for (const slug of CHANNELS) {
    for (let m = 0; m < MESSAGES_PER_CHANNEL; m++) {
      await add(db.collection('channels').doc(slug).collection('messages').doc(), {
        authorUid: uid(m % USERS), body: `msg ${m} in ${slug}`, parentId: null,
        createdAt: FieldValue.serverTimestamp(), editedAt: null,
      });
    }
  }
  // Ledger — a spread of XP so the leaderboard has real ranking work.
  for (let i = 0; i < USERS; i++) {
    for (let e = 0; e < 3; e++) {
      await add(db.collection('xpEvents').doc(`perf_xp_${i}_${e}`), {
        profileUid: uid(i), source: 'test', refId: `r${e}`, points: (i % 7) + 1,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  }
  await flush();
}, 120_000);

afterAll(async () => {
  await clearFirestore();
});

async function timed<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const start = Date.now();
  const out = await fn();
  return [out, Date.now() - start];
}

describe('cohort-scale performance (synthetic data)', () => {
  it('loads the open channel (latest 200 messages) quickly', async () => {
    const [snap, ms] = await timed(() =>
      db.collection('channels').doc('general').collection('messages')
        .orderBy('createdAt', 'desc').limit(200).get(),
    );
    console.log(`[perf] channel load (200 of ${MESSAGES_PER_CHANNEL}): ${ms}ms, ${snap.size} docs`);
    expect(snap.size).toBe(200);
    expect(ms).toBeLessThan(3000);
  });

  it('builds a Brief across 3 busy channels quickly', async () => {
    const [input, ms] = await timed(() => gatherBriefInput(db, uid(5), Date.now()));
    console.log(`[perf] brief gather: ${ms}ms, unread=${JSON.stringify(input.unreadChannels)}`);
    expect(ms).toBeLessThan(6000);
  });

  it('computes the neighbors leaderboard over 65 members quickly', async () => {
    const [board, ms] = await timed(() => computeLeaderboard(db, uid(30)));
    console.log(`[perf] leaderboard compute (${board.participants} members): ${ms}ms, teamTotal=${board.teamTotal}`);
    expect(board.participants).toBe(USERS);
    expect(board.neighbors.length).toBeLessThanOrEqual(5);
    expect(ms).toBeLessThan(3000);
  });
});
