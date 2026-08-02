/** Static cohort roster — client-safe (no Node imports). */

export type RosterEntry = {
  handle: string;
  displayName?: string;
  status: 'active' | 'stub';
  headline: string;
  photoPath?: string;
  location?: string;
  skills?: string[];
  featured?: boolean;
  links: { github?: string; site?: string; linkedin?: string; blog?: string };
};

/** Hand-edited roster — extend via PR (see /join). */
export const roster: RosterEntry[] = [
  {
    handle: 'ryanroper79-alt',
    displayName: 'Ryan R. Roper',
    status: 'active',
    featured: true,
    location: 'Caribbean · CEAL Green',
    photoPath: '/builders/ryan-roper.jpg',
    headline:
      '20+ years major Caribbean project development · Harvard Business School (data analytics & AI) · engineering, digital transformation, and energy transition.',
    skills: [
      'Major project development',
      'Data analytics',
      'AI platforms',
      'Energy transition',
      'Infrastructure',
    ],
    links: {
      github: 'https://github.com/ryanroper79-alt',
      linkedin: 'https://www.linkedin.com/in/ryanroper1/',
      site: 'https://www.cealgreen.com',
    },
  },
  {
    handle: 'CodingWCal',
    status: 'stub',
    headline: 'Summer Pilot 2026 participant — Forth PM platform operator.',
    links: { github: 'https://github.com/CodingWCal' },
  },
  {
    handle: 'ramyatolety',
    status: 'stub',
    headline: 'Summer Pilot 2026 participant — Waypoint, Beacon, and Lighthouse builds.',
    links: { github: 'https://github.com/RamyaTolety' },
  },
  {
    handle: 'raven-dubgub',
    status: 'stub',
    headline: 'Summer Pilot 2026 participant — showcase and comms platform builds.',
    links: { github: 'https://github.com/RAVEN-dubgub' },
  },
  {
    handle: 'r3s0lv343vr',
    status: 'stub',
    headline: 'Summer Pilot 2026 participant — vibe marketing and cohort tooling.',
    links: { github: 'https://github.com/r3s0lv343vr' },
  },
  {
    handle: 'priyanshshahh',
    status: 'stub',
    headline: 'Summer Pilot 2026 participant — Shiplog cohort showcase.',
    links: { github: 'https://github.com/priyanshshahh' },
  },
  {
    handle: 'joes9987',
    status: 'stub',
    headline: 'Summer Pilot 2026 participant — showcase with people index and partner flows.',
    links: { github: 'https://github.com/joes9987' },
  },
  {
    handle: 'kureen-cyber',
    status: 'stub',
    headline: 'Summer Pilot 2026 participant — Banter and Banterfolio builds.',
    links: { github: 'https://github.com/kureen-cyber' },
  },
  {
    handle: 'gge513',
    status: 'stub',
    headline: 'Summer Pilot 2026 participant — Latent vibe marketing platform.',
    links: { github: 'https://github.com/gge513' },
  },
  {
    handle: 'rogersuperbuilderalpha',
    status: 'stub',
    headline: 'Summer Pilot 2026 participant — cohort program maintainer and builder.',
    links: { github: 'https://github.com/rogerSuperBuilderAlpha' },
  },
  {
    handle: 'studmuffin01',
    status: 'stub',
    headline: 'Summer Pilot 2026 participant — linked cohort stack studio showcase.',
    links: { github: 'https://github.com/studmuffin01' },
  },
];

function titleCaseHandle(handle: string) {
  return handle.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Builder picker options for client forms (handle + display name only). */
export const builderPickerOptions = roster.map((entry) => ({
  handle: entry.handle,
  displayName: entry.displayName ?? titleCaseHandle(entry.handle),
}));
