/** Static cohort roster — client-safe (no Node imports). */

export type RosterEntry = {
  handle: string;
  displayName?: string;
  status: 'active' | 'stub';
  headline: string;
  photoPath?: string;
  location?: string;
  skills?: string[];
  /** Default public; opt-out shows a private placeholder at /p/{handle}. */
  privacy?: 'public' | 'private';
  /** Participant sets via /join PR — default false; never preset by maintainers. */
  availableForEngagement?: boolean;
  links: { github?: string; site?: string; linkedin?: string; blog?: string };
};

/** Hand-edited roster — extend via PR (see /join). */
export const roster: RosterEntry[] = [
  {
    handle: 'ryanroper79-alt',
    displayName: 'Ryan R. Roper',
    status: 'active',
    headline:
      'Summer Pilot 2026 participant — climate software for Caribbean and SIDS grid resilience.',
    links: {
      github: 'https://github.com/ryanroper79-alt',
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
    headline: 'Summer Pilot 2026 participant — cohort program maintainer and operator.',
    links: { github: 'https://github.com/rogerSuperBuilderAlpha' },
  },
  {
    handle: 'studmuffin01',
    status: 'stub',
    privacy: 'private',
    headline: 'Private profile — enrolled participant opted out of public bio.',
    links: { github: 'https://github.com/studmuffin01' },
  },
];

function titleCaseHandle(handle: string) {
  return handle.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function isAvailableForEngagement(handle: string): boolean {
  const entry = roster.find((r) => r.handle.toLowerCase() === handle.toLowerCase());
  return entry?.availableForEngagement === true;
}

/** Participant picker options for forms (handle + display name only). */
export const participantPickerOptions = roster.map((entry) => ({
  handle: entry.handle,
  displayName: entry.displayName ?? titleCaseHandle(entry.handle),
}));
