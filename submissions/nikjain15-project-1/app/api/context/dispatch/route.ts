import { NextResponse } from 'next/server';
import { adminDb, busDb } from '@/lib/broker-admin';
import { verifyUid, getHandle } from '@/lib/auth-server';
import { evictExpired, hitRateLimit, type RateLimitState } from '@/lib/rate-limit';
import { dispatchTask, logSharedActivity } from '@/lib/shared-context';

export const runtime = 'nodejs';

/**
 * Cross-app hand-off: Pulse asks ANOTHER app's agent to do work, on the user's confirmation. The
 * task lands on the shared bus keyed by the user's GitHub handle; the target app claims and runs it.
 * A caller with no handle can't participate in the shared layer.
 *
 * Identity comes from the VERIFIED ID token → member handle, never from the body (the bus writes
 * with the Admin SDK, which bypasses client rules — see lib/auth-server.ts).
 */
const RATE_LIMIT = 15;
const WINDOW_MS = 60_000;
const rateStore = new Map<string, RateLimitState>();

export async function POST(req: Request) {
  const uid = await verifyUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const now = Date.now();
  evictExpired(rateStore, now, WINDOW_MS);
  if (hitRateLimit(rateStore, uid, now, RATE_LIMIT, WINDOW_MS).limited) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const db = adminDb();
  if (!db) return NextResponse.json({ error: 'server_unavailable' }, { status: 503 });

  let body: { toApp?: string; intent?: string };
  try {
    body = (await req.json()) as { toApp?: string; intent?: string };
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

  const taskId = await dispatchTask(bus, { toApp, handle, intent }, now);
  await logSharedActivity(bus, handle, 'dispatch', `asked ${toApp} to: ${intent}`, now);
  return NextResponse.json({ ok: !!taskId, taskId });
}
