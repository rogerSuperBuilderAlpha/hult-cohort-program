/**
 * Bootstrap + fixtures for the Firestore rules tests.
 *
 * These tests are the highest-value tests in the project: firestore.rules is where
 * Pulse's ethical promises stop being prose and start being enforced. A promise the
 * rules don't enforce is marketing, so every promise gets an assertion here.
 *
 * One emulator, one dataset, one env for the whole file — cheap to create is a lie,
 * so we build it once in beforeAll and only wipe the data between tests.
 */
import { readFileSync } from 'node:fs';
import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
  type RulesTestContext,
} from '@firebase/rules-unit-testing';
import type { Firestore } from 'firebase/firestore';

/** The two people every test is about: A acts, B is acted upon. */
export const ALICE = 'uid_alice';
export const BOB = 'uid_bob';
export const CAROL = 'uid_carol';

export const PROJECT_ID = 'demo-pulse';

export async function makeEnv(): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: '127.0.0.1',
      port: 8080,
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
}

/** A signed-in member's view of Firestore — subject to the rules. */
export function as(env: RulesTestEnvironment, uid: string): Firestore {
  return env.authenticatedContext(uid).firestore() as unknown as Firestore;
}

/** The drive-by: nobody, signed into nothing. */
export function asAnon(env: RulesTestEnvironment): Firestore {
  return env.unauthenticatedContext().firestore() as unknown as Firestore;
}

/**
 * Seed a document the way the server would — bypassing rules entirely, exactly as the
 * Admin SDK does in production. Fixtures must never be created through the rules
 * under test, or the fixture becomes part of the assertion.
 */
export async function seed(
  env: RulesTestEnvironment,
  path: string,
  data: Record<string, unknown>,
): Promise<void> {
  await env.withSecurityRulesDisabled(async (ctx: RulesTestContext) => {
    // The admin context exposes the v9-compat Firestore API surface.
    await ctx.firestore().doc(path).set(data);
  });
}

/* --------------------------------------------------------------- fixtures */

/** A pulse event, as the server publishes it: attributed, evidenced, kudos-empty. */
export function pulseEvent(
  actorUid: string,
  over: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    kind: 'task_shipped',
    actorUid,
    actorName: `Member ${actorUid}`,
    actorPhotoURL: null,
    subject: 'Ship the rules tests',
    projectId: 'proj_1',
    taskId: 'task_1',
    narrative: `${actorUid} shipped something today.`,
    // The receipt. Frozen once written — a feed you can rewrite is a feed nobody trusts.
    evidence: { commits: 6, prNumbers: [41], spanHours: 2 },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    kudos: [] as string[],
    ...over,
  };
}

/** A cohortMember row: indexed from the public repo before anyone signed up. */
export function cohortMember(
  uid: string | null,
  over: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    uid,
    handle: uid ? `gh_${uid}` : 'gh_unclaimed',
    commits: 128,
    prs: 9,
    // The gate that decides whether a model may write sentences about you.
    narrationOptIn: false,
    ...over,
  };
}

/** A recipe: what actually worked, banked for the next person. */
export function recipe(
  authorUid: string,
  over: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    authorUid,
    title: 'Fix the emulator PATH',
    body: 'Prefix with the openjdk bin directory.',
    // The one ranking in the product. It measures generosity, not output.
    unstuckUids: [] as string[],
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...over,
  };
}

/**
 * An introduction: "Marcus is stuck on what you solved."
 * The most sensitive document in the product — it names someone who is struggling.
 */
export function introduction(
  helperUid: string,
  stuckUid: string,
  over: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    helperUid,
    stuckUid,
    recipeId: 'recipe_1',
    reason: 'You solved the same thing last week.',
    state: 'offered',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...over,
  };
}

export function member(uid: string, over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    uid,
    email: `${uid}@example.com`,
    handle: `gh_${uid}`,
    displayName: `Member ${uid}`,
    photoURL: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...over,
  };
}

export function project(ownerUid: string, over: Record<string, unknown> = {}) {
  return {
    name: 'Pulse',
    description: 'The cohort heartbeat.',
    ownerUid,
    archived: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...over,
  };
}

export function task(creatorUid: string, over: Record<string, unknown> = {}) {
  return {
    projectId: 'proj_1',
    title: 'Write the rules tests',
    description: '',
    status: 'todo',
    assigneeUid: null,
    creatorUid,
    dueDate: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    completedAt: null,
    // The provenance fields. A card says on its face where it came from, and `evidence`
    // is the receipt backing that claim — so the rules have to defend them.
    source: 'manual',
    evidence: null,
    branch: null,
    // The assignee's own quiet ask. Only they may flip it — see the stuck-flag tests.
    stuckSince: null,
    ...over,
  };
}

/** A card Pulse built, carrying the receipt that makes it believable. */
export function sensedTask(creatorUid: string, over: Record<string, unknown> = {}) {
  return task(creatorUid, {
    source: 'sensed',
    evidence: { commits: 0, prNumbers: [41], files: [], spanHours: null },
    branch: 'feat/real-branch',
    ...over,
  });
}
