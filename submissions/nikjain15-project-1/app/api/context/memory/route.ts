import { NextResponse } from 'next/server';
import type { Firestore } from 'firebase-admin/firestore';
import { adminDb, busDb } from '@/lib/broker-admin';
import { verifyUid, getHandle } from '@/lib/auth-server';
import { forgetShared, readSharedActivity, readSharedMemory } from '@/lib/shared-context';

export const runtime = 'nodejs';

/**
 * The user's window onto — and control over — their own shared memory and interaction history.
 * The bus is server-only, so the user can't read it directly; this route reads it back for them
 * (GET) and erases it on request (DELETE). Strictly self-scoped by verified uid → handle: you can
 * only ever see or forget your own record.
 */
export async function GET(req: Request) {
  const uid = await verifyUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const db = adminDb();
  if (!db) return NextResponse.json({ error: 'server_unavailable' }, { status: 503 });

  const handle = await getHandle(db, uid);
  if (!handle) return NextResponse.json({ handle: null, memory: [], activity: [] });

  const bus = busDb() ?? db;
  const [memory, activity] = await Promise.all([readSharedMemory(bus, handle), readSharedActivity(bus, handle)]);
  return NextResponse.json({ handle, memory, activity });
}

/** Right to be forgotten: erase the user's shared record AND their app-local agent conversation. */
export async function DELETE(req: Request) {
  const uid = await verifyUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const db = adminDb();
  if (!db) return NextResponse.json({ error: 'server_unavailable' }, { status: 503 });

  const handle = await getHandle(db, uid);
  const bus = busDb() ?? db;
  const removed = handle ? await forgetShared(bus, handle) : 0;
  await forgetLocal(db, uid);
  return NextResponse.json({ ok: true, removed });
}

/** Erase Pulse's own agent conversation for this user — the Ask Pulse transcript (askThreads/{uid}).
 *  The shared bus is handled separately by forgetShared; this is the local half of "forget me". */
async function forgetLocal(db: Firestore, uid: string): Promise<void> {
  const turns = await db.collection('askThreads').doc(uid).collection('turns').get();
  await Promise.all(turns.docs.map((d) => d.ref.delete()));
}
