import { describe, expect, it } from 'vitest';
import { commitmentNudge, nudgeSortKey } from '@/lib/commitment-nudge';

const NOW = 1_000_000_000_000;
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

describe('commitmentNudge — the kind due-status chip', () => {
  it('undated promises get no nudge (we only remind about a time the person set)', () => {
    expect(commitmentNudge(null, NOW)).toEqual({ tone: 'none', label: '' });
  });

  it('is "due soon" within the next 24h', () => {
    expect(commitmentNudge(NOW + 2 * HOUR, NOW).tone).toBe('due-soon');
    expect(commitmentNudge(NOW + DAY, NOW).tone).toBe('due-soon');
  });

  it('is "scheduled" beyond 24h out', () => {
    expect(commitmentNudge(NOW + 3 * DAY, NOW).tone).toBe('scheduled');
  });

  it('overdue is framed as encouragement, never shame (no "late", no penalty language)', () => {
    const n = commitmentNudge(NOW - DAY, NOW);
    expect(n.tone).toBe('overdue');
    expect(n.label.toLowerCase()).not.toContain('late');
    expect(n.label.toLowerCase()).not.toContain('overdue');
    expect(n.label).toMatch(/still counts/i);
  });

  it('sort key puts soonest-due first and sinks undated promises last', () => {
    const keys = [null, NOW + DAY, NOW - DAY].map(nudgeSortKey);
    expect(keys[2]).toBeLessThan(keys[1]); // overdue before due-later
    expect(keys[0]).toBe(Number.MAX_SAFE_INTEGER); // undated last
  });
});
