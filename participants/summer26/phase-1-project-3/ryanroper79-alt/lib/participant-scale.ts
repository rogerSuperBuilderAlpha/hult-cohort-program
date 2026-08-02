import type { Participant } from '@/data/participants';

/** Scale-check helper — pads roster for layout verification only. */
export function padParticipants(base: readonly Participant[], targetCount: number): Participant[] {
  if (targetCount <= base.length) {
    return base.slice(0, targetCount) as Participant[];
  }

  const padded = [...base];
  let i = 1;

  while (padded.length < targetCount) {
    padded.push({
      handle: `scale-check-${i}`,
      name: 'Pending',
      status: 'pending',
      headline: 'Scale-check placeholder — not a real participant.',
      links: {},
      projects: [],
    });
    i += 1;
  }

  return padded;
}

export function gridColumnClass(count: number): string {
  if (count === 0) return 'none';
  if (count === 1) return 'sm:grid-cols-1 lg:grid-cols-1';
  return 'sm:grid-cols-2 lg:grid-cols-3';
}
