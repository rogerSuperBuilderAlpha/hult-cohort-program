export const SITE = {
  name: 'Greenularity Caribbean™',
  productName: 'CEAL Green Energy Auditor',
  tagline: 'Digitize. Decide. Decarbonize.',
  description:
    'An AI-assisted energy intelligence platform that helps Caribbean households and businesses digitize, decide and decarbonize their energy use.',
  cohort: 'CEAL Green Energy Limited',
  productionUrl:
    process.env.APP_PRODUCTION_URL?.replace(/\/$/, '') ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000',
  /** Public marketplace browse (always live) */
  marketplaceUrl:
    process.env.NEXT_PUBLIC_LUDWITT_MARKETPLACE_URL?.trim() ||
    'https://www.ludwitt.com/dashboard/marketplace',
  /** Creator app dashboard — live while marketplace listing is in draft/review */
  listingUrl:
    process.env.NEXT_PUBLIC_LUDWITT_LISTING_URL?.trim() ||
    'https://www.ludwitt.com/creator/apps/le_f020a1a048a68382b29a69',
  /** Target public slug once Ludwitt review publishes the app */
  marketplaceListingSlug: 'ceal-green-energy-auditor',
  creatorUrl:
    process.env.NEXT_PUBLIC_LUDWITT_CREATOR_URL?.trim() ||
    'https://www.ludwitt.com/creator/apps/le_f020a1a048a68382b29a69',
  cealHomeUrl: 'https://cealgreen.com',
  bookNowUrl:
    process.env.NEXT_PUBLIC_CEAL_BOOKING_URL?.trim() || 'https://cealgreen.com/book-now/',
} as const;

export function siteOrigin(): string {
  return SITE.productionUrl;
}

export const EVENT_JOIN_PATH = '/event/join?code=CEAL50-AUG15';
