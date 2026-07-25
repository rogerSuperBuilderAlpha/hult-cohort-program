/**
 * firestore.rules — extended attack surface (companion to firestore.test.ts).
 *
 * More adversarial cases across the self-only surfaces (boardViews, askThreads), the identity
 * freeze, sensed-card forgery, the stuck flag, and the recipe public-thanks consent. Each name is
 * a promise; a red one means the product is lying to someone.
 */
import { beforeAll, afterAll, beforeEach, describe, it } from 'vitest';
import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { addDoc, collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ALICE, BOB, as, asAnon, makeEnv, member, recipe, seed } from './helpers';

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

describe('boardViews — a per-user private lens, nobody else’s business', () => {
  const mine = `boardViews/${ALICE}`;
  const theirs = `boardViews/${BOB}`;

  it('lets a member create and read their OWN board view', async () => {
    await assertSucceeds(setDoc(doc(as(env, ALICE), mine), { preset: 'software', columns: [], placement: {} }));
    await assertSucceeds(getDoc(doc(as(env, ALICE), mine)));
  });

  it('denies reading ANOTHER member’s board view (which lanes you use is private)', async () => {
    await seed(env, theirs, { preset: 'software', columns: [], placement: {} });
    await assertFails(getDoc(doc(as(env, ALICE), theirs)));
  });

  it('denies writing into another member’s board view', async () => {
    await seed(env, theirs, { preset: 'classic', columns: [], placement: {} });
    await assertFails(updateDoc(doc(as(env, ALICE), theirs), { placement: { t1: 'x' } }));
  });

  it('denies an anonymous visitor reading a board view', async () => {
    await seed(env, mine, { preset: 'classic', columns: [], placement: {} });
    await assertFails(getDoc(doc(asAnon(env), mine)));
  });
});

describe('askThreads — your agent conversation is yours alone', () => {
  it('lets a member write and read a turn in their OWN thread', async () => {
    const path = `askThreads/${ALICE}/turns/t1`;
    await assertSucceeds(setDoc(doc(as(env, ALICE), path), { role: 'you', text: 'hi', createdAt: null }));
    await assertSucceeds(getDoc(doc(as(env, ALICE), path)));
  });

  it('denies reading ANOTHER member’s agent conversation', async () => {
    const path = `askThreads/${BOB}/turns/t1`;
    await seed(env, path, { role: 'you', text: 'secret', createdAt: null });
    await assertFails(getDoc(doc(as(env, ALICE), path)));
  });

  it('denies writing into another member’s thread', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), `askThreads/${BOB}/turns/x`), { role: 'you', text: 'x', createdAt: null }));
  });
});

describe('members — the identity freeze (bus key can’t be stolen)', () => {
  it('lets the null→login backfill happen once', async () => {
    await seed(env, `members/${ALICE}`, member(ALICE, { handle: null }));
    await assertSucceeds(updateDoc(doc(as(env, ALICE), `members/${ALICE}`), { handle: 'gh_alice' }));
  });

  it('denies changing an established handle to another value', async () => {
    await seed(env, `members/${ALICE}`, member(ALICE, { handle: 'gh_alice' }));
    await assertFails(updateDoc(doc(as(env, ALICE), `members/${ALICE}`), { handle: 'gh_bob' }));
  });

  it('denies clearing an established handle back to null', async () => {
    await seed(env, `members/${ALICE}`, member(ALICE, { handle: 'gh_alice' }));
    await assertFails(updateDoc(doc(as(env, ALICE), `members/${ALICE}`), { handle: null }));
  });

  it('still lets a member edit a non-identity field (photoURL)', async () => {
    await seed(env, `members/${ALICE}`, member(ALICE, { handle: 'gh_alice' }));
    await assertSucceeds(updateDoc(doc(as(env, ALICE), `members/${ALICE}`), { photoURL: 'p' }));
  });
});

describe('recipes — public-thanks consent is self-only', () => {
  const path = 'recipes/r1';

  it('lets a helped member opt only THEMSELVES into a public thank-you', async () => {
    await seed(env, path, recipe(BOB, { unstuckUids: [ALICE], publicThanksUids: [] }));
    await assertSucceeds(updateDoc(doc(as(env, ALICE), path), { publicThanksUids: [ALICE] }));
  });

  it('denies consenting on someone else’s behalf', async () => {
    await seed(env, path, recipe(BOB, { publicThanksUids: [] }));
    await assertFails(updateDoc(doc(as(env, ALICE), path), { publicThanksUids: ['uid_carol'] }));
  });

  it('denies the author staging a public thank-you to themselves', async () => {
    await seed(env, path, recipe(ALICE, { publicThanksUids: [] }));
    await assertFails(updateDoc(doc(as(env, ALICE), path), { publicThanksUids: [ALICE] }));
  });

  it('denies bundling a rank change with a consent change in one write', async () => {
    await seed(env, path, recipe(BOB, { unstuckUids: [], publicThanksUids: [] }));
    await assertFails(
      updateDoc(doc(as(env, ALICE), path), { unstuckUids: [ALICE], publicThanksUids: [ALICE] })
    );
  });
});

describe('pulse feed — nobody deletes or forges someone else’s row', () => {
  it('denies an anonymous visitor writing a feed event', async () => {
    await assertFails(
      addDoc(collection(asAnon(env), 'pulse'), { kind: 'task_shipped', actorUid: ALICE, actorName: 'x', kudos: [] })
    );
  });

  it('denies A deleting B’s feed event', async () => {
    await seed(env, 'pulse/e1', { kind: 'task_shipped', actorUid: BOB, actorName: 'Bob', kudos: [] });
    await assertFails(deleteDoc(doc(as(env, ALICE), 'pulse/e1')));
  });
});
