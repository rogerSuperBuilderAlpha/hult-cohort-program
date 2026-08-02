/** Cross-cohort build ledger — honest URLs only; missing fields stay unindexed. */

export type LedgerStatus = 'merged' | 'open' | 'submitted' | 'not-indexed';

export type LedgerEntry = {
  week: 1 | 2 | 3;
  handle: string;
  projectSlug: string;
  title: string;
  summary: string;
  deployUrl?: string;
  prUrl?: string;
  prNumber?: number;
  status: LedgerStatus;
  /** Week 1 / 2 operating infrastructure (featured on /work) */
  featured?: boolean;
};

export const ledgerEntries: LedgerEntry[] = [
  // Week 1 — PM platform (operating infrastructure)
  {
    week: 1,
    handle: 'CodingWCal',
    projectSlug: 'forth',
    title: 'Forth — cohort PM platform',
    summary:
      'Guild-based project management with Firebase auth, WIP limits, and proof ledger — operating cohort infrastructure.',
    deployUrl: 'https://forth-bice.vercel.app',
    prUrl: 'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/tree/main/submissions/CodingWCal-project-1.md',
    status: 'merged',
    featured: true,
  },
  {
    week: 1,
    handle: 'ramyatolety',
    projectSlug: 'waypoint',
    title: 'Waypoint — PM platform',
    summary: 'Alternative PM submission with cohort-scoped workspaces and reviewer onboarding.',
    deployUrl: 'https://pm-ramyatolety.vercel.app',
    status: 'submitted',
  },
  {
    week: 1,
    handle: 'joes9987',
    projectSlug: 'rally',
    title: 'Rally — PM platform',
    summary: 'Task board with cohort roster integration and deploy evidence links.',
    status: 'not-indexed',
  },
  {
    week: 1,
    handle: 'raven-dubgub',
    projectSlug: 'pm-raven',
    title: 'PM platform submission',
    summary: 'Week 1 project-management build indexed from cohort submissions.',
    status: 'not-indexed',
  },
  {
    week: 1,
    handle: 'r3s0lv343vr',
    projectSlug: 'pm-r3',
    title: 'PM platform submission',
    summary: 'Week 1 project-management build indexed from cohort submissions.',
    status: 'not-indexed',
  },
  {
    week: 1,
    handle: 'priyanshshahh',
    projectSlug: 'pm-priyansh',
    title: 'PM platform submission',
    summary: 'Week 1 project-management build indexed from cohort submissions.',
    status: 'not-indexed',
  },
  {
    week: 1,
    handle: 'gge513',
    projectSlug: 'pm-gge',
    title: 'PM platform submission',
    summary: 'Week 1 project-management build indexed from cohort submissions.',
    status: 'not-indexed',
  },
  {
    week: 1,
    handle: 'kureen-cyber',
    projectSlug: 'pm-kureen',
    title: 'PM platform submission',
    summary: 'Week 1 project-management build indexed from cohort submissions.',
    status: 'not-indexed',
  },

  // Week 2 — comms platform (operating infrastructure)
  {
    week: 2,
    handle: 'ramyatolety',
    projectSlug: 'beacon',
    title: 'Beacon — cohort comms platform',
    summary:
      'Internal comms with shared identity to Forth — beacons, whispers, and War Horn broadcasts.',
    deployUrl: 'https://beacon-ramyatolety.vercel.app',
    prUrl: 'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/tree/main/submissions/ramyatolety-project-2.md',
    status: 'merged',
    featured: true,
  },
  {
    week: 2,
    handle: 'raven-dubgub',
    projectSlug: 'comms-raven',
    title: 'Cohort comms platform',
    summary: 'Week 2 internal communications workspace with email parity for unification week.',
    deployUrl: 'https://comms-raven-dubgub.vercel.app',
    status: 'submitted',
  },
  {
    week: 2,
    handle: 'gge513',
    projectSlug: 'tavern',
    title: 'Tavern — cohort comms',
    summary: 'Themed comms workspace for cohort channels and peer messaging.',
    deployUrl: 'https://tavern-cohort.vercel.app',
    status: 'submitted',
  },
  {
    week: 2,
    handle: 'joes9987',
    projectSlug: 'comms-joes',
    title: 'Cohort comms platform',
    summary: 'Week 2 communications build with Forth integration notes.',
    status: 'not-indexed',
  },
  {
    week: 2,
    handle: 'CodingWCal',
    projectSlug: 'commons',
    title: 'Commons — cohort comms',
    summary: 'Alternative comms submission for internal cohort messaging.',
    deployUrl: 'https://commons-9pxt.onrender.com',
    status: 'submitted',
  },
  {
    week: 2,
    handle: 'kureen-cyber',
    projectSlug: 'banter',
    title: 'Banter — cohort comms',
    summary: 'Comms platform with cohort channel model.',
    deployUrl: 'https://banter-kureen-cyber.vercel.app',
    status: 'submitted',
  },
  {
    week: 2,
    handle: 'r3s0lv343vr',
    projectSlug: 'comms-r3',
    title: 'Cohort comms platform',
    summary: 'Week 2 internal communications build.',
    status: 'not-indexed',
  },
  {
    week: 2,
    handle: 'priyanshshahh',
    projectSlug: 'comms-priyansh',
    title: 'Cohort comms platform',
    summary: 'Week 2 internal communications build.',
    status: 'not-indexed',
  },

  // Week 3 — vibe marketing / showcase
  {
    week: 3,
    handle: 'ryanroper79-alt',
    projectSlug: 'cealgreen-showcase',
    title: 'Vibe marketing platform',
    summary:
      'Cohort-first showcase with cross-cohort ledger, profiles, partner README, and join surface.',
    deployUrl: 'https://cealgreen-projects.vercel.app',
    prUrl: 'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/186',
    prNumber: 186,
    status: 'open',
  },
  {
    week: 3,
    handle: 'raven-dubgub',
    projectSlug: 'showcase-raven',
    title: 'Cohort showcase platform',
    summary: 'Public marketing surface with student profiles and partner README.',
    deployUrl: 'https://showcase-raven-dubgub.vercel.app',
    status: 'submitted',
  },
  {
    week: 3,
    handle: 'ramyatolety',
    projectSlug: 'lighthouse',
    title: 'Lighthouse — cohort showcase',
    summary: 'Evidence-first profiles and partner surface for Caribbean climate software participants.',
    deployUrl: 'https://lighthouse-ramyatolety.vercel.app',
    status: 'submitted',
  },
  {
    week: 3,
    handle: 'r3s0lv343vr',
    projectSlug: 'pixie-dust',
    title: 'Vibe marketing platform',
    summary: 'Profile studio and partner intro flow for cohort participants.',
    deployUrl: 'https://pixie-dust-cheesecake.vercel.app',
    status: 'submitted',
  },
  {
    week: 3,
    handle: 'priyanshshahh',
    projectSlug: 'shiplog',
    title: 'Shiplog — cohort showcase',
    summary: 'Ship ledger, roster, and partner engagement with GitHub sign-in.',
    deployUrl: 'https://shiplog-snowy.vercel.app',
    status: 'submitted',
  },
  {
    week: 3,
    handle: 'joes9987',
    projectSlug: 'showcase-joes',
    title: 'Cohort showcase platform',
    summary: 'People index, privacy controls, and partner evidence walkthrough.',
    deployUrl: 'https://showcase-joes9987.vercel.app',
    status: 'submitted',
  },
  {
    week: 3,
    handle: 'kureen-cyber',
    projectSlug: 'banterfolio',
    title: 'Banterfolio — vibe marketing',
    summary: 'Cohort dashboard with profiles, explore surface, and content stream.',
    deployUrl: 'https://banterfolio.vercel.app/',
    status: 'submitted',
  },
  {
    week: 3,
    handle: 'gge513',
    projectSlug: 'latent',
    title: 'Latent — vibe marketing',
    summary: 'Latent skill cards that develop when a visitor names what they need built.',
    deployUrl: 'https://latent-nu.vercel.app',
    status: 'submitted',
  },
  {
    week: 3,
    handle: 'CodingWCal',
    projectSlug: 'cursor-boston-showcase',
    title: 'Cursor Boston Showcase',
    summary: 'Production gallery, member directory, admin CRUD, and GitHub OAuth.',
    deployUrl: 'https://cursor-boston-showcase.vercel.app',
    status: 'submitted',
  },
  {
    week: 3,
    handle: 'rogersuperbuilderalpha',
    projectSlug: 'site-nine',
    title: 'Cohort showcase platform',
    summary: 'Public marketing surface for cohort participants and partners.',
    deployUrl: 'https://site-nine-rouge-68.vercel.app',
    status: 'submitted',
  },
  {
    week: 3,
    handle: 'studmuffin01',
    projectSlug: 'studio',
    title: 'Cohort studio showcase',
    summary: 'Linked cohort stack narrative with PM, comms, and showcase evidence.',
    status: 'not-indexed',
  },
];

export function featuredEntries() {
  return ledgerEntries.filter((e) => e.featured);
}

export function entriesForHandle(handle: string) {
  return ledgerEntries.filter((e) => e.handle.toLowerCase() === handle.toLowerCase());
}

export function allLedgerHandles() {
  return [...new Set(ledgerEntries.map((e) => e.handle))];
}
