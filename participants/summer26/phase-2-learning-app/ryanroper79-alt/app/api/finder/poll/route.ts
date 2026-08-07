import { NextResponse } from 'next/server';
import { readSession, ludwittTransport } from '@/lib/ludwitt/session';
import { runFinderPoll, listOpportunities, appendEvent } from '@/lib/db/store';
import { emitPlatformEvent } from '@/lib/ludwitt/events';

export async function POST() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const result = runFinderPoll();
  const screened = listOpportunities({ status: 'screening' });

  try {
    await emitPlatformEvent(
      'opportunity.discovered',
      { orgId: session.orgId, userId: session.sub, sessionId: session.sessionId },
      { count: String(result.discovered), screened: String(result.screened) },
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
  } catch {
    /* non-fatal */
  }

  return NextResponse.json({ ...result, screening: screened.length });
}
