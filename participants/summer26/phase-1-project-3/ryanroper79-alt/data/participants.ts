import fs from 'node:fs';
import path from 'node:path';
import { entriesForHandle } from '@/data/ledger';

export type Participant = {
  handle: string;
  displayName: string;
  status: 'active' | 'stub';
  headline: string;
  avatarUrl?: string;
  links: { github?: string; site?: string; linkedin?: string; blog?: string };
};

type RosterEntry = {
  handle: string;
  displayName?: string;
  status: 'active' | 'stub';
  headline: string;
  links: Participant['links'];
};

/** Hand-edited roster — extend via PR to data/participants.ts (see /join). */
const roster: RosterEntry[] = [
  {
    handle: 'ryanroper79-alt',
    displayName: 'Ryan R. Roper',
    status: 'active',
    headline:
      'Twenty years on major Caribbean energy projects. Building cohort infrastructure and native AI tooling in public.',
    links: {
      github: 'https://github.com/ryanroper79-alt',
      linkedin: 'https://www.linkedin.com/in/ryanroper1/',
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

function normalizeParticipant(
  entry: RosterEntry,
  github?: { name?: string | null; bio?: string | null; avatar_url?: string; blog?: string },
): Participant {
  const displayName = entry.displayName ?? github?.name ?? titleCaseHandle(entry.handle);
  const headline =
    entry.headline === 'Summer Pilot 2026 participant' || !entry.headline
      ? github?.bio?.trim() || entry.headline || 'Summer Pilot 2026 participant'
      : entry.headline;

  return {
    handle: entry.handle,
    displayName,
    status: entry.status,
    headline,
    avatarUrl: github?.avatar_url,
    links: {
      ...entry.links,
      blog: entry.links.blog ?? github?.blog ?? undefined,
    },
  };
}

let githubCache: Record<
  string,
  { name?: string | null; bio?: string | null; avatar_url?: string; blog?: string }
> = {};

const cacheFile = path.join(process.cwd(), '.cache', 'github-profiles.json');
if (fs.existsSync(cacheFile)) {
  githubCache = JSON.parse(fs.readFileSync(cacheFile, 'utf8')) as typeof githubCache;
}

export const participants: Participant[] = roster.map((entry) =>
  normalizeParticipant(entry, githubCache[entry.handle.toLowerCase()]),
);

export function getParticipant(handle: string) {
  return participants.find((p) => p.handle.toLowerCase() === handle.toLowerCase());
}

export function allHandles() {
  return participants.map((p) => p.handle);
}

export function participantProjects(handle: string) {
  return entriesForHandle(handle);
}

export const participantsEditUrl =
  'https://github.com/ryanroper79-alt/hult-cohort-program/edit/participants/summer26/phase-1-project-3/ryanroper79-alt/data/participants.ts';
