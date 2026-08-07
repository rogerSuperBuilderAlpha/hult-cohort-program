import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { readSessionToken } from "@/lib/session";
import { postEvent } from "@/lib/events";

export const runtime = "nodejs";

type EventName = "lesson_started" | "lesson_completed" | "quiz_submitted" | "session_heartbeat";

export async function POST(req: NextRequest) {
  const store = await cookies();
  const sessionToken = store.get("ai-onramp-session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ ok: false, error: "no session" }, { status: 401 });
  }

  const user = await readSessionToken(sessionToken);
  if (!user) {
    return NextResponse.json({ ok: false, error: "invalid session" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    properties?: Record<string, string | number | boolean | null>;
  };

  const name = body.name as EventName | undefined;
  if (!name || !["lesson_started", "lesson_completed", "quiz_submitted", "session_heartbeat"].includes(name)) {
    return NextResponse.json({ ok: false, error: "unknown event" }, { status: 400 });
  }

  const ok = await postEvent(user.appId ?? "", {
    name,
    properties: {
      ...(body.properties ?? {}),
      user_id: user.sub,
      email: user.email,
      app_id: user.appId,
    },
  });

  return NextResponse.json({ ok });
}