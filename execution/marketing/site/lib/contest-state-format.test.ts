import { describe, expect, it } from 'vitest';
import { issueHasUpvote, parseReviewIssueTitle } from './contest-state-format';

describe('parseReviewIssueTitle', () => {
  it('parses canonical title', () => {
    expect(parseReviewIssueTitle('Review by @alice: @bob')).toEqual({
      voter: 'alice',
      reviewee: 'bob',
    });
  });

  it('allows missing @ and case-insensitive Review by', () => {
    expect(parseReviewIssueTitle('review by alice: bob')).toEqual({
      voter: 'alice',
      reviewee: 'bob',
    });
  });

  it('rejects malformed titles', () => {
    expect(parseReviewIssueTitle('Review of bob by alice')).toBeNull();
    expect(parseReviewIssueTitle('')).toBeNull();
  });
});

describe('issueHasUpvote', () => {
  it('detects Vote: up on its own line', () => {
    expect(issueHasUpvote('## Vote\n\nVote: up\n')).toBe(true);
    expect(issueHasUpvote('Vote: up')).toBe(true);
  });

  it('ignores missing or non-up votes', () => {
    expect(issueHasUpvote('no vote here')).toBe(false);
    expect(issueHasUpvote('Vote: down')).toBe(false);
    expect(issueHasUpvote(null)).toBe(false);
  });
});
