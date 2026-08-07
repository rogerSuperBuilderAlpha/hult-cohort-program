export type LudwittEventName =
  | 'session.start'
  | 'opportunity.discovered'
  | 'opportunity.screened'
  | 'qualification.scored'
  | 'bid.decided'
  | 'assembly.started'
  | 'submission.filed'
  | 'outcome.recorded'
  | 'lesson.adopted';

/** Maps Bid Manager events to Ludwitt qualifying platform events. */
const PLATFORM_EVENT_MAP: Record<LudwittEventName, 'lesson_started' | 'quiz_submitted' | 'lesson_completed' | 'session_heartbeat'> = {
  'session.start': 'lesson_started',
  'opportunity.discovered': 'lesson_started',
  'opportunity.screened': 'lesson_started',
  'qualification.scored': 'quiz_submitted',
  'bid.decided': 'lesson_completed',
  'assembly.started': 'quiz_submitted',
  'submission.filed': 'lesson_completed',
  'outcome.recorded': 'quiz_submitted',
  'lesson.adopted': 'lesson_completed',
};

export type LudwittTransport = (
  platformEvent: string,
  userId: string,
  sessionId: string,
  metadata: Record<string, string>
) => Promise<unknown>;

export type EmitContext = {
  orgId: string;
  userId: string;
  sessionId: string;
};

export type EventLogWriter = (entry: {
  orgId: string;
  userId: string;
  eventName: LudwittEventName;
  payload: Record<string, unknown>;
  sessionId: string;
}) => Promise<void>;

export async function emitPlatformEvent(
  eventName: LudwittEventName,
  ctx: EmitContext,
  payload: Record<string, unknown>,
  transport: LudwittTransport,
  logWriter?: EventLogWriter
): Promise<void> {
  if (logWriter) {
    await logWriter({
      orgId: ctx.orgId,
      userId: ctx.userId,
      eventName,
      payload,
      sessionId: ctx.sessionId,
    });
  }

  const platformEvent = PLATFORM_EVENT_MAP[eventName];
  const metadata: Record<string, string> = {
    bidmanager_event: eventName,
    org_id: ctx.orgId,
    payload: JSON.stringify(payload).slice(0, 500),
  };

  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      metadata[key] = String(value);
    }
  }

  await transport(platformEvent, ctx.userId, ctx.sessionId, metadata);
}
