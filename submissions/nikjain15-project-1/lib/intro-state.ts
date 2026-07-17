import type { Introduction } from './types';

/**
 * The Introduction state machine — pure, so it's unit-testable without touching Firebase.
 * Split from `introductions.ts` (which holds the live listener and the write) for the same
 * reason `recipe-index.ts` is split from `recipes.ts`: the decision logic must be provable
 * without a live database config, and importing `./firebase` in a unit test initialises
 * Auth and throws.
 *
 * LAYER-2-3-DESIGN.md, Layer 3. The helper's only two moves are send and dismiss, and both
 * are terminal and silent — the stuck person never learns an introduction existed,
 * whichever way it goes. `intro_made` (the public thank-you) is a SEPARATE, server-written
 * event that fires only when help actually lands; it is deliberately not a state here, so a
 * helper tapping "send" cannot itself publish anything about the stuck person.
 */
export type IntroAction = 'send' | 'dismiss';

/**
 * ```
 * suggested ──(helper sends what worked)──▶ sent
 *     └──────(helper waves it off)────────▶ dismissed
 * ```
 *
 * Only a live suggestion can transition. A re-tap on an already-resolved intro returns
 * null — a no-op, not an error — so two tabs, a double click, or a re-fired effect all
 * converge instead of racing.
 */
export function nextIntroState(
  current: Introduction['state'],
  action: IntroAction
): Introduction['state'] | null {
  if (current !== 'suggested') return null;
  return action === 'send' ? 'sent' : 'dismissed';
}

/**
 * The single introduction to surface, if any — the newest live suggestion.
 *
 * One offer, never a queue: being a helper is generosity, not a support rota. A `sent`
 * intro has been acted on and a `dismissed` one waved off, so only `suggested` is live.
 * Expects newest-first input (the listener orders by `createdAt` desc).
 */
export function selectHelperIntro(intros: readonly Introduction[]): Introduction | null {
  return intros.find((i) => i.state === 'suggested') ?? null;
}
