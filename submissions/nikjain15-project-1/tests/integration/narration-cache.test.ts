/**
 * The narration budget cache is a SET, not a single slot (residual #2).
 *
 * A member ships many PRs; each is its own work key. The old scalar `narrationCacheKey`
 * kept only the last, so re-sensing an earlier PR missed the cache — a paid model call for
 * unchanged work and a duplicate "shipped" announcement. `markWorkNarrated` accumulates,
 * so every narrated PR stays remembered. This drives the real `markWorkNarrated` +
 * `githubLinks` doc against the emulator, under the real rules.
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { markWorkNarrated } from '@/lib/github-link';
import { narrationCacheKey } from '@/lib/sense';
import {
  clearFirestore,
  importAppDb,
  signOutPrimary,
  signUpPrimary,
  type TestUser,
} from './helpers';

describe('narration cache: a second PR does not evict the first (residual #2)', () => {
  let user: TestUser;

  beforeEach(async () => {
    await clearFirestore();
    user = await signUpPrimary('narrator');
  });

  afterAll(async () => {
    await signOutPrimary();
  });

  it('remembers every narrated PR, so unchanged work is never re-billed', async () => {
    const db = await importAppDb();
    const ref = doc(db, 'githubLinks', user.uid);
    // The link doc must exist before markWorkNarrated updates it — as it does after consent.
    await setDoc(ref, {
      uid: user.uid,
      handle: 'octocat',
      status: 'connected',
      mode: 'auto',
      narrationOptIn: true,
      createTasksFromBranches: true,
      excludedRepos: [],
      lastSyncedAt: null,
      narratedWorkKeys: [],
    });

    const pr40 = narrationCacheKey('octocat', ['pr-40', 'merged']);
    const pr50 = narrationCacheKey('octocat', ['pr-50', 'merged']);

    // Ship PR #40, then PR #50 — two separate narration events.
    await markWorkNarrated(user.uid, pr40);
    await markWorkNarrated(user.uid, pr50);

    const keys = (await getDoc(ref)).data()!.narratedWorkKeys as string[];
    // The single-slot design would hold only pr50 here. The set holds both.
    expect(keys).toContain(pr40);
    expect(keys).toContain(pr50);
  });

  it('does not duplicate a key when the same work is marked twice (arrayUnion)', async () => {
    const db = await importAppDb();
    const ref = doc(db, 'githubLinks', user.uid);
    await setDoc(ref, { uid: user.uid, handle: 'octocat', narratedWorkKeys: [] });

    const key = narrationCacheKey('octocat', ['pr-7', 'merged']);
    await markWorkNarrated(user.uid, key);
    await markWorkNarrated(user.uid, key);

    const keys = (await getDoc(ref)).data()!.narratedWorkKeys as string[];
    expect(keys).toEqual([key]);
  });
});
