import { NextResponse } from 'next/server';
import { postLearningEvent, readLearnerSession } from '@/lib/ludwitt';

const ALLOWED = new Set(['lesson_started', 'lesson_completed', 'quiz_submitted', 'session_heartbeat']);

export async function POST(request: Request) {
  const session = await readLearnerSession();
  if (!session) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
  }

  let body: { event?: string; metadata?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const event = body.event?.trim();
  if (!event || !ALLOWED.has(event)) {
    return NextResponse.json({ error: 'invalid event' }, { status: 400 });
  }

  try {
    const result = await postLearningEvent(
      event as 'lesson_started' | 'lesson_completed' | 'quiz_submitted' | 'session_heartbeat',
      session.sub,
      session.sessionId,
      body.metadata
    );
    return NextResponse.json({ ok: true, ludwitt: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'event failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
