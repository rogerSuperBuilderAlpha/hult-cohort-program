import { describe, expect, it } from 'vitest';
import { compareTallyRows } from './tally-compare';

describe('compareTallyRows', () => {
  it('ranks by upvotes descending', () => {
    const a = { handle: 'a', up: 2, mergedAt: new Date('2026-07-01') };
    const b = { handle: 'b', up: 5, mergedAt: new Date('2026-07-02') };
    expect([a, b].sort(compareTallyRows).map((r) => r.handle)).toEqual(['b', 'a']);
  });

  it('tie-breaks by earliest mergedAt then handle', () => {
    const early = { handle: 'zeta', up: 3, mergedAt: new Date('2026-07-01T10:00:00Z') };
    const late = { handle: 'alpha', up: 3, mergedAt: new Date('2026-07-02T10:00:00Z') };
    expect([late, early].sort(compareTallyRows).map((r) => r.handle)).toEqual(['zeta', 'alpha']);

    const sameTimeA = { handle: 'alice', up: 1, mergedAt: new Date('2026-07-01') };
    const sameTimeB = { handle: 'bob', up: 1, mergedAt: new Date('2026-07-01') };
    expect([sameTimeB, sameTimeA].sort(compareTallyRows).map((r) => r.handle)).toEqual([
      'alice',
      'bob',
    ]);
  });
});
