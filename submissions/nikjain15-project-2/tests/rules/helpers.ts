/**
 * Bootstrap + fixtures for Rally's Firestore rules tests.
 *
 * firestore.rules is where Rally's product promises stop being prose and start being
 * enforced: membership isolation (you can't read a channel you're not in), authorship
 * (you post only as yourself), and — the load-bearing one — that XP can never be minted by
 * a client. Every promise gets an assertion here. Fixtures are seeded through the admin
 * context (rules disabled), exactly as the server would, so the fixture is never part of
 * the assertion.
 */
import { readFileSync } from 'node:fs';
import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
  type RulesTestContext,
} from '@firebase/rules-unit-testing';
import type { Firestore } from 'firebase/firestore';

/** The people every test is about: A acts, B is acted upon, C is an outsider. */
export const ALICE = 'uid_alice';
export const BOB = 'uid_bob';
export const CAROL = 'uid_carol';

export const PROJECT_ID = 'demo-rally';

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

/** Nobody, signed into nothing. */
export function asAnon(env: RulesTestEnvironment): Firestore {
  return env.unauthenticatedContext().firestore() as unknown as Firestore;
}

/** Seed a document the way the server (Admin SDK) would — bypassing the rules under test. */
export async function seed(
  env: RulesTestEnvironment,
  path: string,
  data: Record<string, unknown>,
): Promise<void> {
  await env.withSecurityRulesDisabled(async (ctx: RulesTestContext) => {
    await ctx.firestore().doc(path).set(data);
  });
}

/* --------------------------------------------------------------- fixtures */

export function profile(uid: string, over: Record<string, unknown> = {}) {
  return {
    uid,
    handle: `gh_${uid}`,
    displayName: `Member ${uid}`,
    avatarUrl: null,
    githubLogin: `gh_${uid}`,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...over,
  };
}

export function channel(creatorUid: string, memberUids: string[], over: Record<string, unknown> = {}) {
  return {
    slug: 'general',
    name: 'General',
    kind: 'channel',
    isPrivate: false,
    creatorUid,
    memberUids,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...over,
  };
}

export function message(authorUid: string, over: Record<string, unknown> = {}) {
  return {
    authorUid,
    body: 'hello cohort',
    parentId: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    editedAt: null,
    ...over,
  };
}

/** A recognition as the server suggests it: helper helped helped, points server-set. */
export function recognition(helperUid: string, helpedUid: string, over: Record<string, unknown> = {}) {
  return {
    helperUid,
    helpedUid,
    sourceMsgRef: 'channels/c1/messages/m1',
    kind: 'unblocked',
    status: 'suggested',
    points: 10,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...over,
  };
}

export function xpEvent(profileUid: string, over: Record<string, unknown> = {}) {
  return {
    profileUid,
    source: 'recognition',
    refId: 'rec_1',
    points: 10,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...over,
  };
}

export function commitment(authorUid: string, over: Record<string, unknown> = {}) {
  return {
    authorUid,
    toUid: null,
    sourceMsgRef: 'channels/c1/messages/m1',
    text: 'I will open the PR by Friday',
    dueAt: null,
    status: 'open',
    pmTaskUrl: null,
    points: 0,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...over,
  };
}
