/**
 * Verifies roster surfaces tolerate 0, 1, and 30 participants (Phase 4 checkpoint).
 * Run: npm run scale-check
 */
import { participants } from '../data/participants.ts';
import { gridColumnClass, padParticipants } from '../lib/participant-scale.ts';

const counts = [0, 1, 30] as const;

for (const count of counts) {
  const roster = padParticipants(participants, count);
  const gridClass = gridColumnClass(roster.length);

  if (roster.length !== count) {
    throw new Error(`Expected ${count} participants, got ${roster.length}`);
  }

  for (const p of roster) {
    if (!p.handle || !p.headline) {
      throw new Error(`Participant missing handle or headline at count=${count}`);
    }
  }

  console.log(`✓ ${count} participants — grid: ${gridClass}`);
}

console.log('Scale check passed (0 / 1 / 30).');
