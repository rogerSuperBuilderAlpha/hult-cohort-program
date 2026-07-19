import { NextResponse } from 'next/server';
import { adminDb, busDb } from '@/lib/admin';
import { verifyUid } from '@/lib/auth-server';
import { forgetLocal, getHandle } from '@/lib/assistant-admin';
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
  if (!db) return NextResponse.json({ error: 'ledger_unavailable' }, { status: 503 });

  const handle = await getHandle(db, uid);
  if (!handle) return NextResponse.json({ handle: null, memory: [], activity: [] });

  const bus = busDb() ?? db;
  const [memory, activity] = await Promise.all([readSharedMemory(bus, handle), readSharedActivity(bus, handle)]);
  return NextResponse.json({ handle, memory, activity });
}

/** Right to be forgotten: erase the user's shared record AND their app-local assistant data. */
export async function DELETE(req: Request) {
  const uid = await verifyUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const db = adminDb();
  if (!db) return NextResponse.json({ error: 'ledger_unavailable' }, { status: 503 });

  const handle = await getHandle(db, uid);
  const bus = busDb() ?? db;
  const removed = handle ? await forgetShared(bus, handle) : 0;
  await forgetLocal(db, uid);
  return NextResponse.json({ ok: true, removed });
}
