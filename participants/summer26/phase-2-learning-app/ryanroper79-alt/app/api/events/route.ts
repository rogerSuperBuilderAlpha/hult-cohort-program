import { NextResponse } from 'next/server';
import { readSession, ludwittTransport } from '@/lib/ludwitt/session';
import { emitPlatformEvent } from '@/lib/ludwitt/events';
import { appendEvent } from '@/lib/db/store';

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'not authenticated' }, { status: 401 });

  let body: { event?: string; payload?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const eventName = body.event?.trim();
  const allowed = [
    'qualification.scored',
    'bid.decided',
    'opportunity.discovered',
    'opportunity.screened',
  ] as const;
  if (!eventName || !allowed.includes(eventName as (typeof allowed)[number])) {
    return NextResponse.json({ error: 'invalid event' }, { status: 400 });
  }

  try {
    await emitPlatformEvent(
      eventName as 'qualification.scored',
      { orgId: session.orgId, userId: session.sub, sessionId: session.sessionId },
      body.payload ?? {},
      ludwittTransport,
      async (e) =>
        appendEvent({
          orgId: e.orgId,
          userId: e.userId,
          eventName: e.eventName,
          payload: e.payload,
          sessionId: e.sessionId,
        })
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'event failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
