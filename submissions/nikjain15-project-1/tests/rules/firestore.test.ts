/**
 * firestore.rules — the ethical promises, asserted.
 *
 * Read the test names, not the code: each one states a promise Pulse makes to the
 * cohort. If a test here goes red, the product is lying to someone.
 */
import { beforeAll, afterAll, beforeEach, describe, it } from 'vitest';
import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  ALICE,
  BOB,
  as,
  asAnon,
  cohortMember,
  introduction,
  makeEnv,
  member,
  project,
  pulseEvent,
  recipe,
  seed,
  sensedTask,
  task,
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
 * introductions — THE ONE THAT MATTERS MOST
 *
 * If this leaks, Pulse becomes a public list of who is struggling: the exact
 * thing this design refuses to be. The read rule is asymmetric on purpose —
 * the cohort sees nothing, ONE peer sees an offer to help, and the person the
 * introduction describes receives help rather than a flag.
 * ========================================================================== */
describe('introductions — a private nudge, never a "who is struggling" list', () => {
  // Bob is stuck. Alice is being asked to help. Nobody else is party to this.
  const path = 'introductions/intro_1';
  const fixture = () => seed(env, path, introduction(/* helper */ ALICE, /* stuck */ BOB));

  it('denies a cohort member reading an introduction they are not the helper for', async () => {
    await fixture();
    await assertFails(getDoc(doc(as(env, 'uid_carol'), path)));
  });

  it('denies the person the introduction describes reading that they were flagged as stuck', async () => {
    await fixture();
    // Bob is the SUBJECT. He gets help, not a notification that he is a problem.
    await assertFails(getDoc(doc(as(env, BOB), path)));
  });

  it('denies an anonymous visitor reading an introduction', async () => {
    await fixture();
    await assertFails(getDoc(doc(asAnon(env), path)));
  });

  it('denies listing the introductions collection — there is no "who is stuck" query', async () => {
    await fixture();
    await assertFails(getDocs(collection(as(env, 'uid_carol'), 'introductions')));
    await assertFails(getDocs(collection(as(env, BOB), 'introductions')));
  });

  it('lets the one intended helper read the introduction addressed to them', async () => {
    await fixture();
    await assertSucceeds(getDoc(doc(as(env, ALICE), path)));
  });

  it('denies a client creating an introduction — nobody may declare a peer stuck', async () => {
    await assertFails(
      addDoc(collection(as(env, ALICE), 'introductions'), introduction(ALICE, BOB)),
    );
    await assertFails(setDoc(doc(as(env, ALICE), 'introductions/forged'), introduction(ALICE, BOB)));
  });

  it('lets the helper update only the introduction state', async () => {
    await fixture();
    await assertSucceeds(updateDoc(doc(as(env, ALICE), path), { state: 'accepted' }));
  });

  it('denies the helper rewriting who the introduction is about', async () => {
    await fixture();
    await assertFails(updateDoc(doc(as(env, ALICE), path), { state: 'accepted', stuckUid: 'uid_carol' }));
  });

  it('denies a non-helper updating the introduction state', async () => {
    await fixture();
    await assertFails(updateDoc(doc(as(env, BOB), path), { state: 'declined' }));
  });

  it('denies anyone deleting an introduction', async () => {
    await fixture();
    await assertFails(deleteDoc(doc(as(env, ALICE), path)));
  });
});

/* ==========================================================================
 * pulse — append-only for everyone else; yours remains yours.
 * ========================================================================== */
describe('pulse — nobody can fake, edit, or erase someone else\'s heartbeat', () => {
  const path = 'pulse/event_1';
  const bobsEvent = () => seed(env, path, pulseEvent(BOB));

  it("denies A deleting B's post", async () => {
    await bobsEvent();
    await assertFails(deleteDoc(doc(as(env, ALICE), path)));
  });

  it('denies A creating an event attributed to B (impersonation)', async () => {
    await assertFails(addDoc(collection(as(env, ALICE), 'pulse'), pulseEvent(BOB)));
  });

  it("denies A adding B's uid to the kudos array", async () => {
    await bobsEvent();
    await assertFails(updateDoc(doc(as(env, ALICE), path), { kudos: [BOB] }));
  });

  it('denies A adding themselves AND B to kudos in one write', async () => {
    await bobsEvent();
    await assertFails(updateDoc(doc(as(env, ALICE), path), { kudos: [ALICE, BOB] }));
  });

  it("denies A stripping B's existing kudos", async () => {
    await seed(env, path, pulseEvent(BOB, { kudos: ['uid_carol'] }));
    await assertFails(updateDoc(doc(as(env, ALICE), path), { kudos: [] }));
  });

  it("denies A editing B's narrative", async () => {
    await bobsEvent();
    await assertFails(
      updateDoc(doc(as(env, ALICE), path), { narrative: 'bob did nothing today' }),
    );
  });

  it("denies A rewriting a past event's evidence — the receipt is frozen", async () => {
    await bobsEvent();
    await assertFails(
      updateDoc(doc(as(env, ALICE), path), { evidence: { commits: 999, prNumbers: [], spanHours: 0 } }),
    );
  });

  it('denies even the actor rewriting their own evidence — a feed you can rewrite is a feed nobody trusts', async () => {
    await seed(env, path, pulseEvent(ALICE));
    await assertFails(
      updateDoc(doc(as(env, ALICE), path), { evidence: { commits: 999, prNumbers: [], spanHours: 0 } }),
    );
  });

  it('denies creating an event that arrives pre-loaded with kudos', async () => {
    await assertFails(
      addDoc(collection(as(env, ALICE), 'pulse'), pulseEvent(ALICE, { kudos: [ALICE, BOB] })),
    );
  });

  it('denies an anonymous visitor reading the feed', async () => {
    await bobsEvent();
    await assertFails(getDoc(doc(asAnon(env), path)));
    await assertFails(getDocs(collection(asAnon(env), 'pulse')));
  });

  it('denies an anonymous visitor posting to the feed', async () => {
    await assertFails(addDoc(collection(asAnon(env), 'pulse'), pulseEvent(ALICE)));
  });

  it('lets the actor undo their own post — the product says "undo, any time"', async () => {
    await seed(env, path, pulseEvent(ALICE));
    await assertSucceeds(deleteDoc(doc(as(env, ALICE), path)));
  });

  it('lets a member toggle their own kudos on someone else\'s post, and un-toggle it', async () => {
    await bobsEvent();
    await assertSucceeds(updateDoc(doc(as(env, ALICE), path), { kudos: [ALICE] }));
    await assertSucceeds(updateDoc(doc(as(env, ALICE), path), { kudos: [] }));
  });

  it('lets a member add their kudos alongside existing ones without disturbing them', async () => {
    await seed(env, path, pulseEvent(BOB, { kudos: ['uid_carol'] }));
    await assertSucceeds(updateDoc(doc(as(env, ALICE), path), { kudos: ['uid_carol', ALICE] }));
  });

  it('lets the actor reword the narrative Pulse wrote as them', async () => {
    await seed(env, path, pulseEvent(ALICE));
    await assertSucceeds(
      updateDoc(doc(as(env, ALICE), path), {
        narrative: 'Actually, I paired on this.',
        editedAt: new Date(),
      }),
    );
  });

  it('lets the actor APPROVE a held ask_first proposal (proposedNarrative → narrative)', async () => {
    await seed(env, path, pulseEvent(ALICE, { narrative: null, proposedNarrative: 'Pulse wrote this.' }));
    await assertSucceeds(
      updateDoc(doc(as(env, ALICE), path), {
        narrative: 'Pulse wrote this.',
        proposedNarrative: null,
        editedAt: new Date(),
      }),
    );
  });

  it('lets the actor DISMISS a held proposal, leaving facts only', async () => {
    await seed(env, path, pulseEvent(ALICE, { narrative: null, proposedNarrative: 'Pulse wrote this.' }));
    await assertSucceeds(
      updateDoc(doc(as(env, ALICE), path), { proposedNarrative: null }),
    );
  });

  it("denies A approving B's proposal — a proposal is the actor's alone", async () => {
    await seed(env, path, pulseEvent(BOB, { narrative: null, proposedNarrative: 'Pulse wrote this about Bob.' }));
    await assertFails(
      updateDoc(doc(as(env, ALICE), path), {
        narrative: 'Pulse wrote this about Bob.',
        proposedNarrative: null,
        editedAt: new Date(),
      }),
    );
  });

  it('denies smuggling another field in alongside a proposal approval', async () => {
    // The curation branch is fields-exact: narrative/proposedNarrative/editedAt only.
    await seed(env, path, pulseEvent(ALICE, { narrative: null, proposedNarrative: 'Pulse wrote this.' }));
    await assertFails(
      updateDoc(doc(as(env, ALICE), path), {
        narrative: 'Pulse wrote this.',
        proposedNarrative: null,
        editedAt: new Date(),
        subject: 'a rewritten subject',
      }),
    );
  });

  it('lets a signed-in member post an event attributed to themselves', async () => {
    // actorName is now bound to the caller's own member doc, so the actor must have one.
    await seed(env, `members/${ALICE}`, member(ALICE));
    await assertSucceeds(addDoc(collection(as(env, ALICE), 'pulse'), pulseEvent(ALICE)));
  });

  it('denies a client forging an intro_made — only the trusted job may say who was helped', async () => {
    // intro_made is the Broker's one public moment: "{actor} unstuck {other}". It names
    // someone as previously stuck, so it may originate ONLY server-side (Admin SDK), when
    // a real introduction resolved. A member hand-writing it, even honestly attributed to
    // themselves, would publicly imply a peer was stuck with no resolved intro and no
    // consent behind it — the exact surveillance leak the asymmetry forbids.
    await seed(env, `members/${ALICE}`, member(ALICE));
    await assertFails(
      addDoc(
        collection(as(env, ALICE), 'pulse'),
        pulseEvent(ALICE, { kind: 'intro_made', subject: 'the OAuth redirect loop', otherName: `Member ${BOB}`, otherUid: BOB }),
      ),
    );
  });

  it('still lets a client post every other kind — the intro_made lock is surgical', async () => {
    await seed(env, `members/${ALICE}`, member(ALICE));
    await assertSucceeds(
      addDoc(collection(as(env, ALICE), 'pulse'), pulseEvent(ALICE, { kind: 'recipe_banked', subject: 'A recipe' })),
    );
  });

  it("denies A posting under B's NAME even with A's own uid — no impersonation via actorName", async () => {
    // The forgery the feed made effective: actorUid is honestly ALICE, but actorName is
    // BOB's — and the feed renders actorName verbatim, so it would display as BOB.
    await seed(env, `members/${ALICE}`, member(ALICE));
    await seed(env, `members/${BOB}`, member(BOB));
    await assertFails(
      addDoc(
        collection(as(env, ALICE), 'pulse'),
        pulseEvent(ALICE, { actorName: `Member ${BOB}` }),
      ),
    );
  });

  it('denies posting with a made-up actorName that matches no member doc', async () => {
    await seed(env, `members/${ALICE}`, member(ALICE));
    await assertFails(
      addDoc(
        collection(as(env, ALICE), 'pulse'),
        pulseEvent(ALICE, { actorName: 'Totally Not Alice' }),
      ),
    );
  });

  it('lets a signed-in member read the cohort feed', async () => {
    await bobsEvent();
    await assertSucceeds(getDocs(collection(as(env, ALICE), 'pulse')));
  });
});

/* ==========================================================================
 * cohortMembers — server-owned facts, plus the one consent gate.
 * ========================================================================== */
describe('cohortMembers — only you may decide whether a model writes about you', () => {
  const path = 'cohortMembers/gh_bob';

  it("denies A flipping B's narrationOptIn — consent is not transferable", async () => {
    await seed(env, path, cohortMember(BOB));
    await assertFails(updateDoc(doc(as(env, ALICE), path), { narrationOptIn: true }));
  });

  it('denies a client creating a cohortMembers doc', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), 'cohortMembers/gh_alice'), cohortMember(ALICE)));
  });

  it('denies a client deleting a cohortMembers doc', async () => {
    await seed(env, 'cohortMembers/gh_alice', cohortMember(ALICE));
    await assertFails(deleteDoc(doc(as(env, ALICE), 'cohortMembers/gh_alice')));
  });

  it('denies a member forging their own commit counts alongside the opt-in', async () => {
    await seed(env, 'cohortMembers/gh_alice', cohortMember(ALICE));
    await assertFails(
      updateDoc(doc(as(env, ALICE), 'cohortMembers/gh_alice'), { narrationOptIn: true, commits: 9999 }),
    );
  });

  it('denies a member editing any server-owned field on their own row', async () => {
    await seed(env, 'cohortMembers/gh_alice', cohortMember(ALICE));
    await assertFails(updateDoc(doc(as(env, ALICE), 'cohortMembers/gh_alice'), { commits: 9999 }));
  });

  it('denies an anonymous visitor reading cohort members', async () => {
    await seed(env, path, cohortMember(BOB));
    await assertFails(getDoc(doc(asAnon(env), path)));
  });

  it('lets a member flip their OWN narrationOptIn', async () => {
    await seed(env, 'cohortMembers/gh_alice', cohortMember(ALICE));
    await assertSucceeds(
      updateDoc(doc(as(env, ALICE), 'cohortMembers/gh_alice'), { narrationOptIn: true }),
    );
  });

  it('lets a signed-in member read the pre-indexed cohort', async () => {
    await seed(env, path, cohortMember(BOB));
    await assertSucceeds(getDoc(doc(as(env, ALICE), path)));
  });
});

/* ==========================================================================
 * recipes — the one ranking in the product, and it must not be gameable.
 * ========================================================================== */
describe('recipes — you cannot rank yourself', () => {
  const path = 'recipes/recipe_1';

  /**
   * The regression guard on the one ranking in the product.
   *
   * This was a live hole until the rules' `recipes` update was an OR of two branches
   * where only the first excluded the author: branch 2 ("anyone marking themselves
   * unstuck") re-granted exactly what branch 1 denied, so an author could rank their own
   * recipe by adding their own uid. Branch 2 now excludes the author.
   *
   * unstuckUids is meant to measure generosity rather than output. That makes it the one
   * number worth gaming, and the one person who benefits must not be able to touch it.
   */
  it("denies an author inflating their OWN recipe's unstuckUids (self-ranking)", async () => {
    await seed(env, path, recipe(ALICE));
    await assertFails(updateDoc(doc(as(env, ALICE), path), { unstuckUids: [ALICE] }));
  });

  it('denies an author padding their own recipe with other people\'s uids', async () => {
    await seed(env, path, recipe(ALICE));
    await assertFails(updateDoc(doc(as(env, ALICE), path), { unstuckUids: [BOB, 'uid_carol'] }));
  });

  it("denies A adding B to someone else's recipe", async () => {
    await seed(env, path, recipe(BOB));
    await assertFails(updateDoc(doc(as(env, ALICE), path), { unstuckUids: ['uid_carol'] }));
  });

  it('denies A creating a recipe attributed to B', async () => {
    await assertFails(addDoc(collection(as(env, ALICE), 'recipes'), recipe(BOB)));
  });

  it('denies a recipe created with a head start on the ranking', async () => {
    await assertFails(
      addDoc(collection(as(env, ALICE), 'recipes'), recipe(ALICE, { unstuckUids: [BOB] })),
    );
  });

  it("denies A editing B's recipe body", async () => {
    await seed(env, path, recipe(BOB));
    await assertFails(updateDoc(doc(as(env, ALICE), path), { title: 'my idea now' }));
  });

  it("denies A deleting B's recipe", async () => {
    await seed(env, path, recipe(BOB));
    await assertFails(deleteDoc(doc(as(env, ALICE), path)));
  });

  it('denies an anonymous visitor reading recipes', async () => {
    await seed(env, path, recipe(BOB));
    await assertFails(getDoc(doc(asAnon(env), path)));
    await assertFails(getDocs(collection(asAnon(env), 'recipes')));
  });

  it('lets an author edit their own recipe', async () => {
    await seed(env, path, recipe(ALICE));
    await assertSucceeds(updateDoc(doc(as(env, ALICE), path), { body: 'Clearer steps.' }));
  });

  it('lets another member add THEMSELVES to unstuckUids — the rank is earned, not claimed', async () => {
    await seed(env, path, recipe(BOB));
    await assertSucceeds(updateDoc(doc(as(env, ALICE), path), { unstuckUids: [ALICE] }));
  });

  it('lets a member remove themselves from unstuckUids again', async () => {
    await seed(env, path, recipe(BOB, { unstuckUids: [ALICE, 'uid_carol'] }));
    await assertSucceeds(updateDoc(doc(as(env, ALICE), path), { unstuckUids: ['uid_carol'] }));
  });

  it('lets a member publish a recipe under their own name', async () => {
    await assertSucceeds(addDoc(collection(as(env, ALICE), 'recipes'), recipe(ALICE)));
  });
});

/* ==========================================================================
 * members — your row is yours; identity is immutable; nothing is erased.
 * ========================================================================== */
describe('members — A cannot become B', () => {
  it("denies A writing B's member doc", async () => {
    await seed(env, `members/${BOB}`, member(BOB));
    await assertFails(updateDoc(doc(as(env, ALICE), `members/${BOB}`), { displayName: 'Not Bob' }));
  });

  it("denies A creating a member doc in B's name", async () => {
    await assertFails(setDoc(doc(as(env, ALICE), `members/${BOB}`), member(BOB)));
  });

  it('denies rewriting uid on your own member doc — identity is immutable', async () => {
    await seed(env, `members/${ALICE}`, member(ALICE));
    await assertFails(updateDoc(doc(as(env, ALICE), `members/${ALICE}`), { uid: BOB }));
  });

  it('denies creating a member doc whose uid does not match its id', async () => {
    await assertFails(setDoc(doc(as(env, ALICE), `members/${ALICE}`), member(ALICE, { uid: BOB })));
  });

  it('denies anyone deleting a member doc — not even their own', async () => {
    await seed(env, `members/${ALICE}`, member(ALICE));
    await assertFails(deleteDoc(doc(as(env, ALICE), `members/${ALICE}`)));
  });

  it('denies an anonymous visitor reading members', async () => {
    await seed(env, `members/${BOB}`, member(BOB));
    await assertFails(getDoc(doc(asAnon(env), `members/${BOB}`)));
  });

  it('lets A create their own member doc', async () => {
    await assertSucceeds(setDoc(doc(as(env, ALICE), `members/${ALICE}`), member(ALICE)));
  });

  it('lets A update their own member doc', async () => {
    await seed(env, `members/${ALICE}`, member(ALICE));
    await assertSucceeds(updateDoc(doc(as(env, ALICE), `members/${ALICE}`), { handle: 'gh_real' }));
  });

  it('lets a signed-in member read the cohort roster', async () => {
    await seed(env, `members/${BOB}`, member(BOB));
    await assertSucceeds(getDoc(doc(as(env, ALICE), `members/${BOB}`)));
  });
});

/* ==========================================================================
 * githubLinks — your connection and consent state. Nobody else's business.
 * ========================================================================== */
describe('githubLinks — nobody else\'s business, ever', () => {
  it("denies A reading B's github link doc", async () => {
    await seed(env, `githubLinks/${BOB}`, { uid: BOB, login: 'gh_bob', token: 'secret' });
    await assertFails(getDoc(doc(as(env, ALICE), `githubLinks/${BOB}`)));
  });

  it("denies A writing B's github link doc", async () => {
    await seed(env, `githubLinks/${BOB}`, { uid: BOB, login: 'gh_bob' });
    await assertFails(setDoc(doc(as(env, ALICE), `githubLinks/${BOB}`), { uid: BOB, login: 'stolen' }));
  });

  it("denies A deleting B's github link doc", async () => {
    await seed(env, `githubLinks/${BOB}`, { uid: BOB, login: 'gh_bob' });
    await assertFails(deleteDoc(doc(as(env, ALICE), `githubLinks/${BOB}`)));
  });

  it('denies an anonymous visitor reading a github link doc', async () => {
    await seed(env, `githubLinks/${BOB}`, { uid: BOB, login: 'gh_bob' });
    await assertFails(getDoc(doc(asAnon(env), `githubLinks/${BOB}`)));
  });

  it('lets A read their own github link doc', async () => {
    await seed(env, `githubLinks/${ALICE}`, { uid: ALICE, login: 'gh_alice' });
    await assertSucceeds(getDoc(doc(as(env, ALICE), `githubLinks/${ALICE}`)));
  });

  it('lets A write and delete their own github link doc', async () => {
    await assertSucceeds(
      setDoc(doc(as(env, ALICE), `githubLinks/${ALICE}`), { uid: ALICE, login: 'gh_alice' }),
    );
    await assertSucceeds(deleteDoc(doc(as(env, ALICE), `githubLinks/${ALICE}`)));
  });
});

/* ==========================================================================
 * projects & tasks — the shared work. Open by design, attributed by rule.
 * ========================================================================== */
describe('projects and tasks — shared work, honest authorship', () => {
  it('denies A creating a project owned by B', async () => {
    await assertFails(addDoc(collection(as(env, ALICE), 'projects'), project(BOB)));
  });

  it('denies reassigning a project owner', async () => {
    await seed(env, 'projects/proj_1', project(BOB));
    await assertFails(updateDoc(doc(as(env, ALICE), 'projects/proj_1'), { ownerUid: ALICE }));
  });

  it('denies deleting a project — archive instead, the feed references it', async () => {
    await seed(env, 'projects/proj_1', project(ALICE));
    await assertFails(deleteDoc(doc(as(env, ALICE), 'projects/proj_1')));
  });

  it('denies A creating a task credited to B', async () => {
    await assertFails(addDoc(collection(as(env, ALICE), 'tasks'), task(BOB)));
  });

  it('denies rewriting a task\'s creator', async () => {
    await seed(env, 'tasks/task_1', task(BOB));
    await assertFails(updateDoc(doc(as(env, ALICE), 'tasks/task_1'), { creatorUid: ALICE }));
  });

  it("denies A deleting B's task", async () => {
    await seed(env, 'tasks/task_1', task(BOB));
    await assertFails(deleteDoc(doc(as(env, ALICE), 'tasks/task_1')));
  });

  it('denies an anonymous visitor reading the cohort\'s work', async () => {
    await seed(env, 'projects/proj_1', project(BOB));
    await seed(env, 'tasks/task_1', task(BOB));
    await assertFails(getDocs(collection(asAnon(env), 'projects')));
    await assertFails(getDocs(collection(asAnon(env), 'tasks')));
  });

  it('denies an anonymous visitor creating a project or task', async () => {
    await assertFails(addDoc(collection(asAnon(env), 'projects'), project(ALICE)));
    await assertFails(addDoc(collection(asAnon(env), 'tasks'), task(ALICE)));
  });

  it('lets a signed-in member create a project and a task of their own', async () => {
    await assertSucceeds(addDoc(collection(as(env, ALICE), 'projects'), project(ALICE)));
    await assertSucceeds(addDoc(collection(as(env, ALICE), 'tasks'), task(ALICE)));
  });

  it("lets a signed-in member read the cohort's work", async () => {
    await seed(env, 'projects/proj_1', project(BOB));
    await seed(env, 'tasks/task_1', task(BOB));
    await assertSucceeds(getDocs(collection(as(env, ALICE), 'projects')));
    await assertSucceeds(getDocs(collection(as(env, ALICE), 'tasks')));
  });

  it("lets the cohort assign work to each other — A may edit B's task", async () => {
    await seed(env, 'tasks/task_1', task(BOB));
    await assertSucceeds(updateDoc(doc(as(env, ALICE), 'tasks/task_1'), { assigneeUid: ALICE }));
  });

  it('lets the creator delete their own task', async () => {
    await seed(env, 'tasks/task_1', task(ALICE));
    await assertSucceeds(deleteDoc(doc(as(env, ALICE), 'tasks/task_1')));
  });
});

/* ==========================================================================
 * sensed-card id squatting — a predictable id must belong to its creator.
 *
 * sensedTaskId = `s_<uid>_<fnv1a(branch|pr)>`. The uid is readable and the branch/PR is
 * public, so the id is guessable. If a peer could create a doc at `s_<victim>_<hash>`,
 * the victim's create-if-absent transaction would find it and no-op forever — silently
 * blocking that card from their board, with no error and no way to delete the squat.
 * ========================================================================== */
describe('tasks — nobody can squat a victim\'s sensed-card id', () => {
  const victimId = `s_${BOB}_deadbeef`;

  it("denies a peer creating a doc at the victim's derived sensed id", async () => {
    await assertFails(
      setDoc(doc(as(env, ALICE), `tasks/${victimId}`), sensedTask(ALICE)),
    );
  });

  it('denies squatting even when the squatter stamps it manual to dodge the check', async () => {
    // Setting source:'manual' must not buy a bypass — the id shape is what's guarded, and
    // a manual card at that id still blocks the victim's transaction.
    await assertFails(
      setDoc(doc(as(env, ALICE), `tasks/${victimId}`), task(ALICE)),
    );
  });

  it('lets the rightful owner create their own sensed card at that id', async () => {
    await assertSucceeds(
      setDoc(doc(as(env, BOB), `tasks/${victimId}`), sensedTask(BOB)),
    );
  });

  it('still lets manual cards use any (non-sensed-shaped) auto id', async () => {
    // addDoc auto-ids never start with `s_`, so open manual creation is unaffected.
    await assertSucceeds(addDoc(collection(as(env, ALICE), 'tasks'), task(ALICE)));
  });
});

/* ==========================================================================
 * tombstones — a deleted sensed card stays deleted, and nobody forges yours.
 * ========================================================================== */
describe('tombstones — deletion sticks, and only you can record your own', () => {
  const id = `s_${ALICE}_deadbeef`;

  it('lets a member tombstone their own deleted sensed card', async () => {
    await assertSucceeds(
      setDoc(doc(as(env, ALICE), `tombstones/${id}`), { uid: ALICE, createdAt: new Date() }),
    );
  });

  it("denies forging a tombstone under someone else's uid", async () => {
    await assertFails(
      setDoc(doc(as(env, ALICE), `tombstones/${id}`), { uid: BOB, createdAt: new Date() }),
    );
  });

  it('denies extra fields on a tombstone', async () => {
    await assertFails(
      setDoc(doc(as(env, ALICE), `tombstones/${id}`), {
        uid: ALICE,
        createdAt: new Date(),
        evil: true,
      }),
    );
  });

  it('denies lifting a tombstone — deletion is permanent', async () => {
    await seed(env, `tombstones/${id}`, { uid: ALICE, createdAt: new Date() });
    await assertFails(deleteDoc(doc(as(env, ALICE), `tombstones/${id}`)));
    await assertFails(updateDoc(doc(as(env, ALICE), `tombstones/${id}`), { uid: BOB }));
  });
});

/* ==========================================================================
 * The drive-by: signed into nothing, sees nothing.
 * ========================================================================== */
describe('anonymous access — a signed-out visitor sees nothing, anywhere', () => {
  const collections = [
    'members',
    'cohortMembers',
    'githubLinks',
    'projects',
    'tasks',
    'comments',
    'pulse',
    'recipes',
    'introductions',
  ];

  it('denies an anonymous read of every collection in the product', async () => {
    await seed(env, `members/${BOB}`, member(BOB));
    await seed(env, 'cohortMembers/gh_bob', cohortMember(BOB));
    await seed(env, `githubLinks/${BOB}`, { uid: BOB });
    await seed(env, 'projects/proj_1', project(BOB));
    await seed(env, 'tasks/task_1', task(BOB));
    await seed(env, 'comments/comment_1', { taskId: 'task_1', authorUid: BOB, body: 'hi' });
    await seed(env, 'pulse/event_1', pulseEvent(BOB));
    await seed(env, 'recipes/recipe_1', recipe(BOB));
    await seed(env, 'introductions/intro_1', introduction(ALICE, BOB));

    const anon = asAnon(env);
    for (const name of collections) {
      await assertFails(getDocs(collection(anon, name)));
    }
  });

  it('denies an anonymous write to every collection in the product', async () => {
    const anon = asAnon(env);
    for (const name of collections) {
      await assertFails(addDoc(collection(anon, name), { hello: 'world' }));
    }
  });
});

/**
 * The receipt is the product's honesty, so the rules have to defend it.
 *
 * Every one of these was permitted until 2026-07-17. The `tasks` update rule pinned
 * `creatorUid` and left the rest of the document open — which is the same shape of
 * mistake three times over in this file's history: the rule reasons carefully about WHO
 * may write and not at all about WHAT.
 */
describe('tasks — a receipt cannot be forged', () => {
  const path = 'tasks/task_1';

  it('denies stamping a fabricated receipt onto your own manual card', async () => {
    await seed(env, path, task(ALICE));
    await assertFails(
      updateDoc(doc(as(env, ALICE), path), {
        source: 'sensed',
        evidence: { commits: 999, prNumbers: [1337], files: [], spanHours: 40 },
      })
    );
  });

  it("denies rewriting the evidence on someone else's card", async () => {
    await seed(env, path, sensedTask(BOB));
    await assertFails(
      updateDoc(doc(as(env, ALICE), path), {
        evidence: { commits: 0, prNumbers: [1], files: [], spanHours: null },
      })
    );
  });

  it('denies even the author rewriting their own evidence', async () => {
    // Same standard the pulse rules already hold: a receipt you can edit isn't one.
    await seed(env, path, sensedTask(ALICE));
    await assertFails(
      updateDoc(doc(as(env, ALICE), path), {
        evidence: { commits: 500, prNumbers: [2], files: [], spanHours: 99 },
      })
    );
  });

  it('denies repointing `branch` — the key another member\'s sync trusts', async () => {
    await seed(env, path, sensedTask(BOB));
    await assertFails(updateDoc(doc(as(env, ALICE), path), { branch: 'feat/mine' }));
  });

  it('denies backdating createdAt', async () => {
    await seed(env, path, task(ALICE));
    await assertFails(
      updateDoc(doc(as(env, ALICE), path), { createdAt: new Date('2020-01-01T00:00:00Z') })
    );
  });

  it('still lets the cohort do the work: edit, assign and move a card', async () => {
    // The point of the lock is to leave normal collaboration untouched. B5-B7 are graded.
    await seed(env, path, task(BOB));
    await assertSucceeds(
      updateDoc(doc(as(env, ALICE), path), {
        title: 'Renamed by a teammate',
        assigneeUid: ALICE,
        status: 'in_progress',
      })
    );
  });

  it('still lets Pulse move a sensed card without touching its receipt', async () => {
    await seed(env, path, sensedTask(ALICE));
    await assertSucceeds(
      updateDoc(doc(as(env, ALICE), path), { status: 'done', completedAt: new Date() })
    );
  });
});

/**
 * "I'm stuck on this" is the Broker's strongest signal BECAUSE it carries zero
 * inference — which it only stays if it is unforgeable. A peer who can flag you stuck
 * has manufactured the exact claim ("so-and-so is struggling") this product refuses to
 * infer, and laundered it through the one channel the broker trusts completely.
 */
describe('tasks — only the assignee can say "I\'m stuck"', () => {
  const path = 'tasks/task_1';

  it('lets the assignee flag their own card, and clear it again', async () => {
    await seed(env, path, task(BOB, { assigneeUid: ALICE }));
    await assertSucceeds(updateDoc(doc(as(env, ALICE), path), { stuckSince: new Date() }));
    await assertSucceeds(updateDoc(doc(as(env, ALICE), path), { stuckSince: null }));
  });

  it('denies a peer declaring the assignee stuck', async () => {
    await seed(env, path, task(BOB, { assigneeUid: BOB }));
    await assertFails(updateDoc(doc(as(env, ALICE), path), { stuckSince: new Date() }));
  });

  it('denies even the card\'s creator flagging someone else\'s struggle', async () => {
    // Creating the card gives you no voice about the assignee's state of mind.
    await seed(env, path, task(ALICE, { assigneeUid: BOB }));
    await assertFails(updateDoc(doc(as(env, ALICE), path), { stuckSince: new Date() }));
  });

  it('denies flagging an unassigned card — there is nobody to be stuck', async () => {
    await seed(env, path, task(ALICE, { assigneeUid: null }));
    await assertFails(updateDoc(doc(as(env, ALICE), path), { stuckSince: new Date() }));
  });

  it('leaves normal edits by peers untouched when the flag stays put', async () => {
    await seed(env, path, task(BOB, { assigneeUid: BOB, stuckSince: new Date() }));
    await assertSucceeds(
      updateDoc(doc(as(env, ALICE), path), { title: 'Renamed by a teammate' })
    );
  });
});

/**
 * Counts are `array.length`, but the rules reasoned in SETS — and Firestore arrays allow
 * duplicates. So `[]` -> `[alice, alice, alice]` had a symmetric difference of {alice} and
 * sailed through, letting anyone set the two numbers in the product to whatever they liked
 * by repeating their own uid.
 *
 * The recipe case is the one that matters: `unstuckUids` is the ONLY ranking here, and it
 * is supposed to measure generosity.
 */
describe('arrays — you cannot inflate a count by repeating yourself', () => {
  it('denies padding kudos with your own uid many times', async () => {
    await seed(env, 'pulse/event_1', pulseEvent(BOB));
    await assertFails(
      updateDoc(doc(as(env, ALICE), 'pulse/event_1'), { kudos: [ALICE, ALICE, ALICE] })
    );
  });

  it("denies inflating someone else's recipe rank by repeating yourself", async () => {
    await seed(env, 'recipes/recipe_1', recipe(BOB));
    await assertFails(
      updateDoc(doc(as(env, ALICE), 'recipes/recipe_1'), { unstuckUids: [ALICE, ALICE, ALICE] })
    );
  });

  it('denies a duplicate slipped in alongside a legitimate toggle', async () => {
    await seed(env, 'pulse/event_1', pulseEvent(BOB, { kudos: [BOB] }));
    await assertFails(
      updateDoc(doc(as(env, ALICE), 'pulse/event_1'), { kudos: [BOB, ALICE, ALICE] })
    );
  });

  it('still lets one person give kudos once', async () => {
    await seed(env, 'pulse/event_1', pulseEvent(BOB));
    await assertSucceeds(updateDoc(doc(as(env, ALICE), 'pulse/event_1'), { kudos: [ALICE] }));
  });

  it('still lets one person be unstuck once', async () => {
    await seed(env, 'recipes/recipe_1', recipe(BOB));
    await assertSucceeds(
      updateDoc(doc(as(env, ALICE), 'recipes/recipe_1'), { unstuckUids: [ALICE] })
    );
  });
});

/**
 * The exit. Deliberately unauthenticated — "someone who wants out shouldn't have to create
 * an account to leave" — so these tests pin the SHAPE of a deliberate trade rather than
 * proving it safe. There were no tests here at all until 2026-07-17, on the one collection
 * that anyone on the internet can write to.
 */
describe('optOuts — the exit has no signup wall, and no way back in', () => {
  it('lets a stranger with no account tombstone a handle', async () => {
    await assertSucceeds(
      setDoc(doc(asAnon(env), 'optOuts/somebody'), {
        handle: 'somebody',
        createdAt: new Date(),
      })
    );
  });

  it('denies a tombstone whose handle does not match its doc id', async () => {
    // The doc id is the join key the landing page filters on; a mismatch would hide
    // one person while claiming to be about another.
    await assertFails(
      setDoc(doc(asAnon(env), 'optOuts/somebody'), {
        handle: 'someone-else',
        createdAt: new Date(),
      })
    );
  });

  it('denies smuggling extra fields into a tombstone', async () => {
    await assertFails(
      setDoc(doc(asAnon(env), 'optOuts/somebody'), {
        handle: 'somebody',
        createdAt: new Date(),
        note: 'anything at all',
      })
    );
  });

  it('denies lifting a tombstone — un-removing someone is a deliberate manual act', async () => {
    await seed(env, 'optOuts/somebody', { handle: 'somebody', createdAt: new Date() });
    await assertFails(deleteDoc(doc(as(env, ALICE), 'optOuts/somebody')));
    await assertFails(updateDoc(doc(as(env, ALICE), 'optOuts/somebody'), { handle: 'other' }));
  });
});
