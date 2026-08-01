export type Participant = {
  handle: string;
  name: string;
  status: 'active' | 'pending';
  headline: string;
  links: { github?: string; site?: string; linkedin?: string };
  projects: {
    week: 1 | 2 | 3;
    title: string;
    summary: string;
    liveUrl?: string;
    prUrl?: string;
    evidence?: string[];
  }[];
};

export const participants: Participant[] = [
  {
    handle: 'ryanroper79-alt',
    name: 'Ryan R. Roper',
    status: 'active',
    headline:
      'Twenty years on major energy projects. Now building a native AI firm through Cursor and digital platforms.',
    links: {
      github: 'https://github.com/ryanroper79-alt',
      linkedin: 'https://www.linkedin.com/in/ryanroper1/',
    },
    projects: [
      {
        week: 3,
        title: 'Vibe marketing platform',
        summary:
          'Partner-facing showcase with static profiles, project index, and live /join surface for review week.',
        liveUrl: 'https://cealgreen-projects.vercel.app',
        prUrl:
          'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/186',
      },
    ],
  },
  {
    handle: 'raven-dubgub',
    name: 'Pending',
    status: 'pending',
    headline: 'Profile publishing during review week.',
    links: { github: 'https://github.com/RAVEN-dubgub' },
    projects: [],
  },
  {
    handle: 'gge513',
    name: 'Pending',
    status: 'pending',
    headline: 'Profile publishing during review week.',
    links: { github: 'https://github.com/gge513' },
    projects: [],
  },
];

export function activeParticipants() {
  return participants.filter((p) => p.status === 'active');
}

export function pendingParticipants() {
  return participants.filter((p) => p.status === 'pending');
}

export function getParticipant(handle: string) {
  return participants.find((p) => p.handle.toLowerCase() === handle.toLowerCase());
}

export function allHandles() {
  return participants.map((p) => p.handle);
}
