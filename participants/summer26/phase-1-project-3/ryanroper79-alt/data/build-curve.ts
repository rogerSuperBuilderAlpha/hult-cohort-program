/**
 * Build curve data — verified artifacts only. Values derived from data/participants.ts
 * and proofInventory; do not add points without evidence.
 */
export type BuildCurvePoint = {
  week: 1 | 2 | 3;
  label: string;
  /** Shipped artifacts with live URL or merged PR in our data layer */
  shippedCount: number;
};

export const buildCurvePoints: BuildCurvePoint[] = [
  { week: 1, label: 'Week 1 · PM platform', shippedCount: 0 },
  { week: 2, label: 'Week 2 · Comms platform', shippedCount: 0 },
  { week: 3, label: 'Week 3 · Vibe marketing', shippedCount: 1 },
];

export const buildCurveCaption =
  'Generation curve — shipped HTTPS deploys indexed in this showcase (Week 3 live).';
