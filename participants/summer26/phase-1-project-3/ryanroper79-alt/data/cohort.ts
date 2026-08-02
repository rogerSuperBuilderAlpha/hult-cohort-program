/** Cohort-first positioning — commercial content lives at cealgreen.com only. */

export const positioning = {
  cohortMark: 'Hult Cohort · Summer Pilot 2026',
  eyebrow: 'Hult Cohort · Summer Pilot 2026 · Week 3',
  headline:
    'CARICOM committed to 47% renewable electricity by 2027. The region is at roughly 12%. Closing that gap needs local software as much as local megawatts.',
  subhead:
    'This cohort ships deployable software against real Caribbean and Small Island Developing State infrastructure problems, in one-week cycles, in public. Every claim below links to a deploy, a pull request, or a commit.',
  sourceNote:
    'CARICOM Regional Energy Policy / C-SERMS targets: 20% (2017), 28% (2022), 47% (2027). Current regional penetration per Climate Analytics, 2025.',
  productionDomain: 'https://cealgreen-projects.vercel.app',
  cealGreenUrl: 'https://www.cealgreen.com',
  maintainer: {
    name: 'Ryan R. Roper',
    githubHandle: 'ryanroper79-alt',
    githubUrl: 'https://github.com/ryanroper79-alt',
  },
  brand: {
    logoPath: '/brand/ceal-green-logo.png',
  },
  /** Shareable vote link for cohort peer review week */
  votePath: '/vote',
  joinPath: '/join',
} as const;

/** Verified proof inventory — add only real, gathered values. */
export const proofInventory = {
  cohortTerm: 'Summer Pilot 2026',
  programWeek: 3,
  submissionPrUrl:
    'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/186',
  productionUrl: 'https://cealgreen-projects.vercel.app',
} as const;
