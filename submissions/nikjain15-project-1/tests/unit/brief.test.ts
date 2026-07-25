import { describe, expect, it } from 'vitest';
import { assembleBrief, briefIsEmpty, type BriefFacts } from '@/lib/brief-fallback';

/**
 * The model-free brief fallback. The model path is exercised elsewhere (and mocked, like
 * narrate); what's under test here is the honest sentence Pulse shows when there's no key,
 * an outage, or a reader who hasn't opted into narration. It must never fabricate, never
 * comment on pace, and stay quiet on an empty week.
 */

const base: BriefFacts = {
  displayName: 'Ada',
  cohortShipped: 0,
  cohortFiguredOut: 0,
  cohortUnstuck: 0,
  shipStreakDays: 0,
  youShipped: 0,
  youUnstuck: 0,
  youKudos: 0,
  yourOpenTitles: [],
};

describe('briefIsEmpty', () => {
  it('is empty when nothing shipped, nothing figured out, no help, and no open work', () => {
    expect(briefIsEmpty(base)).toBe(true);
  });

  it('is not empty if the cohort shipped', () => {
    expect(briefIsEmpty({ ...base, cohortShipped: 1 })).toBe(false);
  });

  it('is not empty if the reader has open work, even with a quiet cohort', () => {
    expect(briefIsEmpty({ ...base, yourOpenTitles: ['Wire auth'] })).toBe(false);
  });
});

describe('assembleBrief', () => {
  it('returns nothing for an empty week — Home renders silence, not an apology', () => {
    expect(assembleBrief(base)).toBe('');
  });

  it('leads with what Pulse did when you shipped', () => {
    const text = assembleBrief({ ...base, youShipped: 2, cohortShipped: 5 });
    expect(text).toMatch(/moved to done/i);
    expect(text).toContain('The cohort shipped 5 this week.');
  });

  it('counts generosity when present, with a serial comma', () => {
    const text = assembleBrief({
      ...base,
      cohortShipped: 8,
      cohortFiguredOut: 3,
      cohortUnstuck: 2,
    });
    expect(text).toContain('shipped 8, figured out 3, and unstuck 2');
  });

  it('omits generosity clauses that are zero', () => {
    const text = assembleBrief({ ...base, cohortShipped: 4 });
    expect(text).toContain('The cohort shipped 4 this week.');
    expect(text).not.toMatch(/figured out|unstuck/);
  });

  it('invites when the cohort moves but you have not shipped and have no open work', () => {
    const text = assembleBrief({ ...base, cohortShipped: 3 });
    expect(text).toMatch(/here is where things stand/i);
  });

  it('never invents numbers or comments on pace', () => {
    const text = assembleBrief({ ...base, cohortShipped: 1, yourOpenTitles: ['x'] });
    expect(text).not.toMatch(/only|finally|quiet|behind|roll/i);
  });
});
