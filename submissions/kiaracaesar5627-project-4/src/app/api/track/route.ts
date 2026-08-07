import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isBlockedUser,
  recordEvent,
  SEEDED_APP,
  type LearningEventName,
} from "@/lib/platform/store";
import type { LearnerSession } from "@/app/api/session/route";

const COOKIE = "pf_session";
const ALLOWED = new Set<LearningEventName>([
  "lesson_started",
  "lesson_completed",
  "quiz_submitted",
  "session_heartbeat",
]);

export async function POST(req: Request) {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ error: "no session — launch from Ludwitt/Hult" }, { status: 401 });
  }

  let session: LearnerSession;
  try {
    session = JSON.parse(raw) as LearnerSession;
  } catch {
    return NextResponse.json({ error: "invalid session" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    event?: string;
    metadata?: Record<string, unknown>;
  };

  if (!body.event || !ALLOWED.has(body.event as LearningEventName)) {
    return NextResponse.json({ error: "invalid event" }, { status: 400 });
  }

  if (isBlockedUser(session.user_id, SEEDED_APP.student_handle)) {
    return NextResponse.json({ accepted: true, counted: false }, { status: 202 });
  }

  recordEvent(SEEDED_APP.app_id, {
    event: body.event as LearningEventName,
    user_id: session.user_id,
    session_id: session.session_id,
    metadata: body.metadata,
    sandbox: false,
  });

  return NextResponse.json({ accepted: true, counted: true }, { status: 202 });
}
