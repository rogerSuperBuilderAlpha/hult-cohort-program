import { describe, expect, it } from 'vitest';
import {
  introKey,
  matchIntroductions,
  MAX_INTROS_PER_HELPER,
  type HelperKnowledge,
  type StuckSignal,
} from '@/lib/broker';
import { fileOverlap } from '@/lib/sense';

/**
 * The Broker's matching core — LAYER-2-3-DESIGN.md, Layer 3.
 *
 * These tests pin the ethic, not just the arithmetic. The dangerous failure isn't a
 * missed match — a missed match costs nothing. It's matching the wrong way: naming the
 * stuck person as their own helper, burying the most generous member under offers, or
 * preferring a weak file-toucher over someone who literally wrote the recipe. Each of
 * those is a test below.
 */

function helper(overrides: Partial<HelperKnowledge> = {}): HelperKnowledge {
  return {
    uid: 'h1',
    recipes: [],
    shippedFiles: [],
    shippedTitles: [],
    brokerOptOut: false,
    activeIntros: 0,
    ...overrides,
  };
}

function signal(overrides: Partial<StuckSignal> = {}): StuckSignal {
  return {
    stuckUid: 'stuck',
    problem: 'Fix the OAuth redirect loop',
    files: [],
    source: 'opt_in',
    ...overrides,
  };
}

describe('fileOverlap', () => {
  it('counts shared paths exactly, ignoring empties', () => {
    expect(fileOverlap(['lib/a.ts', 'lib/b.ts'], ['lib/b.ts', 'lib/c.ts'])).toBe(1);
    expect(fileOverlap(['lib/a.ts'], ['lib/z.ts'])).toBe(0);
    expect(fileOverlap(['', 'lib/a.ts'], ['', 'lib/a.ts'])).toBe(1);
  });
});

describe('matchIntroductions — the asymmetry, enforced', () => {
  it('matches a recipe author to a stuck problem, carrying the recipe id', () => {
    const drafts = matchIntroductions({
      signals: [signal()],
      helpers: [helper({ uid: 'ada', recipes: [{ id: 'r1', problem: 'fix the oauth redirect loop' }] })],
    });
    expect(drafts).toEqual([
      { stuckUid: 'stuck', helperUid: 'ada', recipeId: 'r1', problem: 'Fix the OAuth redirect loop', strength: 'recipe' },
    ]);
  });

  it('falls back to a file-toucher when nobody banked a recipe', () => {
    const drafts = matchIntroductions({
      signals: [signal({ files: ['lib/auth.ts'] })],
      helpers: [helper({ uid: 'grace', shippedFiles: ['lib/auth.ts', 'lib/db.ts'] })],
    });
    expect(drafts).toEqual([
      { stuckUid: 'stuck', helperUid: 'grace', recipeId: null, problem: 'Fix the OAuth redirect loop', strength: 'files' },
    ]);
  });

  it('prefers the recipe author over a file-toucher — the answer beats a neighbour', () => {
    const drafts = matchIntroductions({
      signals: [signal({ files: ['lib/auth.ts'] })],
      helpers: [
        helper({ uid: 'toucher', shippedFiles: ['lib/auth.ts'] }),
        helper({ uid: 'author', recipes: [{ id: 'r1', problem: 'fix the oauth redirect loop' }] }),
      ],
    });
    expect(drafts).toHaveLength(1);
    expect(drafts[0].helperUid).toBe('author');
    expect(drafts[0].strength).toBe('recipe');
  });

  it('NEVER names the stuck person as their own helper', () => {
    // The stuck member also happens to have banked a matching recipe (they solved it once,
    // hit it again). They must not be brokered to themselves.
    const drafts = matchIntroductions({
      signals: [signal({ stuckUid: 'ada' })],
      helpers: [helper({ uid: 'ada', recipes: [{ id: 'r1', problem: 'fix the oauth redirect loop' }] })],
    });
    expect(drafts).toEqual([]);
  });

  it('never matches a helper who opted out of brokering', () => {
    const drafts = matchIntroductions({
      signals: [signal()],
      helpers: [helper({ uid: 'ada', brokerOptOut: true, recipes: [{ id: 'r1', problem: 'fix the oauth redirect loop' }] })],
    });
    expect(drafts).toEqual([]);
  });

  it('emits at most ONE introduction per stuck person — a private offer, not a broadcast', () => {
    const drafts = matchIntroductions({
      signals: [signal()],
      helpers: [
        helper({ uid: 'a', recipes: [{ id: 'r1', problem: 'fix the oauth redirect loop' }] }),
        helper({ uid: 'b', recipes: [{ id: 'r2', problem: 'fix the oauth redirect loop' }] }),
      ],
    });
    expect(drafts).toHaveLength(1);
  });

  it('spreads load — the fewer-intros helper wins a tie, and the cap is honoured', () => {
    const recipe = [{ id: 'r', problem: 'fix the oauth redirect loop' }];
    const drafts = matchIntroductions({
      signals: [signal({ stuckUid: 's1' }), signal({ stuckUid: 's2' })],
      helpers: [
        helper({ uid: 'busy', recipes: recipe, activeIntros: 1 }),
        helper({ uid: 'free', recipes: recipe, activeIntros: 0 }),
      ],
    });
    // Both stuck people get the LESS-loaded helper until they'd tie, spreading the work.
    expect(drafts.map((d) => d.helperUid)).toEqual(['free', 'busy']);
  });

  it('never exceeds the per-helper cap, even with only one qualified helper', () => {
    const recipe = [{ id: 'r', problem: 'fix the oauth redirect loop' }];
    const signals = Array.from({ length: 5 }, (_, i) => signal({ stuckUid: `s${i}` }));
    const drafts = matchIntroductions({ signals, helpers: [helper({ uid: 'only', recipes: recipe })] });
    // The lone helper takes exactly the cap; the rest go unmatched rather than piling on.
    expect(drafts).toHaveLength(MAX_INTROS_PER_HELPER);
    expect(drafts.every((d) => d.helperUid === 'only')).toBe(true);
  });

  it('serves explicit opt-ins before aging-WIP guesses when helper capacity is scarce', () => {
    const recipe = [{ id: 'r', problem: 'fix the oauth redirect loop' }];
    // One helper, cap 1. A low-confidence WIP signal is listed first, an opt-in second.
    const drafts = matchIntroductions({
      signals: [
        signal({ stuckUid: 'wip', source: 'aging_wip' }),
        signal({ stuckUid: 'asked', source: 'opt_in' }),
      ],
      helpers: [helper({ uid: 'only', recipes: recipe })],
      capPerHelper: 1,
    });
    // The person who explicitly asked wins the single slot, not the one we merely guessed at.
    expect(drafts).toHaveLength(1);
    expect(drafts[0].stuckUid).toBe('asked');
  });

  it('matches on a shipped title when there are no shared files', () => {
    const drafts = matchIntroductions({
      signals: [signal({ files: [] })],
      helpers: [helper({ uid: 'grace', shippedTitles: ['Fix the OAuth redirect loop'] })],
    });
    expect(drafts[0]?.strength).toBe('files');
  });

  it('does nothing when no helper knows anything — a missed match is fine, a wrong one is not', () => {
    const drafts = matchIntroductions({
      signals: [signal()],
      helpers: [helper({ uid: 'stranger', shippedFiles: ['unrelated.ts'], shippedTitles: ['Something else'] })],
    });
    expect(drafts).toEqual([]);
  });
});

describe('introKey — idempotent upsert key', () => {
  it('is stable across whitespace and case on the problem', () => {
    expect(introKey({ stuckUid: 'a', helperUid: 'b', problem: '  Fix It  ' })).toBe(
      introKey({ stuckUid: 'a', helperUid: 'b', problem: 'fix it' })
    );
  });

  it('separates different stuck/helper/problem triples', () => {
    expect(introKey({ stuckUid: 'a', helperUid: 'b', problem: 'x' })).not.toBe(
      introKey({ stuckUid: 'a', helperUid: 'c', problem: 'x' })
    );
  });
});
