import { describe, expect, it } from 'vitest';
import {
  normalizeSubmissionTitle,
  resolveHandleFromSubmissionTitle,
  submissionTitlesMatch,
} from './submission-title-match';

describe('normalizeSubmissionTitle', () => {
  it('normalizes spaced hyphen and en/em dashes', () => {
    expect(normalizeSubmissionTitle('[Project 1] Submission - alice')).toBe(
      '[project 1] submission — alice'
    );
    expect(normalizeSubmissionTitle('[Project 1] Submission – alice')).toBe(
      '[project 1] submission — alice'
    );
    expect(normalizeSubmissionTitle('[Project 1] Submission — alice')).toBe(
      '[project 1] submission — alice'
    );
  });

  it('preserves hyphens inside handles', () => {
    expect(normalizeSubmissionTitle('[Project 1] Submission - paramjeet-singh-neu')).toContain(
      'paramjeet-singh-neu'
    );
  });
});

describe('submissionTitlesMatch', () => {
  it('matches dash variants', () => {
    expect(
      submissionTitlesMatch(
        '[Project 1] Submission - alice',
        '[Project 1] Submission — alice'
      )
    ).toBe(true);
  });
});

describe('resolveHandleFromSubmissionTitle', () => {
  it('extracts handle after final dash', () => {
    expect(resolveHandleFromSubmissionTitle('[Project 1] Submission — alice')).toBe('alice');
    expect(resolveHandleFromSubmissionTitle('[Project 1] Submission - bob (note)')).toBe('bob');
  });

  it('returns null without separator', () => {
    expect(resolveHandleFromSubmissionTitle('not a submission title')).toBeNull();
  });
});
