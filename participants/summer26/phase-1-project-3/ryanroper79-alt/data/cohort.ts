/** Cohort-first positioning — Climate Builder Network (Project 3 scope freeze). */

export const positioning = {
  cohortMark: 'Hult Cohort - Climate Builder Network',
  siteTitle: 'Hult Cohort - Climate Builder Network',
  eyebrow: 'Hult Cohort · Summer Pilot 2026 · Climate software',
  headline:
    'Digital participants solving climate problems for the Caribbean and global Small Island Developing States.',
  subhead:
    'This platform indexes deployable software shipped in public against real island grid, resilience, and adaptation challenges. Every entry links to evidence — a deploy, a pull request, or an honest not-yet-indexed marker. We score artifacts, never people.',
  sourceNote:
    'CARICOM regional renewable targets and current penetration gaps make local software as critical as local megawatts. Payload weight and offline behaviour are correctness issues under island bandwidth and outage conditions.',
  /** Public homepage narrative — ≥200 words (Project 3 requirement). */
  homeNarrative: `The Hult Cohort Developer Program Summer Pilot 2026 is a six-week, production-first sequence. Participants ship real platforms the cohort depends on: a project-management system in Week 1, an internal communications workspace in Week 2, and this public showcase in Week 3. Every submission is a merged pull request with a live HTTPS deploy. Peers file written GitHub reviews during review week, then cast optional upvotes. Winners operate infrastructure for the rest of the pilot; everyone else contributes pull requests to the winning stacks.

This site is the Climate Builder Network index: a public ledger of climate and resilience software aimed at the Caribbean and global Small Island Developing States. We publish participant profiles, cross-link Week 1–3 deploy evidence, and run automated quality checks against artifact URLs — Lighthouse categories, mobile time-to-interactive, and transfer weight — because island bandwidth and outage conditions make payload discipline a correctness issue, not a polish issue. We never rank people or publish per-person scores.

Partners and hiring managers can inspect /work before requesting a cohort introduction. Participants control their own visibility: private opt-out profiles remain listed for roster honesty, and the availableForEngagement flag defaults to false until a participant sets it via the self-serve PR flow on /join. Nothing on this surface is a marketplace, securities offer, or pricing page — it is evidence in public for the cohort and its peers.`,
  productionDomain: 'https://cealgreen-projects.vercel.app',
  programRepo: 'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program',
  maintainer: {
    githubHandle: 'ryanroper79-alt',
    githubUrl: 'https://github.com/ryanroper79-alt',
  },
  votePath: '/vote',
  rsvpPath: '/rsvp',
  joinPath: '/join',
} as const;

export const showcaseEvent = {
  title: 'End-of-pilot cohort showcase',
  when: 'Week 6 · August 2026 · Virtual + campus',
  description:
    'Meet participants, inspect live deploys, and review the cross-cohort work ledger.',
} as const;

export const proofInventory = {
  cohortTerm: 'Summer Pilot 2026',
  programWeek: 3,
  submissionPrUrl:
    'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/186',
  syncPrUrl:
    'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/201',
  productionUrl: 'https://cealgreen-projects.vercel.app',
  buildRepo:
    'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/tree/participants/summer26/phase-1-project-3/ryanroper79-alt',
} as const;
