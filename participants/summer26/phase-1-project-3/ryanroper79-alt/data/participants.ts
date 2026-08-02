import fs from 'node:fs';
import path from 'node:path';
import { entriesForHandle } from '@/data/ledger';
import { roster, type RosterEntry } from '@/data/roster';

export type Participant = {
  handle: string;
  displayName: string;
  status: 'active' | 'stub';
  headline: string;
  avatarUrl?: string;
  photoPath?: string;
  location?: string;
  skills?: string[];
  featured?: boolean;
  links: { github?: string; site?: string; linkedin?: string; blog?: string };
};

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
    photoPath: entry.photoPath,
    location: entry.location,
    skills: entry.skills,
    featured: entry.featured,
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
