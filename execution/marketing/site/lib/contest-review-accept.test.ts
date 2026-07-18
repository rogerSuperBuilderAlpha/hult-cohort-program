import { describe, expect, it } from 'vitest';
import { reviewAuthorMatchesVoter } from './contest-review-accept';

describe('reviewAuthorMatchesVoter', () => {
  it('accepts matching author and voter', () => {
    expect(reviewAuthorMatchesVoter('alice', 'alice')).toBe(true);
    expect(reviewAuthorMatchesVoter('Alice', 'alice')).toBe(true);
  });

  it('rejects mismatched author', () => {
    expect(reviewAuthorMatchesVoter('mallory', 'alice')).toBe(false);
  });

  it('fails closed on missing or unparseable author', () => {
    expect(reviewAuthorMatchesVoter(null, 'alice')).toBe(false);
    expect(reviewAuthorMatchesVoter(undefined, 'alice')).toBe(false);
    expect(reviewAuthorMatchesVoter('', 'alice')).toBe(false);
    expect(reviewAuthorMatchesVoter('github-actions[bot]', 'alice')).toBe(false);
  });
});
