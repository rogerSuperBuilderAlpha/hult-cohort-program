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
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Evidence, PulseEvent, PulseKind } from './types';

type NewPulse = {
  kind: PulseKind;
  actorUid: string;
  actorName: string;
  actorPhotoURL: string | null;
  subject: string;
  projectId?: string | null;
  taskId?: string | null;
  /**
   * Model-written, and optional on purpose: omitting it publishes FACTS ONLY.
   *
   * That is the correct default and the safe failure mode. A member who hasn't opted into
   * narration never gets one, and a narrative that fails checkNarrative is dropped here
   * silently rather than published.
   */
  narrative?: string | null;
  evidence?: Evidence | null;
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
      narrative: event.narrative ?? null,
      evidence: event.evidence ?? null,
      editedAt: null,
      kudos: [],
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('pulse: failed to log event', err);
  }
}

/**
 * Append an event at most ONCE, addressed by a caller-derived id.
 *
 * `logPulse` uses `addDoc` — a fresh id every call — which is correct for a genuinely new
 * event (a project created, a member joined). But a STATUS transition can be fired twice
 * for the same work: two tabs each hold a pre-ship snapshot, both pass
 * `setTaskStatus`'s stale-snapshot guard, and both announce the same ship into 64 feeds.
 *
 * Keying the event by the work it describes (`ship_<taskId>`) and creating it inside a
 * transaction makes the second writer a no-op — the same shape that stopped twin cards in
 * `createSensedTask`. Idempotent by construction: a re-fired effect, an overlapping poll,
 * or a second device all converge on the one event.
 *
 * If the actor later deletes the post (undo is total), the derived doc is gone, so a
 * genuine re-ship recreates it — deletion doesn't permanently mute the work.
 *
 * Never throws, same as `logPulse`: a dropped feed row must not fail the action.
 */
export async function logPulseOnce(eventId: string, event: NewPulse): Promise<void> {
  try {
    await runTransaction(db, async (tx) => {
      const ref = doc(db, 'pulse', eventId);
      const existing = await tx.get(ref);
      // Another tab, device, or overlapping poll already announced this exact work.
      if (existing.exists()) return;
      tx.set(ref, {
        ...event,
        projectId: event.projectId ?? null,
        taskId: event.taskId ?? null,
        narrative: event.narrative ?? null,
        evidence: event.evidence ?? null,
        editedAt: null,
        kudos: [],
        createdAt: serverTimestamp(),
      });
    });
  } catch (err) {
    console.error('pulse: failed to log event once', err);
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
