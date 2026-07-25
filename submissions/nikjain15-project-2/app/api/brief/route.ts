import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin';
import { verifyUid } from '@/lib/auth-server';
import { gatherBrief } from '@/lib/brief-admin';

export const runtime = 'nodejs';

/**
 * "Catch me up": the ≤3 things that actually need the caller + a one-line quiet summary. The
 * ranking is deterministic (works with the model off); the model enhances classification when
 * present. Server-side, ID-token gated — the brief is about you and reads only your claims.
 */
export async function GET(req: Request) {
  const uid = await verifyUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const db = adminDb();
  if (!db) return NextResponse.json({ error: 'ledger_unavailable' }, { status: 503 });

  const brief = await gatherBrief(db, uid, Date.now());
  return NextResponse.json(brief);
}
