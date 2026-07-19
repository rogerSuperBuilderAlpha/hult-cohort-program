import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin';
import { verifyUid } from '@/lib/auth-server';
import { seedQuests } from '@/lib/quest-admin';

export const runtime = 'nodejs';

/**
 * Server-side provisioning on sign-in: seed the caller's starter quests (quests are
 * server-written; clients can't create them). Idempotent, so calling it on every sign-in is
 * safe. Degrades to a no-op with no admin credential — quests are an enhancement, not a gate.
 */
export async function POST(req: Request) {
  const uid = await verifyUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const db = adminDb();
  if (!db) return NextResponse.json({ seeded: false, degraded: true });

  await seedQuests(db, uid);
  return NextResponse.json({ seeded: true });
}
