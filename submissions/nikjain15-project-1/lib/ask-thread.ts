'use client';

import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * The Ask Pulse agent's memory — the running conversation, per user.
 *
 * Stored under `askThreads/{uid}/turns`, readable and writable by that member ALONE (see
 * firestore.rules). It is the agent panel's transcript: your commands and Pulse's replies,
 * so the panel remembers everything across visits, and so recent turns can be handed back to
 * the planner as context. Nobody else's business — it can name your own tasks and quote
 * Pulse's answers about your own board.
 */

export type TurnRole = 'you' | 'pulse';

export type Turn = {
  id: string;
  role: TurnRole;
  /** The user's utterance, or Pulse's answer / a summary of what it did. */
  text: string;
  createdAt: Timestamp | null;
};

/** How many turns the panel keeps in view and hands back as context — bounded for cost. */
export const THREAD_LIMIT = 50;

/** Live transcript, oldest → newest. Realtime, like the feed. Returns an unsubscribe. */
export function subscribeToThread(uid: string, cb: (turns: Turn[]) => void): () => void {
  const q = query(
    collection(db, 'askThreads', uid, 'turns'),
    orderBy('createdAt', 'asc'),
    limit(THREAD_LIMIT)
  );
  return onSnapshot(
    q,
    (snap) => {
      const turns: Turn[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          role: data.role === 'pulse' ? 'pulse' : 'you',
          text: typeof data.text === 'string' ? data.text : '',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
        };
      });
      cb(turns);
    },
    () => cb([]) // a listener error just means an empty transcript, never a crash
  );
}

/** Append one turn; returns its doc id (so the panel can hide the just-written turn behind
 *  its live view and avoid rendering it twice). Best-effort: a failed write costs a line of
 *  history, never the action. */
export async function appendTurn(uid: string, role: TurnRole, text: string): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    const ref = await addDoc(collection(db, 'askThreads', uid, 'turns'), {
      role,
      text: trimmed.slice(0, 1000),
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch {
    return null;
  }
}
