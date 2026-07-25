import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin';
import { verifyUid } from '@/lib/auth-server';
import { confirmRecognition } from '@/lib/recognition-admin';
import { completeQuest } from '@/lib/quest-admin';
import { allow } from '@/lib/rate-guard';

export const runtime = 'nodejs';

/**
 * The helped peer confirms a recognition → the server writes the XP ledger entries and the
 * pulse event (clients can't). The acting uid comes from the verified ID token, never the body.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const uid = await verifyUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Cap confirms per caller: a confirm writes the XP ledger, so an unthrottled loop is an
  // XP-farming amplifier. 30/min is far above any real "confirm a teammate" rate.
  if (!allow('confirm', uid, 30, 60_000, Date.now())) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const db = adminDb();
  // The smart/points layer degrades loudly, never silently: no admin credential → 503, and
  // core comms keep working regardless.
  if (!db) return NextResponse.json({ error: 'ledger_unavailable' }, { status: 503 });

  const { id } = await ctx.params;
  const result = await confirmRecognition(db, id, uid);
  if (!result.ok) {
    const status = result.reason === 'not_found' ? 404 : 403;
    return NextResponse.json({ error: result.reason }, { status });
  }
  // Confirming acknowledges a helper — that completes the caller's "recognize a teammate" quest.
  if (!result.alreadyDone) await completeQuest(db, uid, 'recognize');
  return NextResponse.json(result);
}
