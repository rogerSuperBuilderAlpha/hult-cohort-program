import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin';
import { verifyUid } from '@/lib/auth-server';
import { declineRecognition } from '@/lib/recognition-admin';

export const runtime = 'nodejs';

/** The helped peer quietly declines a recognition — no points, no pulse. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const uid = await verifyUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const db = adminDb();
  if (!db) return NextResponse.json({ error: 'ledger_unavailable' }, { status: 503 });

  const { id } = await ctx.params;
  const result = await declineRecognition(db, id, uid);
  if (!result.ok) {
    const status = result.reason === 'not_found' ? 404 : 403;
    return NextResponse.json({ error: result.reason }, { status });
  }
  return NextResponse.json(result);
}
