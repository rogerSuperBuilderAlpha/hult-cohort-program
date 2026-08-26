import { NextResponse } from "next/server";
import { getSession } from "@/lib/ludwitt/session";
import { recordLearningEvent } from "@/lib/ludwitt/events";
import { listEventsForUser } from "@/lib/ludwitt/event-store";
import type { LearningEventType } from "@/lib/ludwitt/crypto";

type Body = {
  event?: LearningEventType;
  metadata?: Record<string, unknown>;
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    events: listEventsForUser(session.sub),
  });
}

export async function POST(request: Request) {  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = body.event;
  if (
    !event ||
    !["lesson_started", "lesson_completed", "quiz_submitted", "session_heartbeat"].includes(
      event
    )
  ) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const result = await recordLearningEvent(session, event, body.metadata);
  return NextResponse.json(result);
}
