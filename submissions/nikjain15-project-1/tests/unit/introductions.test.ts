import { describe, expect, it } from 'vitest';
import { nextIntroState, selectHelperIntro } from '@/lib/intro-state';
import type { Introduction } from '@/lib/types';

/**
 * The Introduction state machine — LAYER-2-3-DESIGN.md, Layer 3.
 *
 * The helper's only two moves are send and dismiss, and both are terminal and silent —
 * the stuck person never learns an introduction existed, whichever way it goes. The tests
 * pin that a resolved intro can't be re-transitioned (so a double-tap or a second tab is a
 * no-op, not a second action) and that only a live suggestion is ever surfaced.
 */

function intro(state: Introduction['state'], over: Partial<Introduction> = {}): Introduction {
  return {
    id: 'i1',
    stuckUid: 'stuck',
    helperUid: 'me',
    recipeId: 'r1',
    problem: 'Firestore rules denied a read',
    state,
    createdAt: { toDate: () => new Date(), toMillis: () => 0 } as unknown as Introduction['createdAt'],
    ...over,
  };
}

describe('nextIntroState — suggested is the only live state', () => {
  it('a suggestion can be sent or dismissed', () => {
    expect(nextIntroState('suggested', 'send')).toBe('sent');
    expect(nextIntroState('suggested', 'dismiss')).toBe('dismissed');
  });

  it('a resolved intro never transitions again — a re-tap is a no-op, not a second action', () => {
    expect(nextIntroState('sent', 'send')).toBeNull();
    expect(nextIntroState('sent', 'dismiss')).toBeNull();
    expect(nextIntroState('dismissed', 'send')).toBeNull();
    expect(nextIntroState('dismissed', 'dismiss')).toBeNull();
  });
});

describe('selectHelperIntro — one live offer, never a queue', () => {
  it('surfaces the newest suggestion and ignores resolved ones', () => {
    const intros = [intro('dismissed', { id: 'a' }), intro('suggested', { id: 'b' }), intro('suggested', { id: 'c' })];
    // Feed order is newest-first; the first live suggestion wins.
    expect(selectHelperIntro(intros)?.id).toBe('b');
  });

  it('offers nothing when everything is resolved — silence, not an empty queue', () => {
    expect(selectHelperIntro([intro('sent'), intro('dismissed')])).toBeNull();
    expect(selectHelperIntro([])).toBeNull();
  });
});
