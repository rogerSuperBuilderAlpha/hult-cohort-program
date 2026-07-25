import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin';
import { verifyUid } from '@/lib/auth-server';
import { hasModel } from '@/lib/agent';
import { allow } from '@/lib/rate-guard';
import { runAssistant } from '@/lib/assistant-run';

export const runtime = 'nodejs';

/**
 * The Rally assistant on Home. Verifies the caller, rate-limits, and delegates to the tool-use
 * loop in lib. It reads only what the caller could already read, drafts actions the caller
 * confirms, never writes points, and degrades to 503 ("unavailable") with no model key. In the
 * product it is only ever "Rally".
 */
export async function POST(req: Request) {
  const uid = await verifyUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const nowMs = Date.now();
  if (!allow('assistant', uid, 15, 60_000, nowMs)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  if (!hasModel()) return NextResponse.json({ available: false, reply: null, proposals: [] }, { status: 503 });

  const db = adminDb();
  if (!db) return NextResponse.json({ error: 'ledger_unavailable' }, { status: 503 });

  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const message = (body.message ?? '').toString().trim().slice(0, 2000);
  if (!message) return NextResponse.json({ error: 'missing_message' }, { status: 400 });

  const result = await runAssistant(db, uid, message, nowMs);
  if (!result.available) return NextResponse.json(result, { status: 503 });
  return NextResponse.json(result);
}
