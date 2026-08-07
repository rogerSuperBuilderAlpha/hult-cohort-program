/**
 * firestore.rules — the adversary's playbook.
 *
 * firestore.test.ts asserts the promises hold for honest use. This file is the other half:
 * a signed-in member who reads the rules and tries to break each one. Every case seeds the
 * world as the server (Admin bypasses rules) and then asserts a CLIENT — helper, helped,
 * bystander, or outright non-member — is refused. If any of these go GREEN, a client has
 * found a hole: minting XP, reading a room they're not in, forging a completion, or acting
 * as a teammate. The invariant under test is that the server owns every points-bearing
 * number and every identity, and membership gates every channel read.
 */
import { beforeAll, afterAll, beforeEach, describe, it } from 'vitest';
import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { addDoc, collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import {
  ALICE,
  BOB,
  CAROL,
  as,
  channel,
  commitment,
  makeEnv,
  message,
  profile,
  recognition,
  seed,
  xpEvent,
} from './helpers';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await makeEnv();
});
afterAll(async () => {
  await env.cleanup();
});
beforeEach(async () => {
  await env.clearFirestore();
});

/* ==========================================================================
 * xpEvents — the ledger cannot be minted, inflated, edited, or scanned.
 * ========================================================================== */
describe('attack — xpEvents ledger is untouchable by clients', () => {
  it('denies minting XP for yourself', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), 'xpEvents/e1'), xpEvent(ALICE)));
  });

  it('denies minting an inflated XP row for yourself', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), 'xpEvents/e1'), xpEvent(ALICE, { points: 1_000_000 })));
  });

  it('denies minting XP for a teammate (framing / gifting)', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), 'xpEvents/e1'), xpEvent(BOB)));
  });

  it('denies addDoc minting into the ledger collection', async () => {
    await assertFails(addDoc(collection(as(env, ALICE), 'xpEvents'), xpEvent(ALICE)));
  });

  it('denies inflating the points on an existing OWN row', async () => {
    await seed(env, 'xpEvents/e1', xpEvent(ALICE, { points: 10 }));
    await assertFails(updateDoc(doc(as(env, ALICE), 'xpEvents/e1'), { points: 9999 }));
  });

  it('denies deleting your own ledger row (append-only)', async () => {
    await seed(env, 'xpEvents/e1', xpEvent(ALICE));
    await assertFails(deleteDoc(doc(as(env, ALICE), 'xpEvents/e1')));
  });

  it('denies reading a teammate\'s ledger row (no reconstructing the ranking)', async () => {
    await seed(env, 'xpEvents/e1', xpEvent(BOB));
    await assertFails(getDoc(doc(as(env, ALICE), 'xpEvents/e1')));
  });
});

/* ==========================================================================
 * server-authored feeds — pulseEvents / cohortGoals / badges / quests.
 * ========================================================================== */
describe('attack — server-authored feeds reject client writes', () => {
  it('denies faking a pulseEvent ("so-and-so was recognised")', async () => {
    await assertFails(
      setDoc(doc(as(env, ALICE), 'pulseEvents/p1'), { kind: 'recognition', text: 'forged', createdAt: 1 }),
    );
  });

  it('denies editing or deleting an existing pulseEvent', async () => {
    await seed(env, 'pulseEvents/p1', { kind: 'recognition', text: 'real', createdAt: 1 });
    await assertFails(updateDoc(doc(as(env, ALICE), 'pulseEvents/p1'), { text: 'tampered' }));
    await assertFails(deleteDoc(doc(as(env, ALICE), 'pulseEvents/p1')));
  });

  it('denies advancing a cohortGoal from the client', async () => {
    await seed(env, 'cohortGoals/prs', { metric: 'prs', current: 3, target: 10, period: 'week' });
    await assertFails(updateDoc(doc(as(env, ALICE), 'cohortGoals/prs'), { current: 10 }));
    await assertFails(setDoc(doc(as(env, ALICE), 'cohortGoals/new'), { metric: 'new', current: 0, target: 1 }));
  });

  it('denies writing a badge definition', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), 'badges/first_pr'), { code: 'first_pr', label: 'First PR' }));
  });

  it('denies awarding yourself a badge on your profile', async () => {
    await assertFails(
      setDoc(doc(as(env, ALICE), `profiles/${ALICE}/badges/first_pr`), { code: 'first_pr', earnedAt: 1 }),
    );
  });

  it('denies creating a quest (quests are awarded server-side)', async () => {
    await assertFails(
      setDoc(doc(as(env, ALICE), 'quests/q1'), { profileUid: ALICE, status: 'active', rewardPts: 50 }),
    );
  });

  it('denies bumping a quest\'s reward or flipping it complete', async () => {
    await seed(env, 'quests/q1', { profileUid: ALICE, status: 'active', progress: 0, rewardPts: 50 });
    await assertFails(updateDoc(doc(as(env, ALICE), 'quests/q1'), { rewardPts: 9999 }));
    await assertFails(updateDoc(doc(as(env, ALICE), 'quests/q1'), { status: 'complete' }));
  });

  it('lets the owner nudge their own quest progress (no reward/status change)', async () => {
    await seed(env, 'quests/q1', { profileUid: ALICE, status: 'active', progress: 0, rewardPts: 50 });
    await assertSucceeds(updateDoc(doc(as(env, ALICE), 'quests/q1'), { progress: 1 }));
  });

  it('denies reading a teammate\'s quest', async () => {
    await seed(env, 'quests/q1', { profileUid: ALICE, status: 'active', progress: 0, rewardPts: 50 });
    await assertFails(getDoc(doc(as(env, BOB), 'quests/q1')));
  });
});

/* ==========================================================================
 * recognitions — create/update/delete denied to helper, helped, bystander.
 * ========================================================================== */
describe('attack — recognitions are wholly server-owned', () => {
  it('denies the helper minting a recognition that credits themselves', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), 'recognitions/r1'), recognition(ALICE, BOB)));
  });

  it('denies the helped peer confirming directly (status flip is admin-only)', async () => {
    await seed(env, 'recognitions/r1', recognition(ALICE, BOB));
    await assertFails(updateDoc(doc(as(env, BOB), 'recognitions/r1'), { status: 'confirmed' }));
  });

  it('denies the helper flipping their own recognition to confirmed', async () => {
    await seed(env, 'recognitions/r1', recognition(ALICE, BOB));
    await assertFails(updateDoc(doc(as(env, ALICE), 'recognitions/r1'), { status: 'confirmed' }));
  });

  it('denies a bystander flipping or declining a recognition', async () => {
    await seed(env, 'recognitions/r1', recognition(ALICE, BOB));
    await assertFails(updateDoc(doc(as(env, CAROL), 'recognitions/r1'), { status: 'declined' }));
  });

  it('denies inflating the points on a recognition', async () => {
    await seed(env, 'recognitions/r1', recognition(ALICE, BOB));
    await assertFails(updateDoc(doc(as(env, ALICE), 'recognitions/r1'), { points: 500 }));
  });

  it('denies helper, helped, and bystander deleting a recognition', async () => {
    await seed(env, 'recognitions/r1', recognition(ALICE, BOB));
    await assertFails(deleteDoc(doc(as(env, ALICE), 'recognitions/r1')));
    await assertFails(deleteDoc(doc(as(env, BOB), 'recognitions/r1')));
    await assertFails(deleteDoc(doc(as(env, CAROL), 'recognitions/r1')));
  });
});

/* ==========================================================================
 * commitments — text is yours; dueAt/status/points/pm* are the server's.
 * ========================================================================== */
describe('attack — commitments freeze the completion-bearing fields', () => {
  it('denies attributing a commitment to someone else', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), 'commitments/k1'), commitment(BOB)));
  });

  it('denies writing points onto your commitment', async () => {
    await seed(env, 'commitments/k1', commitment(ALICE));
    await assertFails(updateDoc(doc(as(env, ALICE), 'commitments/k1'), { points: 50 }));
  });

  it('denies writing pmTaskUrl / pmExternalId (forging PM-backed completion)', async () => {
    await seed(env, 'commitments/k1', commitment(ALICE));
    await assertFails(updateDoc(doc(as(env, ALICE), 'commitments/k1'), { pmTaskUrl: 'https://x' }));
    await assertFails(updateDoc(doc(as(env, ALICE), 'commitments/k1'), { pmExternalId: '42' }));
  });

  it('denies flipping status to done', async () => {
    await seed(env, 'commitments/k1', commitment(ALICE));
    await assertFails(updateDoc(doc(as(env, ALICE), 'commitments/k1'), { status: 'done' }));
  });

  it('denies pushing dueAt into the future (defeating the on-time gate)', async () => {
    await seed(env, 'commitments/k1', commitment(ALICE, { dueAt: 1000 }));
    await assertFails(updateDoc(doc(as(env, ALICE), 'commitments/k1'), { dueAt: 9_999_999_999_999 }));
  });

  it('denies a non-author editing your commitment text', async () => {
    await seed(env, 'commitments/k1', commitment(ALICE));
    await assertFails(updateDoc(doc(as(env, BOB), 'commitments/k1'), { text: 'sabotage' }));
  });

  it('denies anyone deleting a commitment', async () => {
    await seed(env, 'commitments/k1', commitment(ALICE));
    await assertFails(deleteDoc(doc(as(env, ALICE), 'commitments/k1')));
  });

  it('still lets the author reword their own commitment text', async () => {
    await seed(env, 'commitments/k1', commitment(ALICE));
    await assertSucceeds(updateDoc(doc(as(env, ALICE), 'commitments/k1'), { text: 'reworded' }));
  });
});

/* ==========================================================================
 * channels — membership gates read/post/rename/join.
 * ========================================================================== */
describe('attack — channel membership isolation', () => {
  it('denies a non-member reading a private channel doc', async () => {
    await seed(env, 'channels/secret', channel(ALICE, [ALICE, BOB], { isPrivate: true }));
    await assertFails(getDoc(doc(as(env, CAROL), 'channels/secret')));
  });

  it('denies a non-member reading messages in a channel they are not in', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await seed(env, 'channels/c1/messages/m1', message(ALICE));
    await assertFails(getDoc(doc(as(env, CAROL), 'channels/c1/messages/m1')));
  });

  it('denies a non-member posting into a channel', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await assertFails(addDoc(collection(as(env, CAROL), 'channels/c1/messages'), message(CAROL)));
  });

  it('denies renaming a channel you are not a member of', async () => {
    await seed(env, 'channels/general', channel(ALICE, [ALICE], { isPrivate: false }));
    await assertFails(updateDoc(doc(as(env, BOB), 'channels/general'), { name: 'Hijacked' }));
  });

  it('denies adding another uid while self-joining a public channel', async () => {
    await seed(env, 'channels/general', channel(ALICE, [ALICE], { isPrivate: false }));
    await assertFails(updateDoc(doc(as(env, BOB), 'channels/general'), { memberUids: [ALICE, BOB, CAROL] }));
  });

  it('denies inflating membership with duplicate uids while joining', async () => {
    await seed(env, 'channels/general', channel(ALICE, [ALICE], { isPrivate: false }));
    await assertFails(updateDoc(doc(as(env, BOB), 'channels/general'), { memberUids: [ALICE, BOB, BOB] }));
  });

  it('denies self-joining a PRIVATE channel', async () => {
    await seed(env, 'channels/secret', channel(ALICE, [ALICE], { isPrivate: true }));
    await assertFails(updateDoc(doc(as(env, BOB), 'channels/secret'), { memberUids: [ALICE, BOB] }));
  });

  it('denies flipping a channel to public while "joining" it', async () => {
    await seed(env, 'channels/secret', channel(ALICE, [ALICE], { isPrivate: true }));
    await assertFails(
      updateDoc(doc(as(env, BOB), 'channels/secret'), { memberUids: [ALICE, BOB], isPrivate: false }),
    );
  });

  it('denies creating a channel with a forged creatorUid', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), 'channels/c9'), channel(BOB, [ALICE, BOB])));
  });

  it('denies creating a channel that omits yourself', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), 'channels/c9'), channel(ALICE, [BOB, CAROL])));
  });

  it('denies a member deleting a channel', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await assertFails(deleteDoc(doc(as(env, ALICE), 'channels/c1')));
  });

  it('lets a non-member self-join a PUBLIC channel (the one allowed path)', async () => {
    await seed(env, 'channels/general', channel(ALICE, [ALICE], { isPrivate: false }));
    await assertSucceeds(updateDoc(doc(as(env, BOB), 'channels/general'), { memberUids: [ALICE, BOB] }));
  });
});

/* ==========================================================================
 * messages — authorship, body bound, edit scope, reactions.
 * ========================================================================== */
describe('attack — messages authorship and reaction scope', () => {
  it('denies posting as someone else (impersonation)', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await assertFails(addDoc(collection(as(env, BOB), 'channels/c1/messages'), message(ALICE)));
  });

  it('denies an over-long body (> 4000)', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await assertFails(
      addDoc(collection(as(env, BOB), 'channels/c1/messages'), message(BOB, { body: 'x'.repeat(4001) })),
    );
  });

  it('denies an empty body', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await assertFails(addDoc(collection(as(env, BOB), 'channels/c1/messages'), message(BOB, { body: '' })));
  });

  it('denies editing someone else\'s message body', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await seed(env, 'channels/c1/messages/m1', message(ALICE));
    await assertFails(updateDoc(doc(as(env, BOB), 'channels/c1/messages/m1'), { body: 'tampered' }));
  });

  it('denies rewriting authorUid on an existing message', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await seed(env, 'channels/c1/messages/m1', message(BOB));
    await assertFails(updateDoc(doc(as(env, BOB), 'channels/c1/messages/m1'), { authorUid: ALICE }));
  });

  it('denies deleting someone else\'s message', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await seed(env, 'channels/c1/messages/m1', message(ALICE));
    await assertFails(deleteDoc(doc(as(env, BOB), 'channels/c1/messages/m1')));
  });

  it('denies reacting AS someone else (writing a different uid key)', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await seed(env, 'channels/c1/messages/m1', message(ALICE, { reactions: {} }));
    await assertFails(updateDoc(doc(as(env, BOB), 'channels/c1/messages/m1'), { 'reactions.uid_alice': '👍' }));
  });

  it('denies smuggling a body edit alongside your own reaction', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await seed(env, 'channels/c1/messages/m1', message(ALICE, { reactions: {} }));
    await assertFails(
      updateDoc(doc(as(env, BOB), 'channels/c1/messages/m1'), { 'reactions.uid_bob': '👍', body: 'hijacked' }),
    );
  });

  it('denies a non-member reacting to a message', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await seed(env, 'channels/c1/messages/m1', message(ALICE, { reactions: {} }));
    await assertFails(updateDoc(doc(as(env, CAROL), 'channels/c1/messages/m1'), { 'reactions.uid_carol': '👍' }));
  });

  it('lets a member post as themselves and toggle their own reaction (allowed paths)', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await seed(env, 'channels/c1/messages/m1', message(ALICE, { reactions: {} }));
    await assertSucceeds(addDoc(collection(as(env, BOB), 'channels/c1/messages'), message(BOB)));
    await assertSucceeds(updateDoc(doc(as(env, BOB), 'channels/c1/messages/m1'), { 'reactions.uid_bob': '👍' }));
  });
});

/* ==========================================================================
 * reads/{uid} — personal unread bookmark, yours alone.
 * ========================================================================== */
describe('attack — reads bookmarks are personal-only', () => {
  it('denies reading another member\'s read bookmark', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await seed(env, `channels/c1/reads/${ALICE}`, { lastReadAt: 5 });
    await assertFails(getDoc(doc(as(env, BOB), `channels/c1/reads/${ALICE}`)));
  });

  it('denies writing another member\'s read bookmark', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await assertFails(setDoc(doc(as(env, BOB), `channels/c1/reads/${ALICE}`), { lastReadAt: 5 }));
  });

  it('lets you write your OWN read bookmark in a channel you are in', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await assertSucceeds(setDoc(doc(as(env, BOB), `channels/c1/reads/${BOB}`), { lastReadAt: 5 }));
  });

  it('denies writing your own bookmark in a channel you are NOT in', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await assertFails(setDoc(doc(as(env, CAROL), `channels/c1/reads/${CAROL}`), { lastReadAt: 5 }));
  });
});

/* ==========================================================================
 * assistant — private conversation + memory, server-written only.
 * ========================================================================== */
describe('attack — assistant thread and memory', () => {
  it('denies reading a teammate\'s assistant thread', async () => {
    await seed(env, `assistantThreads/${ALICE}/messages/m1`, { role: 'assistant', content: 'private', createdAt: 1 });
    await assertFails(getDoc(doc(as(env, BOB), `assistantThreads/${ALICE}/messages/m1`)));
  });

  it('denies reading a teammate\'s assistant memory', async () => {
    await seed(env, `assistantMemory/${ALICE}`, { notes: ['secret'] });
    await assertFails(getDoc(doc(as(env, BOB), `assistantMemory/${ALICE}`)));
  });

  it('denies forging a reply into your OWN thread (server-only)', async () => {
    await assertFails(
      setDoc(doc(as(env, ALICE), `assistantThreads/${ALICE}/messages/m1`), { role: 'assistant', content: 'forged', createdAt: 1 }),
    );
  });

  it('denies seeding your OWN assistant memory (server-only)', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), `assistantMemory/${ALICE}`), { notes: ['injected'] }));
  });
});

/* ==========================================================================
 * profiles — identity freeze, displayName still editable.
 * ========================================================================== */
describe('attack — profile identity freeze', () => {
  it('allows backfilling githubLogin/handle from null (first sign-in)', async () => {
    await seed(env, `profiles/${ALICE}`, profile(ALICE, { githubLogin: null, handle: null }));
    await assertSucceeds(
      updateDoc(doc(as(env, ALICE), `profiles/${ALICE}`), { githubLogin: 'alice-gh', handle: 'alice-gh' }),
    );
  });

  it('denies repointing an already-set githubLogin to a teammate\'s login', async () => {
    await seed(env, `profiles/${ALICE}`, profile(ALICE, { githubLogin: 'alice-gh', handle: 'alice-gh' }));
    await assertFails(updateDoc(doc(as(env, ALICE), `profiles/${ALICE}`), { githubLogin: 'victim-gh' }));
  });

  it('denies clearing an already-set handle back to null', async () => {
    await seed(env, `profiles/${ALICE}`, profile(ALICE, { githubLogin: 'alice-gh', handle: 'alice-gh' }));
    await assertFails(updateDoc(doc(as(env, ALICE), `profiles/${ALICE}`), { handle: null }));
  });

  it('denies editing a teammate\'s profile', async () => {
    await seed(env, `profiles/${BOB}`, profile(BOB));
    await assertFails(updateDoc(doc(as(env, ALICE), `profiles/${BOB}`), { displayName: 'Hijacked' }));
  });

  it('denies deleting a profile (messages reference authors by uid)', async () => {
    await seed(env, `profiles/${ALICE}`, profile(ALICE));
    await assertFails(deleteDoc(doc(as(env, ALICE), `profiles/${ALICE}`)));
  });

  it('still lets a member edit their own displayName (identity untouched)', async () => {
    await seed(env, `profiles/${ALICE}`, profile(ALICE, { githubLogin: 'alice-gh', handle: 'alice-gh' }));
    await assertSucceeds(updateDoc(doc(as(env, ALICE), `profiles/${ALICE}`), { displayName: 'Ada L.' }));
  });
});

/* ==========================================================================
 * cohortContext + agentTasks — deny-all to every client.
 * ========================================================================== */
describe('attack — cross-app bus is deny-all for clients', () => {
  it('denies reading a cross-app context doc', async () => {
    await seed(env, 'cohortContext/nikjain15', { handle: 'nikjain15' });
    await assertFails(getDoc(doc(as(env, ALICE), 'cohortContext/nikjain15')));
  });

  it('denies reading a nested cross-app memory doc', async () => {
    await seed(env, 'cohortContext/nikjain15/memory/n1', { app: 'rally', text: 'private', createdAt: 1 });
    await assertFails(getDoc(doc(as(env, ALICE), 'cohortContext/nikjain15/memory/n1')));
  });

  it('denies writing into the cross-app bus', async () => {
    await assertFails(
      setDoc(doc(as(env, ALICE), 'cohortContext/nikjain15/memory/x'), { app: 'x', text: 'forged', createdAt: 1 }),
    );
  });

  it('denies reading an agent task', async () => {
    await seed(env, 'agentTasks/t1', { fromApp: 'pulse', toApp: 'rally', handle: 'nikjain15', status: 'pending' });
    await assertFails(getDoc(doc(as(env, ALICE), 'agentTasks/t1')));
  });

  it('denies forging an agent task for someone else\'s agent', async () => {
    await assertFails(
      setDoc(doc(as(env, ALICE), 'agentTasks/t2'), { fromApp: 'x', toApp: 'rally', handle: 'nikjain15', status: 'pending' }),
    );
  });
});
