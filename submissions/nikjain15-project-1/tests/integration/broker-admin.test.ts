/**
 * The broker job against a real Firestore — the whole loop the credential will one day
 * run in prod, driven on the emulator where the Admin SDK needs none.
 *
 * What must hold, per LAYER-2-3-DESIGN.md:
 * - a visible struggle + a banked answer → ONE introduction, at a derived address;
 * - re-runs converge (create-if-absent) and a dismissal is never resurrected;
 * - the explicit "I'm stuck" opt-in signals regardless of card age;
 * - intro_made publishes ONLY after help visibly lands (sent + the stuck person marked
 *   themselves unstuck by the helper's recipe), once, with both names verified;
 * - a helper who opted out is never matched.
 *
 * Fixtures are unique per test (shared emulator dataset, never assumed empty) and every
 * assertion is scoped to this test's own ids.
 */
import { Timestamp } from 'firebase-admin/firestore';
import { beforeAll, describe, expect, it } from 'vitest';
import { adminDb, AGING_WIP_HOURS, introDocId, publishIntroMade, runBrokerJob } from '@/lib/broker-admin';
import type { Firestore } from 'firebase-admin/firestore';

const run = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
let db: Firestore;

beforeAll(() => {
  const got = adminDb();
  if (!got) throw new Error('admin db unavailable — FIRESTORE_EMULATOR_HOST not set?');
  db = got;
});

/** Two members with per-test-unique uids and problem text. */
async function seedPair(tag: string) {
  const stuckUid = `bk_stuck_${tag}_${run}`;
  const helperUid = `bk_helper_${tag}_${run}`;
  const problem = `Broker fixture ${tag} ${run}`;

  await db.collection('members').doc(stuckUid).set({
    uid: stuckUid, email: `${stuckUid}@emulator.test`, handle: null,
    displayName: `Stuck ${tag}`, photoURL: null, createdAt: Timestamp.now(),
  });
  await db.collection('members').doc(helperUid).set({
    uid: helperUid, email: `${helperUid}@emulator.test`, handle: null,
    displayName: `Helper ${tag}`, photoURL: null, createdAt: Timestamp.now(),
  });
  return { stuckUid, helperUid, problem };
}

/** An aging in_progress card assigned to the stuck member. */
async function seedAgingTask(uid: string, problem: string, tag: string) {
  await db.collection('tasks').doc(`bk_task_${tag}_${run}`).set({
    projectId: 'bk_project', title: problem, description: '', status: 'in_progress',
    assigneeUid: uid, creatorUid: uid, dueDate: null,
    createdAt: Timestamp.fromMillis(Date.now() - (AGING_WIP_HOURS + 2) * 3_600_000),
    completedAt: null, source: 'manual', evidence: null, branch: null,
  });
}

/** The helper's banked answer to exactly that problem. */
async function seedRecipe(authorUid: string, problem: string, tag: string): Promise<string> {
  const id = `bk_recipe_${tag}_${run}`;
  await db.collection('recipes').doc(id).set({
    problem, body: '1. The fix.', authorUid, taskId: null, turns: 3,
    unstuckUids: [], createdAt: Timestamp.now(),
  });
  return id;
}

describe('the broker job — match, upsert, converge', () => {
  it('drafts one introduction for a visible struggle, and re-runs add nothing', async () => {
    const { stuckUid, helperUid, problem } = await seedPair('a');
    await seedAgingTask(stuckUid, problem, 'a');
    const recipeId = await seedRecipe(helperUid, problem, 'a');

    await runBrokerJob(db);

    const id = introDocId({ stuckUid, helperUid, problem });
    const intro = await db.collection('introductions').doc(id).get();
    expect(intro.exists).toBe(true);
    expect(intro.data()).toMatchObject({
      stuckUid, helperUid, recipeId, problem, state: 'suggested',
    });

    // Idempotent: the second tick addresses the same doc and leaves it alone.
    await runBrokerJob(db);
    const mine = await db.collection('introductions').where('stuckUid', '==', stuckUid).get();
    expect(mine.size).toBe(1);
  });

  it('never resurrects a dismissal — "not now" outlives every future run', async () => {
    const { stuckUid, helperUid, problem } = await seedPair('b');
    await seedAgingTask(stuckUid, problem, 'b');
    await seedRecipe(helperUid, problem, 'b');

    await runBrokerJob(db);
    const id = introDocId({ stuckUid, helperUid, problem });
    await db.collection('introductions').doc(id).update({ state: 'dismissed' });

    await runBrokerJob(db);
    expect((await db.collection('introductions').doc(id).get()).data()?.state).toBe('dismissed');
  });

  it('the explicit "I\'m stuck" opt-in signals regardless of the card\'s age or status', async () => {
    const { stuckUid, helperUid, problem } = await seedPair('c');
    await seedRecipe(helperUid, problem, 'c');
    await db.collection('tasks').doc(`bk_task_c_${run}`).set({
      projectId: 'bk_project', title: problem, description: '', status: 'todo',
      assigneeUid: stuckUid, creatorUid: stuckUid, dueDate: null,
      createdAt: Timestamp.now(), // brand new — only the opt-in can signal
      completedAt: null, source: 'manual', evidence: null, branch: null,
      stuckSince: Timestamp.now(),
    });

    await runBrokerJob(db);
    const intro = await db.collection('introductions')
      .doc(introDocId({ stuckUid, helperUid, problem })).get();
    expect(intro.exists).toBe(true);
  });

  it('a helper who opted out is never matched', async () => {
    const { stuckUid, helperUid, problem } = await seedPair('d');
    await seedAgingTask(stuckUid, problem, 'd');
    await seedRecipe(helperUid, problem, 'd');
    await db.collection('githubLinks').doc(helperUid).set({ brokerOptOut: true }, { merge: true });

    await runBrokerJob(db);
    const mine = await db.collection('introductions').where('stuckUid', '==', stuckUid).get();
    expect(mine.size).toBe(0);
  });
});

describe('intro_made — only when help visibly lands, once, with verified names', () => {
  it('publishes the resolved thank-you exactly once', async () => {
    const { stuckUid, helperUid, problem } = await seedPair('e');
    await seedAgingTask(stuckUid, problem, 'e');
    const recipeId = await seedRecipe(helperUid, problem, 'e');

    await runBrokerJob(db);
    const introId = introDocId({ stuckUid, helperUid, problem });

    // The helper sends; nothing publishes yet — sending is intent, not landed help.
    await db.collection('introductions').doc(introId).update({ state: 'sent' });
    await publishIntroMade(db);
    expect((await db.collection('pulse').doc(`intro_${introId}`).get()).exists).toBe(false);

    // The stuck person marks themselves unstuck — a PRIVATE credit to the author. This alone must
    // NOT publish a public post naming them ("never punish the quiet"): consent is separate.
    await db.collection('recipes').doc(recipeId).update({ unstuckUids: [stuckUid] });
    await publishIntroMade(db);
    expect((await db.collection('pulse').doc(`intro_${introId}`).get()).exists).toBe(false);

    // Only when the stuck person deliberately opts into a public thank-you does it publish.
    await db.collection('recipes').doc(recipeId).update({ publicThanksUids: [stuckUid] });
    await publishIntroMade(db);

    const event = await db.collection('pulse').doc(`intro_${introId}`).get();
    expect(event.exists).toBe(true);
    expect(event.data()).toMatchObject({
      kind: 'intro_made',
      actorUid: helperUid,
      actorName: 'Helper e',
      otherUid: stuckUid,
      otherName: 'Stuck e',
      subject: problem,
      narrative: null,
    });

    // Convergent: a second tick does not thank twice.
    await publishIntroMade(db);
    const again = await db.collection('pulse').where('otherUid', '==', stuckUid).get();
    expect(again.size).toBe(1);
  });

  it('a dismissed or merely-suggested intro never produces a public word', async () => {
    const { stuckUid, helperUid, problem } = await seedPair('f');
    await seedAgingTask(stuckUid, problem, 'f');
    const recipeId = await seedRecipe(helperUid, problem, 'f');

    await runBrokerJob(db);
    // Even with the recipe marked helpful AND public thanks opted in, a suggested intro publishes
    // nothing — the helper never acted, so there is no story to tell.
    await db.collection('recipes').doc(recipeId).update({ unstuckUids: [stuckUid], publicThanksUids: [stuckUid] });
    await publishIntroMade(db);
    const events = await db.collection('pulse').where('otherUid', '==', stuckUid).get();
    expect(events.size).toBe(0);
  });

  it('unstuck WITHOUT public-thanks consent never names the stuck person, even on a sent intro', async () => {
    const { stuckUid, helperUid, problem } = await seedPair('g');
    await seedAgingTask(stuckUid, problem, 'g');
    const recipeId = await seedRecipe(helperUid, problem, 'g');
    await runBrokerJob(db);
    const introId = introDocId({ stuckUid, helperUid, problem });
    await db.collection('introductions').doc(introId).update({ state: 'sent' });
    // Helped, sent — but the stuck person never opted into a public thank-you.
    await db.collection('recipes').doc(recipeId).update({ unstuckUids: [stuckUid] });
    await publishIntroMade(db);
    const events = await db.collection('pulse').where('otherUid', '==', stuckUid).get();
    expect(events.size).toBe(0); // silence is the default — the quiet are never outed
  });
});
