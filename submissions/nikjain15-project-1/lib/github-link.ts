'use client';

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { GitHubLink } from './types';

/**
 * The consent record, and every promise the consent screen made.
 *
 * /connect tells people three things: you can turn it off, you can make it ask first, and
 * you can delete anything it posted. Each one has to be reachable from /settings or the
 * consent screen was a trick. That's why these ship together.
 */

export function subscribeToLink(uid: string, onData: (link: GitHubLink | null) => void): () => void {
  return onSnapshot(doc(db, 'githubLinks', uid), (snap) =>
    onData(snap.exists() ? (snap.data() as GitHubLink) : null)
  );
}

/**
 * Record what they chose at /connect. `handle` is the GitHub login and nothing else.
 *
 * narrationOptIn is written HERE, keyed by uid, because it has to work for the ~57 of 65
 * people who have never pushed and therefore have no handle-keyed cohortMember doc to
 * write to. Declining sets it false: consent is the only gate, and this is the record of it.
 */
export async function saveConsent(
  uid: string,
  choice: { status: GitHubLink['status']; mode: GitHubLink['mode']; handle: string | null }
): Promise<void> {
  const consented = choice.status === 'connected';

  await setDoc(
    doc(db, 'githubLinks', uid),
    {
      uid,
      handle: choice.handle ?? '',
      status: choice.status,
      mode: choice.mode,
      narrationOptIn: consented,
      createTasksFromBranches: consented,
      excludedRepos: [],
      connectedAt: serverTimestamp(),
      lastSyncedAt: null,
    },
    { merge: true }
  );

  // Mirror onto the public doc when one exists. Best-effort by design: someone who has
  // never pushed has no cohortMember doc, and that must not fail their consent — the sync
  // carries it forward from here when the doc is first created.
  if (consented && choice.handle) {
    await setNarrationOptIn(choice.handle, true).catch(() => {});
  }
}

export async function setMode(uid: string, mode: GitHubLink['mode']): Promise<void> {
  await updateDoc(doc(db, 'githubLinks', uid), { mode });
}

/**
 * The publish switch. Off means sensing runs and nothing is published — NOT disconnected.
 *
 * Writes the uid-keyed record first (it always exists and is the authority), then mirrors
 * to the public doc. Turning off must never depend on the mirror succeeding, or someone
 * without a cohortMember doc could not turn it off at all.
 */
export async function setNarration(
  uid: string,
  handle: string | null,
  narrationOptIn: boolean
): Promise<void> {
  await updateDoc(doc(db, 'githubLinks', uid), { narrationOptIn });
  if (handle) await setNarrationOptIn(handle, narrationOptIn).catch(() => {});
}

export async function setCreateTasksFromBranches(uid: string, value: boolean): Promise<void> {
  await updateDoc(doc(db, 'githubLinks', uid), { createTasksFromBranches: value });
}

export async function setExcludedRepos(uid: string, excludedRepos: string[]): Promise<void> {
  await updateDoc(doc(db, 'githubLinks', uid), { excludedRepos });
}

/**
 * Record that a sync completed.
 *
 * This is what ends the backfill. `lastSyncedAt: null` means "Pulse has never looked at
 * this member", and the first pass lands their whole PR history on the board silently —
 * old merges are not news. Stamping this promotes every later run to logging real
 * transitions, so it may only ever be written after a sync that actually succeeded.
 */
export async function markSynced(uid: string): Promise<void> {
  await updateDoc(doc(db, 'githubLinks', uid), { lastSyncedAt: serverTimestamp() });
}

/**
 * The narration gate. Only the member it describes may flip it, and the rules enforce that
 * — a model may not write a sentence about someone who hasn't asked for it.
 *
 * Keyed by handle because cohortMembers is indexed by GitHub login: it exists before the
 * person ever signs up.
 */
export async function setNarrationOptIn(handle: string, narrationOptIn: boolean): Promise<void> {
  await updateDoc(doc(db, 'cohortMembers', handle.toLowerCase()), { narrationOptIn });
}

/**
 * Disconnect. This is the promise that costs something to keep.
 *
 * Stops the reading, sets narrationOptIn false, and HARD-DELETES every narrative Pulse
 * ever published as this person. Their tasks and projects survive — they're leaving the
 * sensing, not the cohort.
 *
 * Deletes only rows carrying a narrative: the facts (joined, shipped, created) are the
 * cohort's shared record and are the same public record anyone could read off GitHub.
 * What's being withdrawn is the model's voice about them, which is what they consented to.
 */
export async function disconnectGitHub(uid: string, handle: string | null): Promise<number> {
  const mine = await getDocs(query(collection(db, 'pulse'), where('actorUid', '==', uid)));

  const narrated = mine.docs.filter((d) => d.data().narrative);
  await Promise.all(narrated.map((d) => deleteDoc(d.ref)));

  if (handle) {
    // Best-effort: they may have no cohortMember doc if they never pushed.
    await setNarrationOptIn(handle, false).catch(() => {});
  }

  await updateDoc(doc(db, 'githubLinks', uid), {
    status: 'revoked' as const,
    narrationOptIn: false,
    lastSyncedAt: null,
  });

  return narrated.length;
}

/** Every post Pulse made as you — so Settings can show them and let you edit or delete any. */
export function subscribeToMyPosts(
  uid: string,
  onData: (posts: { id: string; narrative: string | null; subject: string; kind: string }[]) => void
): () => void {
  return onSnapshot(query(collection(db, 'pulse'), where('actorUid', '==', uid)), (snap) =>
    onData(
      snap.docs.map((d) => ({
        id: d.id,
        narrative: d.data().narrative ?? null,
        subject: d.data().subject ?? '',
        kind: d.data().kind ?? '',
      }))
    )
  );
}
