import { describe, expect, it } from 'vitest';
import { allow } from '@/lib/rate-guard';

describe('rate-guard — caps model/detection calls per uid', () => {
  it('allows up to the limit in a window, then blocks', () => {
    const bucket = `t_${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(allow(bucket, 'u1', 5, 60_000, 1000)).toBe(true);
    }
    expect(allow(bucket, 'u1', 5, 60_000, 1000)).toBe(false);
  });

  it('limits each uid independently', () => {
    const bucket = `t_${Math.random()}`;
    expect(allow(bucket, 'a', 1, 60_000, 1000)).toBe(true);
    expect(allow(bucket, 'a', 1, 60_000, 1000)).toBe(false);
    // b is unaffected by a's usage.
    expect(allow(bucket, 'b', 1, 60_000, 1000)).toBe(true);
  });

  it('resets after the window elapses', () => {
    const bucket = `t_${Math.random()}`;
    expect(allow(bucket, 'u', 1, 60_000, 0)).toBe(true);
    expect(allow(bucket, 'u', 1, 60_000, 100)).toBe(false);
    expect(allow(bucket, 'u', 1, 60_000, 60_001)).toBe(true);
  });
});
