/** Positioning + cohort facts — hand-edited, no runtime fetch. */

import { brandFoundation, brandGuidelinesUrl } from './brand-guidelines';
import { thoughtLeader } from './thought-leader';

export const positioning = {
  thesis:
    'Energy sovereignty requires digital sovereignty. The Caribbean cannot close the Green Gap by importing every watt and every line of code — it builds local capability, in public.',
  belief:
    'This cohort builds deployable software against real Caribbean infrastructure problems, in weeks — practitioners who understand the region because they work inside it.',
  partnerAsk: 'Request a feasibility report — choose a Caribbean project',
  contact: 'ryan@cealgreen.com',
  contactLabel: 'CEAL Green — ryan@cealgreen.com',
  contactHref: 'mailto:ryan@cealgreen.com',
  productionDomain: 'https://cealgreen-projects.vercel.app',
  brand: {
    name: 'CEAL Green',
    guidelinesUrl: brandGuidelinesUrl,
    focus:
      'Positivity, energy sovereignty for the Caribbean, and leveraging the region\'s natural resources to promote energy and digital transformation.',
    paletteNote:
      'Mangrove green, sun yellow, white — from CEAL Green logo. Full visual spec pending Brand Guidelines §5.',
    logoPath: '/brand/ceal-green-logo.png',
    /** Cohort site framing under CEAL Green sponsor voice */
    sponsorLine: brandFoundation.coreProposition,
    executionLine: 'We do not stay at concept level. We build.',
  },
  thoughtLeader,
} as const;

/** Verified proof inventory — add only real, gathered values. */
export const proofInventory = {
  cohortTerm: 'Summer Pilot 2026',
  programWeek: 3,
  submissionPrUrl:
    'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/186',
  productionUrl: 'https://cealgreen-projects.vercel.app',
  gitDeployVerified: '2026-07-30',
  activeProfileCount: 1,
  pendingProfileCount: 2,
} as const;
