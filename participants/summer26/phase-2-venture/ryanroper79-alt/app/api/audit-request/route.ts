import { NextResponse } from 'next/server';
import { readSession, ludwittTransport } from '@/lib/ludwitt/session';
import { emitVentureEvent } from '@/lib/ludwitt/events';

export async function POST() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await emitVentureEvent(
      'audit_information_requested',
      { userId: session.sub, sessionId: session.sessionId },
      'ok',
      ludwittTransport
    );
  } catch {
    return NextResponse.json({ error: 'Metrics transport failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
