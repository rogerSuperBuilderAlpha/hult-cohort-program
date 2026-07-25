import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin';
import { verifyUid } from '@/lib/auth-server';
import { MODELS, callClaude, hasModel } from '@/lib/agent';
import { allow } from '@/lib/rate-guard';

export const runtime = 'nodejs';

/**
 * "Ask Rally": summarise / draft / "what did we decide", scoped to ONE channel the caller
 * belongs to. The model only ever reads messages the caller could already read (membership is
 * verified server-side), and it only produces text — it takes no action. Degrades to a clear
 * "unavailable" when the model is off; it never fabricates an answer.
 */
export async function POST(req: Request) {
  const uid = await verifyUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // 20 asks/min per user — generous for a human, a wall for a loop draining credit.
  if (!allow('ask', uid, 20, 60_000, Date.now())) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  if (!hasModel()) {
    return NextResponse.json({ available: false, answer: null }, { status: 503 });
  }

  const db = adminDb();
  if (!db) return NextResponse.json({ error: 'ledger_unavailable' }, { status: 503 });

  let body: { channelId?: string; question?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.channelId || !body.question) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  // Membership check — never let Ask read a channel the caller isn't in.
  const ch = await db.collection('channels').doc(body.channelId).get();
  const members: string[] = ch.exists ? (ch.data()?.memberUids ?? []) : [];
  if (!members.includes(uid)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const msgs = await db
    .collection('channels')
    .doc(body.channelId)
    .collection('messages')
    .orderBy('createdAt', 'desc')
    .limit(80)
    .get();
  const transcript = msgs.docs
    .reverse()
    .map((m) => `${m.data().authorUid}: ${m.data().body}`)
    .join('\n');

  const answer = await callClaude({
    model: MODELS.default,
    system:
      'You are Rally, a concise assistant summarising a cohort channel. Answer only from the ' +
      'transcript provided. If the answer is not in it, say so plainly. Never invent decisions ' +
      'or attribute words to people that are not in the transcript.',
    prompt: `Channel transcript:\n${transcript}\n\nQuestion: ${body.question}`,
    maxTokens: 700,
  });

  if (answer == null) {
    return NextResponse.json({ available: false, answer: null }, { status: 503 });
  }
  return NextResponse.json({ available: true, answer });
}
