/**
 * Pure index logic for the recipe bank — no Firestore, no network.
 *
 * Split from `recipes.ts` (which imports the Firebase SDK, and so can't be imported by a
 * unit test without live config) for the same reason `sense.ts` is pure: the rules about
 * how the bank is ordered and searched are product decisions, and they should be provable
 * without standing up an emulator.
 */

import type { Recipe } from './types';

/** Most unstuck first, then newest — the index's default order. */
export function byMostUnstuck(a: Recipe, b: Recipe): number {
  const diff = b.unstuckUids.length - a.unstuckUids.length;
  return diff !== 0 ? diff : byNewest(a, b);
}

export function byNewest(a: Recipe, b: Recipe): number {
  // A recipe written in this tab has no server timestamp yet. Sort it first rather than
  // treating it as epoch-old and burying it below everything.
  return (b.createdAt?.toMillis() ?? Infinity) - (a.createdAt?.toMillis() ?? Infinity);
}

/**
 * Search by problem, never by author.
 *
 * Indexing the bank by who wrote it turns a library into a reputation board, and the
 * person who most needs the answer is the one least likely to know whose it is.
 */
export function searchRecipes(recipes: Recipe[], term: string): Recipe[] {
  const q = term.trim().toLowerCase();
  if (!q) return recipes;
  return recipes.filter((r) => r.problem.toLowerCase().includes(q));
}
