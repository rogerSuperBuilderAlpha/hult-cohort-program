import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import { invalidateLeaderboard } from './leaderboard-admin';

/**
 * Quests — small, personal, always-positive nudges. Seeded on first sign-in, completed when
 * their condition is met by the person's own action, awarding XP once through the ledger.
 *
 * Personal, not competitive: a quest is your own on-ramp ("recognize a teammate", "keep a
 * commitment"), never a comparison. Completion is server-driven and idempotent — the quest
 * doc id is derived from (uid, kind), so seeding twice or completing twice is a no-op.
 */

export type QuestKind = 'recognize' | 'commit';

const STARTERS: { kind: QuestKind; title: string; rewardPts: number }[] = [
  { kind: 'recognize', title: 'Recognize a teammate who helped you', rewardPts: 5 },
  { kind: 'commit', title: 'Make and keep a commitment', rewardPts: 5 },
];

function questId(uid: string, kind: QuestKind): string {
  return `q_${uid}_${kind}`;
}

/** Seed the starter quests for a new member. Idempotent — a guarded set never clobbers a
 *  completed quest, and re-seeding is a no-op. */
export async function seedQuests(db: Firestore, uid: string): Promise<void> {
  await db.runTransaction(async (tx) => {
    const refs = STARTERS.map((s) => db.collection('quests').doc(questId(uid, s.kind)));
    const snaps = await Promise.all(refs.map((r) => tx.get(r)));
    snaps.forEach((snap, i) => {
      if (!snap.exists) {
        tx.set(refs[i], {
          profileUid: uid,
          kind: STARTERS[i].kind,
          title: STARTERS[i].title,
          rewardPts: STARTERS[i].rewardPts,
          status: 'open',
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    });
  });
}

/**
 * Complete a quest by kind for a user, awarding its reward once. Best-effort: called after a
 * qualifying action (confirming recognition, keeping a commitment). A no-op if the quest was
 * never seeded or is already done.
 */
export async function completeQuest(db: Firestore, uid: string, kind: QuestKind): Promise<boolean> {
  const ref = db.collection('quests').doc(questId(uid, kind));
  const awarded = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return false;
    const q = snap.data()!;
    if (q.status === 'done') return false;
    const reward: number = q.rewardPts ?? 0;
    tx.update(ref, { status: 'done' });
    tx.set(db.collection('xpEvents').doc(`xp_quest_${uid}_${kind}`), {
      profileUid: uid,
      source: 'quest',
      refId: questId(uid, kind),
      points: reward,
      createdAt: FieldValue.serverTimestamp(),
    });
    return true;
  });
  if (awarded) invalidateLeaderboard(); // ledger changed → drop the cached board
  return awarded;
}
