import type { Firestore } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import { gatherBrief } from './brief-admin';
import { busDb } from './admin';
import { rememberShared } from './shared-context';

/**
 * Server-side execution for the assistant's SAFE tools (read-only, or the user's own private
 * memory), plus persistence of the conversation and memory. Everything here reads only what the
 * caller could already read, and writes only to the caller's own documents. The Admin SDK is used
 * because these run in a trusted route after the ID token is verified.
 */

export type ThreadMessage = { role: 'user' | 'assistant'; content: string };

/** Run one SAFE tool and return a compact text result to feed back into the model. */
/** Erase the caller's app-local assistant data (conversation + memory). Pairs with forgetShared. */
export async function forgetLocal(db: Firestore, uid: string): Promise<void> {
  const msgs = await db.collection('assistantThreads').doc(uid).collection('messages').get();
  for (const d of msgs.docs) await d.ref.delete();
  await db.collection('assistantMemory').doc(uid).delete().catch(() => {});
}

/** The caller's GitHub handle — the cross-app key. Null if we never learned it (no shared layer). */
export async function getHandle(db: Firestore, uid: string): Promise<string | null> {
  const snap = await db.collection('profiles').doc(uid).get();
  return snap.exists ? ((snap.data()?.githubLogin as string | null) ?? (snap.data()?.handle as string | null) ?? null) : null;
}

export async function runSafeTool(
  db: Firestore,
  uid: string,
  name: string,
  input: Record<string, unknown>,
  nowMs: number,
  handle: string | null,
): Promise<string> {
  if (name === 'catch_me_up') {
    const brief = await gatherBrief(db, uid, nowMs);
    const lines = brief.items.map((it) => `- ${it.text}`);
    return [...(lines.length ? lines : ['- Nothing needs you right now.']), brief.quiet].join('\n');
  }

  if (name === 'my_commitments') {
    const snap = await db.collection('commitments').where('authorUid', '==', uid).where('status', '==', 'open').get();
    if (snap.empty) return 'You have no open commitments.';
    return snap.docs
      .map((d) => {
        const due = d.data().dueAt as number | null;
        return `- ${d.data().text}${due ? ` (due ${new Date(due).toISOString().slice(0, 10)})` : ''}`;
      })
      .join('\n');
  }

  if (name === 'find_teammate') {
    const q = String(input.query ?? '').toLowerCase().trim();
    if (!q) return 'No query given.';
    const snap = await db.collection('profiles').limit(200).get();
    const hits = snap.docs
      .map((d) => d.data())
      .filter((p) => p.uid !== uid)
      .filter((p) => `${p.displayName ?? ''} ${p.githubLogin ?? p.handle ?? ''}`.toLowerCase().includes(q))
      .slice(0, 8)
      .map((p) => `- ${p.displayName ?? 'member'}${p.githubLogin ? ` (@${p.githubLogin})` : ''}`);
    return hits.length ? hits.join('\n') : `No teammate matches "${q}".`;
  }

  if (name === 'summarize_channel') {
    const wanted = String(input.channel ?? '').replace(/^#/, '').toLowerCase().trim();
    const chSnap = await db.collection('channels').where('memberUids', 'array-contains', uid).get();
    const ch = chSnap.docs.find((d) => String(d.data().name ?? '').toLowerCase() === wanted || d.id === wanted);
    if (!ch) return `You're not in a channel called "${wanted}" (or it doesn't exist). Only channels you belong to can be read.`;
    const msgs = await ch.ref.collection('messages').orderBy('createdAt', 'desc').limit(80).get();
    const names = await profileNames(db);
    const transcript = msgs.docs
      .reverse()
      .filter((m) => !m.data().parentId)
      .map((m) => `${names.get(m.data().authorUid) ?? 'member'}: ${m.data().body}`)
      .join('\n');
    return transcript
      ? `Recent messages in #${ch.data().name} (oldest first):\n${transcript}`
      : `#${ch.data().name} has no messages yet.`;
  }

  if (name === 'remember') {
    const note = String(input.note ?? '').trim().slice(0, 280);
    if (!note) return 'Nothing to remember.';
    // Local (uid-scoped) memory always works. When we know the handle, ALSO write to the shared
    // cross-app bus so the user's other apps' agents see it too — one shared brain.
    await db.collection('assistantMemory').doc(uid).set(
      { notes: FieldValue.arrayUnion(note), updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
    let shared = false;
    if (handle) {
      const bus = busDb();
      if (bus) shared = await rememberShared(bus, handle, note, nowMs);
    }
    return `Saved to memory${shared ? ' (shared across your apps)' : ''}: "${note}"`;
  }

  return `Unknown tool: ${name}`;
}

async function profileNames(db: Firestore): Promise<Map<string, string>> {
  const snap = await db.collection('profiles').limit(300).get();
  const m = new Map<string, string>();
  for (const d of snap.docs) m.set(d.id, (d.data().displayName as string) ?? 'member');
  return m;
}

/** Durable memory notes the assistant has saved about the user. */
export async function loadMemory(db: Firestore, uid: string): Promise<string[]> {
  const doc = await db.collection('assistantMemory').doc(uid).get();
  return doc.exists ? ((doc.data()?.notes as string[]) ?? []) : [];
}

/** The last `limit` conversation turns, oldest first, for model context + display continuity. */
export async function loadThread(db: Firestore, uid: string, limit = 20): Promise<ThreadMessage[]> {
  const snap = await db
    .collection('assistantThreads').doc(uid).collection('messages')
    .orderBy('createdAt', 'desc').limit(limit).get();
  return snap.docs
    .reverse()
    .map((d) => ({ role: d.data().role as 'user' | 'assistant', content: d.data().content as string }));
}

/**
 * Persist one exchange: the user's message and the assistant's reply (with any proposals).
 * Uses explicit numeric timestamps (nowMs, nowMs+1) so the user turn always sorts before the
 * reply — a single serverTimestamp() for both could tie and render out of order.
 */
export async function saveTurn(
  db: Firestore,
  uid: string,
  userText: string,
  assistantText: string,
  proposals: unknown[],
  nowMs: number,
): Promise<void> {
  const col = db.collection('assistantThreads').doc(uid).collection('messages');
  await col.add({ role: 'user', content: userText, createdAt: nowMs });
  await col.add({ role: 'assistant', content: assistantText, proposals: proposals ?? [], createdAt: nowMs + 1 });
}
