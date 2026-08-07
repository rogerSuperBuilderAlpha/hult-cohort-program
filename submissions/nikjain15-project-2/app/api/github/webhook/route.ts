import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/admin';
import { completeCommitment, findByExternalId } from '@/lib/commitment-admin';
import { completeQuest } from '@/lib/quest-admin';
import { verifyGithubSignature } from '@/lib/webhook';

export const runtime = 'nodejs';

/**
 * GitHub webhook: when a linked issue is closed, the tracked commitment is marked done (XP
 * awarded if on time) and a status line is posted back to the source thread. Secret-verified
 * over the raw body — the endpoint is public and its effect is privileged, so an unverified
 * request is rejected before anything is read.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.GITHUB_WEBHOOK_SECRET ?? '';
  if (!verifyGithubSignature(raw, req.headers.get('x-hub-signature-256'), secret)) {
    return NextResponse.json({ error: 'bad_signature' }, { status: 401 });
  }

  const db = adminDb();
  if (!db) return NextResponse.json({ error: 'ledger_unavailable' }, { status: 503 });

  let payload: { action?: string; issue?: { number?: number } };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // We only act on an issue being closed → the commitment is kept.
  if (payload.action !== 'closed' || !payload.issue?.number) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const commitmentId = await findByExternalId(db, String(payload.issue.number));
  if (!commitmentId) return NextResponse.json({ ok: true, ignored: true });

  const result = await completeCommitment(db, commitmentId, Date.now());
  if (result.ok && !result.alreadyDone) {
    await postStatusBack(db, commitmentId, result.onTime);
    // Keeping a commitment completes the owner's "make and keep a commitment" quest.
    const snap = await db.collection('commitments').doc(commitmentId).get();
    const authorUid = snap.data()?.authorUid as string | undefined;
    if (authorUid) await completeQuest(db, authorUid, 'commit');
  }
  return NextResponse.json(result);
}

/** Post a short completion line back into the commitment's source channel. */
async function postStatusBack(
  db: NonNullable<ReturnType<typeof adminDb>>,
  commitmentId: string,
  onTime: boolean,
): Promise<void> {
  const snap = await db.collection('commitments').doc(commitmentId).get();
  const c = snap.data();
  if (!c?.sourceMsgRef) return;
  // sourceMsgRef is "channels/<id>/messages/<mid>" → derive the channel + thread parent.
  const parts = String(c.sourceMsgRef).split('/');
  if (parts.length < 4 || parts[0] !== 'channels') return;
  const channelId = parts[1];
  const parentId = parts[3];
  await db.collection('channels').doc(channelId).collection('messages').add({
    authorUid: c.authorUid,
    body: onTime ? '✓ Done — kept on time.' : '✓ Done.',
    parentId,
    system: true,
    createdAt: FieldValue.serverTimestamp(),
    editedAt: null,
  });
}
