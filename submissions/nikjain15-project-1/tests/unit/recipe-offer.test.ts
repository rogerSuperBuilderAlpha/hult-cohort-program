import { describe, expect, it } from 'vitest';
import {
  OFFER_MAX_AGE_MS,
  selectRecipeOffer,
  type OfferShip,
} from '@/lib/sense';

/**
 * The recipe offer — LAYER-2-3-DESIGN.md, Layer 2.
 *
 * The promises under test are the anti-nag rules: one offer, own hard ships only, never
 * repeated for the same work, never for work already banked, and silence always fine.
 * A selector that over-offers turns the one gentle prompt into a chore list, which is
 * the failure mode the design names.
 */

const ME = 'uid-me';

function ship(overrides: Partial<OfferShip> = {}): OfferShip {
  return {
    id: 'evt-1',
    kind: 'task_shipped',
    actorUid: ME,
    taskId: 'task-1',
    subject: 'Fix the OAuth redirect loop',
    evidence: { commits: 0, spanHours: 30, prNumbers: [41] },
    ageMs: 60_000,
    ...overrides,
  };
}

function select(ships: OfferShip[], overrides: Partial<Parameters<typeof selectRecipeOffer>[0]> = {}) {
  return selectRecipeOffer({
    ships,
    uid: ME,
    bankedTaskIds: new Set<string>(),
    dismissed: () => false,
    ...overrides,
  });
}

describe('selectRecipeOffer — one offer, never a nag', () => {
  it('offers your newest hard ship, carrying the PR to extract from', () => {
    expect(select([ship()])).toEqual({
      eventId: 'evt-1',
      taskId: 'task-1',
      prNumber: 41,
      title: 'Fix the OAuth redirect loop',
    });
  });

  it('never offers a peer\'s ship — the fight has to be yours', () => {
    expect(select([ship({ actorUid: 'uid-peer' })])).toBeNull();
  });

  it('never offers an easy ship — no fight, no offer', () => {
    expect(select([ship({ evidence: { commits: 1, spanHours: 2, prNumbers: [41] } })])).toBeNull();
    expect(select([ship({ evidence: null })])).toBeNull();
  });

  it('never repeats a dismissed offer — "not now" is forever for that work', () => {
    expect(select([ship()], { dismissed: (id) => id === 'evt-1' })).toBeNull();
  });

  it('never offers work already banked — the moment was kept', () => {
    expect(select([ship()], { bankedTaskIds: new Set(['task-1']) })).toBeNull();
  });

  it('still offers a card-less ship when banked suppression has no taskId to match', () => {
    // taskId null means the recipe chip can't link back, but the fight was real and the
    // offer still stands — suppression must not accidentally key null against null.
    const offer = select([ship({ taskId: null })], { bankedTaskIds: new Set(['task-1']) });
    expect(offer).not.toBeNull();
    expect(offer!.taskId).toBeNull();
  });

  it('expires — last week\'s fight is history, not an open moment', () => {
    expect(select([ship({ ageMs: OFFER_MAX_AGE_MS + 1 })])).toBeNull();
    // A clock-skewed future event must not fire either.
    expect(select([ship({ ageMs: -5_000 })])).toBeNull();
  });

  it('offers exactly one — the newest qualifying ship, skipping resolved ones', () => {
    const newest = ship({ id: 'evt-new', taskId: 'task-new' });
    const older = ship({ id: 'evt-old', taskId: 'task-old', ageMs: 120_000 });

    // Feed order is newest first; the first match wins.
    expect(select([newest, older])!.eventId).toBe('evt-new');

    // The newest resolved (dismissed) → the older one may still have its moment.
    expect(select([newest, older], { dismissed: (id) => id === 'evt-new' })!.eventId).toBe('evt-old');
  });

  it('ignores non-ship events entirely', () => {
    expect(select([ship({ kind: 'recipe_banked' })])).toBeNull();
    expect(select([ship({ kind: 'task_started' })])).toBeNull();
  });

  it('offers without a PR number when the evidence has none — the draft degrades, the offer doesn\'t', () => {
    const offer = select([ship({ evidence: { commits: 8, spanHours: null, prNumbers: [] } })]);
    expect(offer).not.toBeNull();
    expect(offer!.prNumber).toBeNull();
  });
});
