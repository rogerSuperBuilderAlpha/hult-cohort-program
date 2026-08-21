import { APP_VERSION } from '@/lib/constants';

export type VentureEventName =
  | 'authenticated_session_started'
  | 'calculator_started'
  | 'calculator_completed'
  | 'results_viewed'
  | 'audit_information_requested';

/** Maps venture events to Ludwitt qualifying platform events. */
const PLATFORM_EVENT_MAP: Record<
  VentureEventName,
  'lesson_started' | 'quiz_submitted' | 'lesson_completed' | 'session_heartbeat'
> = {
  authenticated_session_started: 'lesson_started',
  calculator_started: 'lesson_started',
  calculator_completed: 'quiz_submitted',
  results_viewed: 'lesson_completed',
  audit_information_requested: 'quiz_submitted',
};

export type LudwittTransport = (
  platformEvent: string,
  userId: string,
  sessionId: string,
  metadata: Record<string, string>
) => Promise<unknown>;

export type EmitContext = {
  userId: string;
  sessionId: string;
};

export async function emitVentureEvent(
  eventName: VentureEventName,
  ctx: EmitContext,
  status: string,
  transport: LudwittTransport
): Promise<void> {
  const platformEvent = PLATFORM_EVENT_MAP[eventName];
  const metadata: Record<string, string> = {
    energy_auditor_event: eventName,
    app_version: APP_VERSION,
    status,
  };
  await transport(platformEvent, ctx.userId, ctx.sessionId, metadata);
}
