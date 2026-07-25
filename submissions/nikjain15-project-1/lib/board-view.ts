'use client';

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { findPreset, isWellFormed, type BoardView, type WorkflowColumn } from './workflows';

/**
 * The user's private board view — their chosen workflow lanes and where each card sits within
 * them. See lib/workflows.ts for the model. Stored as ONE doc at `boardViews/{uid}`, readable
 * and writable by that member ALONE (firestore.rules), exactly like githubLinks/briefs.
 *
 * Nothing here is shared. A card's canonical `status` is the one shared truth and lives on the
 * task; the lane it shows in is a private lens and lives here. So switching your workflow, or
 * dragging a card between two lanes of the same status, changes nothing anyone else can see.
 *
 * Every write is best-effort and self-healing: a malformed doc, or one that predates a preset,
 * degrades to the classic three-column board (`columnsOrDefault`), never to a broken screen.
 */

function coerce(data: Record<string, unknown> | undefined): BoardView | null {
  if (!data) return null;
  const preset = typeof data.preset === 'string' ? data.preset : 'custom';
  const columns = Array.isArray(data.columns)
    ? (data.columns.filter(
        (c): c is WorkflowColumn =>
          typeof c === 'object' &&
          c !== null &&
          typeof (c as WorkflowColumn).id === 'string' &&
          typeof (c as WorkflowColumn).label === 'string' &&
          ((c as WorkflowColumn).status === 'todo' ||
            (c as WorkflowColumn).status === 'in_progress' ||
            (c as WorkflowColumn).status === 'done')
      ) as WorkflowColumn[])
    : [];
  // Placement is a flat map of taskId -> lane id; drop anything that isn't a string pair.
  const placement: Record<string, string> = {};
  if (data.placement && typeof data.placement === 'object') {
    for (const [k, v] of Object.entries(data.placement as Record<string, unknown>)) {
      if (typeof v === 'string') placement[k] = v;
    }
  }
  if (!isWellFormed(columns)) return null; // a broken set falls back to classic downstream
  return { preset, columns, placement };
}

/** Live subscription to the user's board view. `null` means "no workflow chosen" — the caller
 *  renders the classic board. Returns an unsubscribe. A listener error yields `null`, never a
 *  throw. */
export function subscribeToBoardView(uid: string, cb: (view: BoardView | null) => void): () => void {
  return onSnapshot(
    doc(db, 'boardViews', uid),
    (snap) => cb(coerce(snap.exists() ? (snap.data() as Record<string, unknown>) : undefined)),
    () => cb(null)
  );
}

/** Switch to a preset (by id or spoken name), resetting lane placements — a fresh workflow
 *  starts every card in the first lane of its status. Returns the preset's display name, or
 *  null if the name matched nothing (the caller says so plainly). */
export async function setWorkflowPreset(uid: string, nameOrId: string): Promise<string | null> {
  const preset = findPreset(nameOrId);
  if (!preset) return null;
  try {
    await setDoc(doc(db, 'boardViews', uid), {
      preset: preset.id,
      columns: preset.columns,
      placement: {},
    });
    return preset.name;
  } catch {
    return null;
  }
}

/** Record which lane a card sits in, for THIS user only. Merges into the placement map so
 *  other cards' placements are untouched. Best-effort — a failed write just leaves the card in
 *  its previous lane. Status changes never come through here; they go through setTaskStatus. */
export async function placeCard(uid: string, taskId: string, laneId: string): Promise<void> {
  try {
    await setDoc(doc(db, 'boardViews', uid), { placement: { [taskId]: laneId } }, { merge: true });
  } catch {
    /* the lens just keeps the old placement — nothing shared was at stake */
  }
}
