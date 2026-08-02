export type ChangelogEntry = {
  date: string;
  title: string;
  summary: string;
  href?: string;
};

/** Shipped during review week — evidence that the platform is operated, not abandoned. */
export const changelog: ChangelogEntry[] = [
  {
    date: '2026-08-01',
    title: 'Phase 0 — cohort-first pivot',
    summary:
      'Hero, ledger, profiles, partners README, experts, vote link. Removed commercial/investor funnel from on-site surfaces.',
    href: '/work',
  },
  {
    date: '2026-08-02',
    title: 'Phase 1 — live verification',
    summary: 'Status chips on /work query GitHub PR state and deploy HEAD checks via /api/verify (10-minute cache).',
    href: '/api/verify',
  },
  {
    date: '2026-08-02',
    title: 'Submission complete — RSVP, privacy, reviewer docs',
    summary:
      'Showcase RSVP, private profile opt-out, README/REVIEWER/SUBMISSION_PR, vote template aligned to peer review rubric.',
    href: '/vote',
  },
];
