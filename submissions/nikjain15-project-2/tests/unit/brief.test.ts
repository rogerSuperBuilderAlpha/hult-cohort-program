import { describe, expect, it } from 'vitest';
import { buildBrief } from '@/lib/brief';
import { extractJson, hasModel } from '@/lib/agent';
import { detectRecognitionsSmart } from '@/lib/detect-model';

const NOW = 1_000_000_000_000;

describe('buildBrief (deterministic Brief baseline)', () => {
  it('surfaces pending recognitions first', () => {
    const b = buildBrief({ pendingRecognitions: 2, dueCommitments: [], unreadChannels: [], nowMs: NOW });
    expect(b.items[0].kind).toBe('confirm-recognition');
    expect(b.items[0].text).toContain('2 teammates');
  });

  it('flags overdue and due-soon commitments, soonest first', () => {
    const b = buildBrief({
      pendingRecognitions: 0,
      dueCommitments: [
        { text: 'late one', dueAtMs: NOW - 3_600_000 },
        { text: 'soon one', dueAtMs: NOW + 3_600_000 },
        { text: 'far one', dueAtMs: NOW + 10 * 24 * 3_600_000 },
      ],
      unreadChannels: [],
      nowMs: NOW,
    });
    const texts = b.items.map((i) => i.text);
    expect(texts[0]).toContain('Past due');
    expect(texts.join(' ')).not.toContain('far one'); // beyond the soon window
  });

  it('caps at three items and always includes a quiet line', () => {
    const b = buildBrief({
      pendingRecognitions: 1,
      dueCommitments: [
        { text: 'a', dueAtMs: NOW - 1 },
        { text: 'b', dueAtMs: NOW - 2 },
        { text: 'c', dueAtMs: NOW - 3 },
      ],
      unreadChannels: [{ name: 'general', unread: 9 }],
      nowMs: NOW,
    });
    expect(b.items.length).toBe(3);
    expect(b.quiet).toBeTruthy();
  });

  it('says you are caught up when nothing needs you', () => {
    const b = buildBrief({ pendingRecognitions: 0, dueCommitments: [], unreadChannels: [], nowMs: NOW });
    expect(b.items).toHaveLength(0);
    expect(b.quiet).toMatch(/caught up/i);
  });
});

describe('extractJson (untrusted model output backstop)', () => {
  const isArr = (v: unknown): v is number[] => Array.isArray(v) && v.every((x) => typeof x === 'number');

  it('pulls JSON out of a fenced block with prose around it', () => {
    expect(extractJson('Sure!\n```json\n[1,2,3]\n```\nhope that helps', isArr)).toEqual([1, 2, 3]);
  });

  it('returns null on invalid shape or garbage', () => {
    expect(extractJson('["a","b"]', isArr)).toBeNull();
    expect(extractJson('not json at all', isArr)).toBeNull();
    expect(extractJson(null, isArr)).toBeNull();
  });
});

describe('detectRecognitionsSmart falls back to the deterministic baseline with no model', () => {
  it('uses the regex detector when ANTHROPIC_API_KEY is absent', async () => {
    expect(hasModel()).toBe(false); // no key in the test env
    const d = await detectRecognitionsSmart('thanks @alice for unblocking me');
    expect(d).toEqual([{ helperHandle: 'alice', kind: 'unblocked' }]);
  });
});
