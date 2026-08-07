import { describe, expect, it } from 'vitest';
import { highlightSegments, matchesQuery } from '@/lib/search';

describe('matchesQuery — case-insensitive substring', () => {
  it('matches regardless of case', () => {
    expect(matchesQuery('Deploy on Friday', 'friday')).toBe(true);
    expect(matchesQuery('Deploy on Friday', 'DEPLOY')).toBe(true);
  });
  it('does not match an empty/whitespace query (search is off)', () => {
    expect(matchesQuery('anything', '')).toBe(false);
    expect(matchesQuery('anything', '   ')).toBe(false);
  });
  it('does not match a miss', () => {
    expect(matchesQuery('hello world', 'zzz')).toBe(false);
  });
});

describe('highlightSegments — split for rendering', () => {
  it('marks every occurrence as a hit', () => {
    const segs = highlightSegments('ba ba black sheep', 'ba');
    expect(segs.filter((s) => s.hit).map((s) => s.text)).toEqual(['ba', 'ba']);
    expect(segs.map((s) => s.text).join('')).toBe('ba ba black sheep'); // lossless
  });
  it('preserves the original casing of the matched text', () => {
    const segs = highlightSegments('Friday standup', 'friday');
    expect(segs[0]).toEqual({ text: 'Friday', hit: true });
  });
  it('returns the whole body unmarked when the query is empty', () => {
    expect(highlightSegments('hi', '')).toEqual([{ text: 'hi', hit: false }]);
  });
});
