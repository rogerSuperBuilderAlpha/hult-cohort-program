import { describe, expect, it } from 'vitest';
import { findConnection, topicTerms, type MemberWork } from '@/lib/connections';

/**
 * The collaboration matcher. It must connect people on real shared topics, from PUBLIC PR
 * titles only, and never on glue words — and never suggest you to yourself.
 */

describe('topicTerms', () => {
  it('keeps topic words, drops stopwords, verbs, and short tokens', () => {
    expect([...topicTerms('Fix the auth redirect flow')].sort()).toEqual(['auth', 'flow', 'redirect']);
  });

  it('is case- and punctuation-insensitive', () => {
    expect(topicTerms('Payments: Stripe webhook!').has('payments')).toBe(true);
    expect(topicTerms('Payments: Stripe webhook!').has('stripe')).toBe(true);
  });
});

const others: MemberWork[] = [
  { handle: 'priya', displayName: 'Priya', prs: [{ number: 42, title: 'Firebase auth session fix' }] },
  { handle: 'sam', displayName: 'Sam', prs: [{ number: 7, title: 'Landing page copy' }] },
];

describe('findConnection', () => {
  it('finds a member working on a shared topic and quotes their public PR verbatim', () => {
    const c = findConnection(['Wire the auth flow', 'Write docs'], 'me', others);
    expect(c).not.toBeNull();
    expect(c!.handle).toBe('priya');
    expect(c!.prNumber).toBe(42);
    expect(c!.prTitle).toBe('Firebase auth session fix');
    expect(c!.sharedTerms).toContain('auth');
  });

  it('returns null when nothing overlaps', () => {
    expect(findConnection(['Design the logo'], 'me', others)).toBeNull();
  });

  it('returns null on empty work', () => {
    expect(findConnection([], 'me', others)).toBeNull();
  });

  it('never suggests you to yourself, even on a perfect overlap', () => {
    const withMe: MemberWork[] = [
      { handle: 'me', displayName: 'Me', prs: [{ number: 1, title: 'auth flow' }] },
      ...others,
    ];
    const c = findConnection(['auth flow'], 'me', withMe);
    expect(c?.handle).not.toBe('me');
    expect(c?.handle).toBe('priya');
  });

  it('respects a higher minShared so one incidental word does not manufacture a link', () => {
    const weak: MemberWork[] = [{ handle: 'x', displayName: 'X', prs: [{ number: 9, title: 'auth' }] }];
    expect(findConnection(['auth stuff'], 'me', weak, 2)).toBeNull();
  });
});
