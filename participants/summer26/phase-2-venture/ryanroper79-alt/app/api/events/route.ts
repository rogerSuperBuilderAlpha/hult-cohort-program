import { NextResponse } from 'next/server';
import { readSession, ludwittTransport } from '@/lib/ludwitt/session';
import { emitVentureEvent, type VentureEventName } from '@/lib/ludwitt/events';

const ALLOWED: VentureEventName[] = [
  'calculator_started',
  'calculator_completed',
  'results_viewed',
  'audit_information_requested',
];

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { event } = (await request.json()) as { event?: string };
  if (!event || !ALLOWED.includes(event as VentureEventName)) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  }

  try {
    await emitVentureEvent(
      event as VentureEventName,
      { userId: session.sub, sessionId: session.sessionId },
      'ok',
      ludwittTransport
    );
  } catch {
    // Metrics are best-effort — do not block calculator during live sessions
    return NextResponse.json({ ok: true, metricsSkipped: true });
  }

  return NextResponse.json({ ok: true });
}
