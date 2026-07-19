import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin';
import { verifyUid } from '@/lib/auth-server';
import { trackCommitment } from '@/lib/commitment-admin';
import { resolvePmAdapter } from '@/lib/pm-adapter';

export const runtime = 'nodejs';

/**
 * "Track it": the author confirms a commitment → record it and (if the PM integration is
 * configured) open a linked task. Author-only; the uid comes from the verified token, so
 * nobody can log a commitment in someone else's name.
 */
export async function POST(req: Request) {
  const uid = await verifyUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const db = adminDb();
  if (!db) return NextResponse.json({ error: 'ledger_unavailable' }, { status: 503 });

  let body: { sourceMsgRef?: string; text?: string; dueAt?: number | null; toUid?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.sourceMsgRef || !body.text) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const result = await trackCommitment(db, resolvePmAdapter(), {
    authorUid: uid,
    toUid: body.toUid ?? null,
    sourceMsgRef: body.sourceMsgRef,
    text: body.text,
    dueAt: body.dueAt ?? null,
  });
  return NextResponse.json(result);
}
