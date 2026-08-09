import { NextResponse } from 'next/server';
import { postPlatformEvent, readSession } from '@/lib/ludwitt/session';

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json()) as {
    event?: string;
    metadata?: Record<string, string>;
  };
  const event = body.event?.trim();
  if (!event) return NextResponse.json({ error: 'event required' }, { status: 400 });

  try {
    const result = await postPlatformEvent(
      event,
      session.sub,
      session.sessionId,
      body.metadata ?? {}
    );
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'event failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
