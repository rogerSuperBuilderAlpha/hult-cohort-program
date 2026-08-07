import { describe, expect, it } from 'vitest';
import { applyMention, mentionQuery, rankMentions } from '@/lib/mention';

describe('mentionQuery — when the dropdown should open', () => {
  it('opens on an @token at the caret', () => {
    expect(mentionQuery('hey @lin', 8)).toEqual({ query: 'lin', start: 4 });
  });

  it('opens at the very start of the text', () => {
    expect(mentionQuery('@lin', 4)).toEqual({ query: 'lin', start: 0 });
  });

  it('is empty query right after typing "@"', () => {
    expect(mentionQuery('hi @', 4)).toEqual({ query: '', start: 3 });
  });

  it('closes once a space follows the token', () => {
    expect(mentionQuery('hey @lin ', 9)).toBeNull();
  });

  it('ignores an @ that is mid-word (e.g. an email)', () => {
    expect(mentionQuery('mail me@x', 9)).toBeNull();
  });

  it('is null when there is no @ before the caret', () => {
    expect(mentionQuery('hello there', 11)).toBeNull();
  });
});

describe('applyMention — inserting the chosen name', () => {
  it('replaces the token with "@name " and moves the caret past it', () => {
    const r = applyMention('hey @lin', 4, 8, 'Linus T.');
    expect(r.text).toBe('hey @Linus T. ');
    expect(r.caret).toBe(r.text.length);
  });

  it('preserves text after the caret', () => {
    const r = applyMention('hi @l and bye', 3, 5, 'Lena');
    expect(r.text).toBe('hi @Lena  and bye');
  });
});

describe('rankMentions — prefix beats substring', () => {
  const members = [
    { displayName: 'Linus Torvalds', handle: 'ltorvalds' },
    { displayName: 'Car올', handle: 'caro' },
    { displayName: 'Malin', handle: null },
  ];

  it('prefers a name/handle prefix over an internal substring', () => {
    const out = rankMentions(members, 'lin');
    expect(out[0].displayName).toBe('Linus Torvalds'); // prefix
    expect(out.map((m) => m.displayName)).toContain('Malin'); // substring, ranked lower
  });

  it('returns nothing when no one matches', () => {
    expect(rankMentions(members, 'zzz')).toEqual([]);
  });
});
