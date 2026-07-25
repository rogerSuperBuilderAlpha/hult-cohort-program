import { describe, expect, it } from 'vitest';
import { hasUnread } from '@/lib/data';

const ME = 'uid_me';
const OTHER = 'uid_other';

describe('hasUnread — the sidebar unread indicator logic', () => {
  it('is unread when someone else posted after my read bookmark', () => {
    expect(hasUnread({ authorUid: OTHER, createdAtMs: 200 }, 100, ME)).toBe(true);
  });

  it('is read when my bookmark is at or after the latest message', () => {
    expect(hasUnread({ authorUid: OTHER, createdAtMs: 200 }, 200, ME)).toBe(false);
    expect(hasUnread({ authorUid: OTHER, createdAtMs: 200 }, 300, ME)).toBe(false);
  });

  it('never marks unread from my OWN latest message (no self-nagging)', () => {
    expect(hasUnread({ authorUid: ME, createdAtMs: 999 }, null, ME)).toBe(false);
  });

  it('is unread when there is no bookmark yet and someone else posted', () => {
    expect(hasUnread({ authorUid: OTHER, createdAtMs: 5 }, null, ME)).toBe(true);
  });

  it('is not unread for an empty channel', () => {
    expect(hasUnread(null, null, ME)).toBe(false);
    expect(hasUnread({ authorUid: OTHER, createdAtMs: null }, null, ME)).toBe(false);
  });
});
