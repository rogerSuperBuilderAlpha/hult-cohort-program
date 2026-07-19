import { NextResponse } from 'next/server';
import { adminDb, busDb } from '@/lib/admin';
import { verifyUid } from '@/lib/auth-server';
import { allow } from '@/lib/rate-guard';
import { getHandle } from '@/lib/assistant-admin';
import { dispatchTask, logSharedActivity } from '@/lib/shared-context';

export const runtime = 'nodejs';

/**
 * Cross-app hand-off: Rally asks another app's agent to do work, on the user's confirmation. The
 * task lands on the shared bus keyed by the user's GitHub handle; the target app claims and runs it.
 * A caller with no handle can't participate in the shared layer.
 */
export async function POST(req: Request) {
  const uid = await verifyUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const nowMs = Date.now();
  if (!allow('dispatch', uid, 15, 60_000, nowMs)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const db = adminDb();
  if (!db) return NextResponse.json({ error: 'ledger_unavailable' }, { status: 503 });

  let body: { toApp?: string; intent?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const toApp = (body.toApp ?? '').toString().trim().toLowerCase();
  const intent = (body.intent ?? '').toString().trim().slice(0, 500);
  if (!toApp || !intent) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });

  const handle = await getHandle(db, uid);
  if (!handle) return NextResponse.json({ error: 'no_handle' }, { status: 400 });

  const bus = busDb();
  if (!bus) return NextResponse.json({ error: 'bus_unavailable' }, { status: 503 });

  const taskId = await dispatchTask(bus, { toApp, handle, intent }, nowMs);
  await logSharedActivity(bus, handle, 'dispatch', `asked ${toApp} to: ${intent}`, nowMs);
  return NextResponse.json({ ok: !!taskId, taskId });
}
