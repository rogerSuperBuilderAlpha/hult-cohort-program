import { describe, expect, it } from 'vitest';
import { highlightSegments, matchesQuery } from '@/lib/search';
import { applyMention, mentionQuery, rankMentions } from '@/lib/mention';
import { hasUnread } from '@/lib/data';

// Extra edge cases beyond search.test.ts / mention.test.ts / unread.test.ts.

describe('search — extra tokenization/ranking/case edges', () => {
  it('trims surrounding whitespace from the query before matching', () => {
    expect(matchesQuery('Deploy on Friday', '  friday  ')).toBe(true);
  });

  it('matches across word boundaries as a raw substring (no tokenization)', () => {
    // "y on F" spans two spaces — substring match, not per-token.
    expect(matchesQuery('Deploy on Friday', 'y on f')).toBe(true);
  });

  it('highlightSegments splits adjacent matches without dropping characters', () => {
    const segs = highlightSegments('aa', 'a');
    expect(segs).toEqual([
      { text: 'a', hit: true },
      { text: 'a', hit: true },
    ]);
    expect(segs.map((s) => s.text).join('')).toBe('aa'); // lossless
  });

  it('highlightSegments keeps leading unmatched text as its own segment', () => {
    const segs = highlightSegments('xxYY', 'yy');
    expect(segs[0]).toEqual({ text: 'xx', hit: false });
    expect(segs[1]).toEqual({ text: 'YY', hit: true });
  });

  it('highlightSegments treats a whitespace-only query as empty (whole body, unmarked)', () => {
    expect(highlightSegments('hello', '   ')).toEqual([{ text: 'hello', hit: false }]);
  });
});

describe('mention — extra parsing edges', () => {
  it('reads only the token up to the caret, not text after it', () => {
    // caret sits mid-token: query is the slice before the caret.
    expect(mentionQuery('hey @linus', 7)).toEqual({ query: 'li', start: 4 });
  });

  it('keeps punctuation adjacent to the token inside the query', () => {
    expect(mentionQuery('ping @bob!', 10)).toEqual({ query: 'bob!', start: 5 });
  });

  it('opens after a newline boundary, not just a space', () => {
    expect(mentionQuery('hi\n@lin', 7)).toEqual({ query: 'lin', start: 3 });
  });

  it('tracks the LAST @ when several appear before the caret', () => {
    expect(mentionQuery('@a @b', 5)).toEqual({ query: 'b', start: 3 });
  });

  it('is null when the caret is 0 (nothing typed yet)', () => {
    expect(mentionQuery('@lin', 0)).toBeNull();
  });

  it('applyMention collapses a multi-char token to the chosen name', () => {
    const r = applyMention('hey @linus', 4, 10, 'Linus T.');
    expect(r.text).toBe('hey @Linus T. ');
    expect(r.caret).toBe('hey @Linus T. '.length);
  });
});

describe('rankMentions — extra scoring/dedupe edges', () => {
  const members = [
    { displayName: 'Alice', handle: 'alice' },
    { displayName: 'Bob', handle: 'bobby' },
    { displayName: 'Malin', handle: null },
    { displayName: 'Alicia', handle: 'ali' },
  ];

  it('matches on handle prefix even when the display name does not', () => {
    // "bob" is not a prefix/substring of "Bob"? It IS ("Bob".includes("bob")). Use handle-only case.
    const out = rankMentions([{ displayName: 'Zed', handle: 'alicee' }], 'ali');
    expect(out.map((m) => m.displayName)).toEqual(['Zed']);
  });

  it('an empty query matches everyone (empty string is a prefix of all)', () => {
    const out = rankMentions(members, '');
    expect(out).toHaveLength(members.length);
  });

  it('respects the limit argument', () => {
    const out = rankMentions(members, 'a', 2);
    expect(out).toHaveLength(2);
  });

  it('is case-insensitive on both name and query', () => {
    const out = rankMentions(members, 'ALICE');
    expect(out[0].displayName).toBe('Alice');
  });
});

describe('hasUnread — extra boundary edges', () => {
  const ME = 'uid_me';
  const OTHER = 'uid_other';

  it('is read when the latest is exactly at the bookmark timestamp (strict >)', () => {
    expect(hasUnread({ authorUid: OTHER, createdAtMs: 150 }, 150, ME)).toBe(false);
  });

  it('my own message is not unread even with no bookmark and a real timestamp', () => {
    expect(hasUnread({ authorUid: ME, createdAtMs: 500 }, null, ME)).toBe(false);
  });

  it('my own message is not unread even when newer than my bookmark', () => {
    expect(hasUnread({ authorUid: ME, createdAtMs: 500 }, 100, ME)).toBe(false);
  });

  it('is unread at one millisecond past the bookmark', () => {
    expect(hasUnread({ authorUid: OTHER, createdAtMs: 101 }, 100, ME)).toBe(true);
  });

  it('a null createdAtMs is never unread even from another author with no bookmark', () => {
    expect(hasUnread({ authorUid: OTHER, createdAtMs: null }, null, ME)).toBe(false);
  });
});
