import { describe, expect, it } from 'vitest';
import {
  isEventWindowOpen,
  verifyEventAccessCode,
  eventSessionMaxAgeSec,
} from '@/lib/event/access';

describe('event access', () => {
  it('validates access code from env', () => {
    process.env.EVENT_ACCESS_CODE = 'TEST-CODE';
    expect(verifyEventAccessCode('TEST-CODE')).toBe(true);
    expect(verifyEventAccessCode('wrong')).toBe(false);
  });

  it('respects EVENT_ENDS_AT window', () => {
    process.env.EVENT_ENDS_AT = new Date(Date.now() + 60_000).toISOString();
    expect(isEventWindowOpen()).toBe(true);
    process.env.EVENT_ENDS_AT = new Date(Date.now() - 60_000).toISOString();
    expect(isEventWindowOpen()).toBe(false);
  });

  it('defaults session to 12 hours', () => {
    delete process.env.EVENT_SESSION_HOURS;
    expect(eventSessionMaxAgeSec()).toBe(12 * 60 * 60);
  });
});
