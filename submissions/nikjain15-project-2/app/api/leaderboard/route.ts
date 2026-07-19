import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin';
import { verifyUid } from '@/lib/auth-server';
import { computeLeaderboard } from '@/lib/leaderboard-admin';

export const runtime = 'nodejs';

/**
 * Neighbors-only leaderboard. The full ordering is computed server-side and never returned —
 * the caller gets their own rank, a ±2 window, and the cooperative team total. No endpoint
 * exposes a full public ranking of who's behind (guardrail #5).
 */
export async function GET(req: Request) {
  const uid = await verifyUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const db = adminDb();
  if (!db) return NextResponse.json({ error: 'ledger_unavailable' }, { status: 503 });

  // Opt-in "full board": reveal only the celebratory top of the ladder, never who's behind.
  const includeTop = new URL(req.url).searchParams.get('top') === '1';
  const result = await computeLeaderboard(db, uid, { includeTop });
  return NextResponse.json(result);
}
