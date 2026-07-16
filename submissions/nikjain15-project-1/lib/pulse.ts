import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { PulseEvent, PulseKind } from './types';

type NewPulse = {
  kind: PulseKind;
  actorUid: string;
  actorName: string;
  actorPhotoURL: string | null;
  subject: string;
  projectId?: string | null;
  taskId?: string | null;
};

/**
 * Append to the cohort heartbeat.
 *
 * Deliberately never throws: a dropped feed entry must not fail the user action that
 * caused it. Shipping a task matters more than logging that you shipped it.
 */
export async function logPulse(event: NewPulse): Promise<void> {
  try {
    await addDoc(collection(db, 'pulse'), {
      ...event,
      projectId: event.projectId ?? null,
      taskId: event.taskId ?? null,
      kudos: [],
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('pulse: failed to log event', err);
  }
}

/**
 * Live cohort feed. Returns an unsubscribe fn.
 *
 * This is the app's core: onSnapshot pushes new events to every open client, so the
 * feed moves while you watch it rather than on refresh.
 */
export function subscribeToPulse(
  onEvents: (events: PulseEvent[]) => void,
  max = 50
): () => void {
  const q = query(collection(db, 'pulse'), orderBy('createdAt', 'desc'), limit(max));
  return onSnapshot(q, (snap) => {
    onEvents(
      snap.docs
        // Writes land locally before serverTimestamp() resolves; skip until it does
        // so the feed never flashes an event with a null time.
        .filter((d) => d.data().createdAt)
        .map((d) => ({ id: d.id, ...d.data() }) as PulseEvent)
    );
  });
}

/** Toggle kudos. arrayUnion/arrayRemove keep this safe under concurrent writers. */
export async function toggleKudos(eventId: string, uid: string, hasKudos: boolean) {
  await updateDoc(doc(db, 'pulse', eventId), {
    kudos: hasKudos ? arrayRemove(uid) : arrayUnion(uid),
  });
}
