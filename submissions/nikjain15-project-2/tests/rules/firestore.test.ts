/**
 * firestore.rules — Rally's product promises, asserted.
 *
 * Read the test names, not the code: each states a promise Rally makes. If one goes red,
 * the product is lying. The two load-bearing groups are membership isolation (a channel you
 * are not in must be unreadable) and anti-gaming (a client can never mint XP or inflate a
 * points-bearing count).
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
 * membership isolation — a private room is private
 * ========================================================================== */
describe('channels — read only if you are a member', () => {
  it('lets a member read the channel they belong to', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await assertSucceeds(getDoc(doc(as(env, ALICE), 'channels/c1')));
  });

  it('denies a non-member reading a PRIVATE channel doc', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB], { isPrivate: true }));
    await assertFails(getDoc(doc(as(env, CAROL), 'channels/c1')));
  });

  it('lets any member read a PUBLIC channel doc (discover + join), but not its messages', async () => {
    await seed(env, 'channels/general', channel(ALICE, [ALICE], { isPrivate: false }));
    await seed(env, 'channels/general/messages/m1', message(ALICE));
    await assertSucceeds(getDoc(doc(as(env, CAROL), 'channels/general')));
    // …the doc is discoverable, but the conversation is members-only.
    await assertFails(getDoc(doc(as(env, CAROL), 'channels/general/messages/m1')));
  });

  it('lets a member read messages in their channel', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await seed(env, 'channels/c1/messages/m1', message(ALICE));
    await assertSucceeds(getDoc(doc(as(env, BOB), 'channels/c1/messages/m1')));
  });

  it('denies a non-member reading messages in a channel they are not in', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await seed(env, 'channels/c1/messages/m1', message(ALICE));
    await assertFails(getDoc(doc(as(env, CAROL), 'channels/c1/messages/m1')));
  });

  it('denies creating a channel that reads someone else in without yourself', async () => {
    await assertFails(
      setDoc(doc(as(env, ALICE), 'channels/c9'), channel(ALICE, [BOB, CAROL])),
    );
  });

  it('denies creating a channel whose creatorUid is not you', async () => {
    await assertFails(
      setDoc(doc(as(env, ALICE), 'channels/c9'), channel(BOB, [ALICE, BOB])),
    );
  });

  it('lets a non-member self-join a PUBLIC channel', async () => {
    await seed(env, 'channels/general', channel(ALICE, [ALICE], { isPrivate: false }));
    await assertSucceeds(
      updateDoc(doc(as(env, BOB), 'channels/general'), { memberUids: [ALICE, BOB] }),
    );
  });

  it('denies joining yourself into a PRIVATE channel', async () => {
    await seed(env, 'channels/secret', channel(ALICE, [ALICE], { isPrivate: true }));
    await assertFails(
      updateDoc(doc(as(env, BOB), 'channels/secret'), { memberUids: [ALICE, BOB] }),
    );
  });

  it('denies adding SOMEONE ELSE while joining a public channel', async () => {
    await seed(env, 'channels/general', channel(ALICE, [ALICE], { isPrivate: false }));
    await assertFails(
      updateDoc(doc(as(env, BOB), 'channels/general'), { memberUids: [ALICE, BOB, CAROL] }),
    );
  });

  it('denies renaming a public channel you are not a member of (join branch is memberUids-only)', async () => {
    await seed(env, 'channels/general', channel(ALICE, [ALICE], { isPrivate: false }));
    await assertFails(
      updateDoc(doc(as(env, BOB), 'channels/general'), { memberUids: [ALICE, BOB], name: 'Hijacked' }),
    );
  });

  it('denies inflating membership with duplicate uids (count = array length)', async () => {
    await seed(env, 'channels/general', channel(ALICE, [ALICE], { isPrivate: false }));
    await assertFails(
      updateDoc(doc(as(env, BOB), 'channels/general'), { memberUids: [ALICE, BOB, BOB, BOB] }),
    );
  });
});

describe('DMs — a private room for exactly two', () => {
  const dmId = 'dm_uid_alice_uid_bob';
  const seedDm = () =>
    seed(env, `channels/${dmId}`, channel(ALICE, [ALICE, BOB], { kind: 'dm', isPrivate: true, slug: dmId }));

  it('lets either participant read the DM', async () => {
    await seedDm();
    await assertSucceeds(getDoc(doc(as(env, ALICE), `channels/${dmId}`)));
    await assertSucceeds(getDoc(doc(as(env, BOB), `channels/${dmId}`)));
  });

  it('denies a third party reading the DM or its messages', async () => {
    await seedDm();
    await seed(env, `channels/${dmId}/messages/m1`, message(ALICE));
    await assertFails(getDoc(doc(as(env, CAROL), `channels/${dmId}`)));
    await assertFails(getDoc(doc(as(env, CAROL), `channels/${dmId}/messages/m1`)));
  });

  it('denies a third party self-joining a DM (private, not joinable)', async () => {
    await seedDm();
    await assertFails(
      updateDoc(doc(as(env, CAROL), `channels/${dmId}`), { memberUids: [ALICE, BOB, CAROL] }),
    );
  });

  it('lets a participant post, and a non-participant cannot', async () => {
    await seedDm();
    await assertSucceeds(addDoc(collection(as(env, BOB), `channels/${dmId}/messages`), message(BOB)));
    await assertFails(addDoc(collection(as(env, CAROL), `channels/${dmId}/messages`), message(CAROL)));
  });
});

/* ==========================================================================
 * authorship — you speak only as yourself, only where you belong
 * ========================================================================== */
describe('messages — posted as yourself, into a channel you are in', () => {
  it('lets a member post as themselves', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await assertSucceeds(
      addDoc(collection(as(env, BOB), 'channels/c1/messages'), message(BOB)),
    );
  });

  it('denies posting as someone else (impersonation)', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await assertFails(
      addDoc(collection(as(env, BOB), 'channels/c1/messages'), message(ALICE)),
    );
  });

  it('denies posting into a channel you are not a member of', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await assertFails(
      addDoc(collection(as(env, CAROL), 'channels/c1/messages'), message(CAROL)),
    );
  });

  it('denies an empty message body', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await assertFails(
      addDoc(collection(as(env, BOB), 'channels/c1/messages'), message(BOB, { body: '' })),
    );
  });

  it('denies an over-long message body (read-cost / abuse guard)', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await assertFails(
      addDoc(collection(as(env, BOB), 'channels/c1/messages'), message(BOB, { body: 'x'.repeat(4001) })),
    );
  });

  it('denies rewriting the author of an existing message', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await seed(env, 'channels/c1/messages/m1', message(BOB));
    await assertFails(
      updateDoc(doc(as(env, BOB), 'channels/c1/messages/m1'), { authorUid: ALICE }),
    );
  });

  it('lets an author edit their own message body', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await seed(env, 'channels/c1/messages/m1', message(BOB));
    await assertSucceeds(
      updateDoc(doc(as(env, BOB), 'channels/c1/messages/m1'), { body: 'edited', editedAt: new Date() }),
    );
  });
});

describe('reactions — one per person, self-scoped, uninflatable', () => {
  const setup = () =>
    Promise.all([
      seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB])),
      seed(env, 'channels/c1/messages/m1', message(ALICE, { reactions: {} })),
    ]);

  it('lets a member add their OWN reaction', async () => {
    await setup();
    await assertSucceeds(
      updateDoc(doc(as(env, BOB), 'channels/c1/messages/m1'), { 'reactions.uid_bob': '👍' }),
    );
  });

  it('denies reacting AS someone else (writing a different uid key)', async () => {
    await setup();
    await assertFails(
      updateDoc(doc(as(env, BOB), 'channels/c1/messages/m1'), { 'reactions.uid_alice': '👍' }),
    );
  });

  it('denies clearing someone else\'s reaction', async () => {
    await seed(env, 'channels/c1', channel(ALICE, [ALICE, BOB]));
    await seed(env, 'channels/c1/messages/m1', message(ALICE, { reactions: { uid_alice: '🎉' } }));
    await assertFails(
      updateDoc(doc(as(env, BOB), 'channels/c1/messages/m1'), { 'reactions.uid_alice': '💀' }),
    );
  });

  it('denies smuggling a body edit in with your reaction', async () => {
    await setup();
    await assertFails(
      updateDoc(doc(as(env, BOB), 'channels/c1/messages/m1'), { 'reactions.uid_bob': '👍', body: 'hijacked' }),
    );
  });

  it('denies a NON-member reacting', async () => {
    await setup();
    await assertFails(
      updateDoc(doc(as(env, CAROL), 'channels/c1/messages/m1'), { 'reactions.uid_carol': '👍' }),
    );
  });
});

/* ==========================================================================
 * anti-gaming — XP cannot be minted or inflated by a client. LOAD-BEARING.
 * ========================================================================== */
describe('profiles — the identity key (githubLogin/handle) is write-once', () => {
  // The cross-app bus keys on the GitHub handle; a repointable handle lets a member act as a
  // teammate across every app. Backfill-from-null is allowed (first sign-in); repointing is denied.
  it('lets a member backfill githubLogin/handle from null (first sign-in learns the login)', async () => {
    await seed(env, `profiles/${ALICE}`, profile(ALICE, { githubLogin: null, handle: null }));
    await assertSucceeds(
      updateDoc(doc(as(env, ALICE), `profiles/${ALICE}`), { githubLogin: 'alice-gh', handle: 'alice-gh' }),
    );
  });

  it('denies repointing an already-set githubLogin to a teammate\'s login', async () => {
    await seed(env, `profiles/${ALICE}`, profile(ALICE, { githubLogin: 'alice-gh', handle: 'alice-gh' }));
    await assertFails(
      updateDoc(doc(as(env, ALICE), `profiles/${ALICE}`), { githubLogin: 'victim-gh' }),
    );
    await assertFails(
      updateDoc(doc(as(env, ALICE), `profiles/${ALICE}`), { handle: 'victim-gh' }),
    );
  });

  it('denies clearing an already-set identity key back to null', async () => {
    await seed(env, `profiles/${ALICE}`, profile(ALICE, { githubLogin: 'alice-gh', handle: 'alice-gh' }));
    await assertFails(updateDoc(doc(as(env, ALICE), `profiles/${ALICE}`), { githubLogin: null }));
  });

  it('still lets a member edit their displayName (identity untouched)', async () => {
    await seed(env, `profiles/${ALICE}`, profile(ALICE, { githubLogin: 'alice-gh', handle: 'alice-gh' }));
    await assertSucceeds(
      updateDoc(doc(as(env, ALICE), `profiles/${ALICE}`), { displayName: 'Ada L.' }),
    );
  });
});

describe('xpEvents — the append-only ledger is server-only', () => {
  it('denies a client creating an xpEvent (minting XP)', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), 'xpEvents/e1'), xpEvent(ALICE)));
  });

  it('denies a client creating an xpEvent even for someone else', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), 'xpEvents/e1'), xpEvent(BOB, { points: 9999 })));
  });

  it('lets a member read their OWN ledger row (their XP counter)', async () => {
    await seed(env, 'xpEvents/e1', xpEvent(ALICE));
    await assertSucceeds(getDoc(doc(as(env, ALICE), 'xpEvents/e1')));
  });

  it('denies reading ANOTHER member\'s ledger row (no reconstructing who\'s behind)', async () => {
    // The full ranking is server-only. If BOB could read ALICE's rows he could sum every uid and
    // rebuild the public scoreboard "be kind to the quiet" forbids.
    await seed(env, 'xpEvents/e1', xpEvent(ALICE));
    await assertFails(getDoc(doc(as(env, BOB), 'xpEvents/e1')));
  });

  it('denies editing or deleting a ledger row', async () => {
    await seed(env, 'xpEvents/e1', xpEvent(ALICE));
    await assertFails(updateDoc(doc(as(env, ALICE), 'xpEvents/e1'), { points: 9999 }));
    await assertFails(deleteDoc(doc(as(env, ALICE), 'xpEvents/e1')));
  });
});

describe('recognitions — points only on the helped peer\'s confirm', () => {
  it('denies a client creating a recognition (server suggests them)', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), 'recognitions/r1'), recognition(ALICE, BOB)));
  });

  it('denies the HELPED peer confirming directly via the SDK (confirm is server-only)', async () => {
    // Confirm must go through the auth-gated route so status + the XP ledger write happen in
    // ONE transaction. A direct client flip would be "confirmed but unawarded".
    await seed(env, 'recognitions/r1', recognition(ALICE, BOB));
    await assertFails(
      updateDoc(doc(as(env, BOB), 'recognitions/r1'), { status: 'confirmed' }),
    );
  });

  it('denies the HELPER confirming their own recognition directly', async () => {
    await seed(env, 'recognitions/r1', recognition(ALICE, BOB));
    await assertFails(
      updateDoc(doc(as(env, ALICE), 'recognitions/r1'), { status: 'confirmed' }),
    );
  });

  it('denies a bystander touching a recognition', async () => {
    await seed(env, 'recognitions/r1', recognition(ALICE, BOB));
    await assertFails(
      updateDoc(doc(as(env, CAROL), 'recognitions/r1'), { status: 'confirmed' }),
    );
  });

  it('denies deleting a recognition', async () => {
    await seed(env, 'recognitions/r1', recognition(ALICE, BOB));
    await assertFails(deleteDoc(doc(as(env, BOB), 'recognitions/r1')));
  });
});

describe('commitments — you own your promise, the server owns its completion', () => {
  it('lets a member create their own commitment', async () => {
    await assertSucceeds(setDoc(doc(as(env, ALICE), 'commitments/k1'), commitment(ALICE)));
  });

  it('denies creating a commitment attributed to someone else', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), 'commitments/k1'), commitment(BOB)));
  });

  it('denies a client writing pmTaskUrl or points onto their commitment', async () => {
    await seed(env, 'commitments/k1', commitment(ALICE));
    await assertFails(
      updateDoc(doc(as(env, ALICE), 'commitments/k1'), { pmTaskUrl: 'https://x', points: 50 }),
    );
  });

  it('denies the owner pushing dueAt into the future (defeating the on-time gate)', async () => {
    // onTime is judged against the stored dueAt at completion. If a late owner could bump dueAt
    // forward before closing the issue, every commitment would award "on time" retroactively.
    await seed(env, 'commitments/k1', commitment(ALICE, { dueAt: 1000 }));
    await assertFails(
      updateDoc(doc(as(env, ALICE), 'commitments/k1'), { dueAt: 9_999_999_999_999 }),
    );
  });

  it('denies the owner flipping status or retargeting pmExternalId', async () => {
    await seed(env, 'commitments/k1', commitment(ALICE));
    await assertFails(updateDoc(doc(as(env, ALICE), 'commitments/k1'), { status: 'done' }));
    await assertFails(updateDoc(doc(as(env, ALICE), 'commitments/k1'), { pmExternalId: '42' }));
  });

  it('still lets the owner edit their commitment text', async () => {
    await seed(env, 'commitments/k1', commitment(ALICE));
    await assertSucceeds(
      updateDoc(doc(as(env, ALICE), 'commitments/k1'), { text: 'reworded promise' }),
    );
  });
});

/* ==========================================================================
 * Rally assistant — a private conversation + memory, server-written only
 * ========================================================================== */
describe('assistant — your conversation and memory are yours alone', () => {
  it('lets you read your own assistant thread and memory', async () => {
    await seed(env, `assistantThreads/${ALICE}/messages/m1`, { role: 'assistant', content: 'hi', createdAt: 1 });
    await seed(env, `assistantMemory/${ALICE}`, { notes: ['prefers mornings'] });
    await assertSucceeds(getDoc(doc(as(env, ALICE), `assistantThreads/${ALICE}/messages/m1`)));
    await assertSucceeds(getDoc(doc(as(env, ALICE), `assistantMemory/${ALICE}`)));
  });

  it('denies reading someone else\'s conversation or memory', async () => {
    await seed(env, `assistantThreads/${ALICE}/messages/m1`, { role: 'assistant', content: 'private', createdAt: 1 });
    await seed(env, `assistantMemory/${ALICE}`, { notes: ['secret'] });
    await assertFails(getDoc(doc(as(env, BOB), `assistantThreads/${ALICE}/messages/m1`)));
    await assertFails(getDoc(doc(as(env, BOB), `assistantMemory/${ALICE}`)));
  });

  it('denies a client writing a reply or seeding the memory (server-only)', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), `assistantThreads/${ALICE}/messages/m1`), { role: 'assistant', content: 'forged', createdAt: 1 }));
    await assertFails(setDoc(doc(as(env, ALICE), `assistantMemory/${ALICE}`), { notes: ['injected'] }));
  });
});

/* ==========================================================================
 * shared cross-app context bus — server-only, never client-touchable
 * ========================================================================== */
describe('shared context bus — no client can read or write it', () => {
  it('denies client reads/writes of another\'s cross-app context and memory', async () => {
    await seed(env, 'cohortContext/nikjain15', { handle: 'nikjain15' });
    await seed(env, 'cohortContext/nikjain15/memory/n1', { app: 'rally', text: 'private', createdAt: 1 });
    await assertFails(getDoc(doc(as(env, ALICE), 'cohortContext/nikjain15')));
    await assertFails(getDoc(doc(as(env, ALICE), 'cohortContext/nikjain15/memory/n1')));
    await assertFails(setDoc(doc(as(env, ALICE), 'cohortContext/nikjain15/memory/x'), { app: 'x', text: 'forged', createdAt: 1 }));
  });

  it('denies client reads/writes of agent tasks (no forging cross-app work)', async () => {
    await seed(env, 'agentTasks/t1', { fromApp: 'pulse', toApp: 'rally', handle: 'nikjain15', status: 'pending' });
    await assertFails(getDoc(doc(as(env, ALICE), 'agentTasks/t1')));
    await assertFails(setDoc(doc(as(env, ALICE), 'agentTasks/t2'), { fromApp: 'x', toApp: 'rally', handle: 'nikjain15', status: 'pending' }));
  });
});
