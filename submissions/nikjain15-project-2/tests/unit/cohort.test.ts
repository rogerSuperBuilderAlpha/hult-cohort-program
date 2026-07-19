import { describe, expect, it } from 'vitest';
import { DEFAULT_CHANNELS, ENROLLED, findHandle, sameHandle } from '@cohort/core/cohort';

describe('cohort roster helpers (shared @cohort/core)', () => {
  it('quotes 65 enrolled', () => {
    expect(ENROLLED).toBe(65);
  });

  it('matches handles case-insensitively (GitHub logins are case-insensitive)', () => {
    expect(sameHandle('NikJain15', 'nikjain15')).toBe(true);
    expect(sameHandle('nikjain15', 'someoneelse')).toBe(false);
  });

  it('never matches a null handle', () => {
    expect(sameHandle(null, 'nikjain15')).toBe(false);
    expect(sameHandle('nikjain15', null)).toBe(false);
  });

  it('finds a handle in a roster case-insensitively', () => {
    expect(findHandle(['nikjain15', 'octocat'], 'OCTOCAT')).toBe('octocat');
    expect(findHandle(['nikjain15'], 'ghost')).toBeNull();
  });

  it('seeds every member into the default channels', () => {
    expect(DEFAULT_CHANNELS.map((c) => c.slug)).toContain('general');
  });
});
