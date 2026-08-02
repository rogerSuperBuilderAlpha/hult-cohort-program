import { cache } from 'react';
import { cohortId } from '@/lib/cohort-config';
import { getExpectationsAcknowledgment } from '@/lib/expectations-ack-server';
import { githubProfileUrl } from '@/lib/github-urls';
import { isAdminConfigured } from '@/lib/firebase/admin';
import { rosterMemberRef } from '@/lib/firestore-paths';
import { getAdminDb } from '@/lib/firebase/admin';
import { getActiveRosterHandles } from '@/lib/roster-handles-server';
import { getParticipantSubmissionsResolved } from '@/lib/submissions-resolve-server';
import {
  displayNameFromHandle,
  FALLBACK_ROSTER_HANDLES,
} from '@/lib/showcase/roster-fallback';
import type { ShowcaseProfile } from '@/lib/showcase/types';

async function loadApplicationFields(
  handle: string,
  id: string
): Promise<{ firstName?: string; lastName?: string; campus?: string; bio?: string } | null> {
  if (!isAdminConfigured()) return null;
  const snap = await getAdminDb()
    .collection('applications')
    .where('githubHandle', '==', handle)
    .where('cohort', '==', id)
    .limit(1)
    .get();
  const doc = snap.docs[0];
  if (!doc) return null;
  const data = doc.data();
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    campus: data.campus,
    bio: data.motivation,
  };
}

export async function listShowcaseHandles(): Promise<string[]> {
  const id = cohortId();
  if (isAdminConfigured()) {
    try {
      const handles = await getActiveRosterHandles(id);
      if (handles.length > 0) return handles.sort();
    } catch {
      /* fall through */
    }
  }
  return [...FALLBACK_ROSTER_HANDLES].sort();
}

export const getShowcaseProfile = cache(async (handle: string): Promise<ShowcaseProfile | null> => {
  const normalized = handle.trim().toLowerCase();
  const handles = await listShowcaseHandles();
  if (!handles.some((h) => h.toLowerCase() === normalized)) return null;

  const id = cohortId();
  const canonicalHandle = handles.find((h) => h.toLowerCase() === normalized) ?? normalized;

  let displayName = displayNameFromHandle(canonicalHandle);
  let campus: string | null = null;
  let bio: string | null = null;
  let isPrivate = false;

  if (isAdminConfigured()) {
    const [rosterDoc, appFields, ack] = await Promise.all([
      rosterMemberRef(id, canonicalHandle).get(),
      loadApplicationFields(canonicalHandle, id),
      getExpectationsAcknowledgment(canonicalHandle, id),
    ]);

    if (rosterDoc.exists) {
      const roster = rosterDoc.data();
      if (roster?.displayName) displayName = roster.displayName;
      if (roster?.campus) campus = roster.campus;
    }

    if (appFields) {
      if (appFields.firstName && appFields.lastName) {
        displayName = `${appFields.firstName} ${appFields.lastName}`;
      }
      if (appFields.campus) campus = appFields.campus;
      if (appFields.bio) bio = appFields.bio;
    }

    isPrivate = ack?.showcaseOptOut === true;
  }

  const submissions = isPrivate
    ? []
    : await getParticipantSubmissionsResolved(id, canonicalHandle).catch(() => []);

  return {
    handle: canonicalHandle,
    displayName,
    campus,
    bio,
    githubUrl: githubProfileUrl(canonicalHandle),
    photoUrl: `https://github.com/${canonicalHandle}.png`,
    isPrivate,
    submissions,
  };
});

export async function listShowcaseProfiles(): Promise<ShowcaseProfile[]> {
  const handles = await listShowcaseHandles();
  const profiles = await Promise.all(handles.map((h) => getShowcaseProfile(h)));
  return profiles.filter((p): p is ShowcaseProfile => p !== null);
}
