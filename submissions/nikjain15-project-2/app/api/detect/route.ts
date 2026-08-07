import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin';
import { verifyUid } from '@/lib/auth-server';
import { detectRecognitionsSmart } from '@/lib/detect-model';
import { suggestRecognition } from '@/lib/recognition-admin';
import { isAuthoredSource } from '@/lib/source-ref';
import { allow } from '@/lib/rate-guard';

export const runtime = 'nodejs';

/**
 * Post-message recognition detection. The message author (verified) is the HELPED party; any
 * handle they credit becomes a *suggested* recognition for that helper. Detection never awards
 * — it only proposes; the helper's XP waits on the helped peer's explicit confirm.
 *
 * Degrades to a no-op: no admin credential → 200 with detected:0. Core comms never depends on
 * this route succeeding.
 */
export async function POST(req: Request) {
  const helpedUid = await verifyUid(req);
  if (!helpedUid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Cap detection per user: it runs a model call and can spawn suggestions aimed at a peer.
  // 30/min is far above real messaging but stops a scripted flood.
  if (!allow('detect', helpedUid, 30, 60_000, Date.now())) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let body: { sourceMsgRef?: string; body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.sourceMsgRef || typeof body.body !== 'string') {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const db = adminDb();
  if (!db) return NextResponse.json({ detected: 0, degraded: true });

  // Anti-gaming: a suggestion may only hang off a message the CALLER actually authored in a
  // channel they belong to. Without this, a client could POST fabricated sourceMsgRefs to seed
  // (and then self-confirm) recognitions for a "helper" who never helped. See lib/source-ref.ts.
  if (!(await isAuthoredSource(db, body.sourceMsgRef, helpedUid))) {
    return NextResponse.json({ error: 'invalid_source' }, { status: 403 });
  }

  const detected = await detectRecognitionsSmart(body.body);
  let created = 0;
  for (const d of detected) {
    // Resolve the credited handle → a real profile uid. Unknown handles are skipped, not guessed.
    const q = await db.collection('profiles').where('handle', '==', d.helperHandle).limit(1).get();
    if (q.empty) continue;
    const helperUid = q.docs[0].id;
    const id = await suggestRecognition(db, {
      helperUid,
      helpedUid,
      sourceMsgRef: body.sourceMsgRef,
      kind: d.kind,
    });
    if (id) created += 1;
  }
  return NextResponse.json({ detected: created });
}
