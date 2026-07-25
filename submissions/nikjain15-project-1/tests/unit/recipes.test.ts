import { describe, expect, it } from 'vitest';
import { byMostUnstuck, byNewest, searchRecipes } from '@/lib/recipe-index';
import type { Recipe } from '@/lib/types';

/** A recipe with only the fields the pure helpers touch. */
function recipe(over: Partial<Recipe> & { id: string }): Recipe {
  return {
    problem: 'a problem',
    body: 'what worked',
    authorUid: 'uid_alice',
    taskId: null,
    turns: 0,
    unstuckUids: [],
    createdAt: stamp(0),
    ...over,
  } as Recipe;
}

/** Just enough Timestamp for the sorts, which only ever call toMillis(). */
function stamp(ms: number) {
  return { toMillis: () => ms } as Recipe['createdAt'];
}

describe('searchRecipes', () => {
  const recipes = [
    recipe({ id: 'a', problem: 'Firebase rules denied a read', authorUid: 'uid_alice' }),
    recipe({ id: 'b', problem: 'Turbopack recompiles mid-test', authorUid: 'uid_bob' }),
  ];

  it('matches on the problem, case-insensitively', () => {
    expect(searchRecipes(recipes, 'FIREBASE').map((r) => r.id)).toEqual(['a']);
  });

  it('matches a fragment mid-problem', () => {
    expect(searchRecipes(recipes, 'denied').map((r) => r.id)).toEqual(['a']);
  });

  it('returns everything for an empty or whitespace term', () => {
    expect(searchRecipes(recipes, '')).toHaveLength(2);
    expect(searchRecipes(recipes, '   ')).toHaveLength(2);
  });

  /**
   * The bank is indexed by problem, not by person — searching an author's name must not
   * pull up their recipes. Someone who needs the answer rarely knows whose it is, and an
   * author-searchable bank is a reputation board wearing a library's clothes.
   */
  it('does not match on the author', () => {
    expect(searchRecipes(recipes, 'uid_alice')).toHaveLength(0);
  });

  it('matches nothing rather than everything when the term is absent', () => {
    expect(searchRecipes(recipes, 'kubernetes')).toHaveLength(0);
  });
});

describe('byMostUnstuck — the default order', () => {
  it('ranks by people unstuck, not by recency', () => {
    const old = recipe({ id: 'old', unstuckUids: ['u1', 'u2'], createdAt: stamp(1) });
    const fresh = recipe({ id: 'fresh', unstuckUids: [], createdAt: stamp(99) });
    expect([fresh, old].sort(byMostUnstuck).map((r) => r.id)).toEqual(['old', 'fresh']);
  });

  it('breaks a tie with the newer one', () => {
    const older = recipe({ id: 'older', unstuckUids: ['u1'], createdAt: stamp(1) });
    const newer = recipe({ id: 'newer', unstuckUids: ['u2'], createdAt: stamp(2) });
    expect([older, newer].sort(byMostUnstuck).map((r) => r.id)).toEqual(['newer', 'older']);
  });
});

describe('byNewest', () => {
  it('puts the newest first', () => {
    const a = recipe({ id: 'a', createdAt: stamp(1) });
    const b = recipe({ id: 'b', createdAt: stamp(2) });
    expect([a, b].sort(byNewest).map((r) => r.id)).toEqual(['b', 'a']);
  });

  /**
   * A recipe written in this tab has no server timestamp until the write resolves.
   * Treating that null as epoch-zero would bury the thing you just banked at the bottom
   * of the list — it belongs at the top, which is where you're looking.
   */
  it('floats a just-written recipe to the top rather than burying it', () => {
    const pending = recipe({ id: 'pending', createdAt: null as unknown as Recipe['createdAt'] });
    const settled = recipe({ id: 'settled', createdAt: stamp(5) });
    expect([settled, pending].sort(byNewest).map((r) => r.id)).toEqual(['pending', 'settled']);
  });
});
