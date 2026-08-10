import { NextResponse } from "next/server";
import { postLearningEvent, type LearningEventName } from "@/lib/events";
import { readSession } from "@/lib/session";

const ALLOWED: LearningEventName[] = [
  "lesson_started",
  "lesson_completed",
  "quiz_submitted",
  "session_heartbeat",
];

const METADATA_MAX_KEYS = 12;
const METADATA_MAX_STRING = 200;
const METADATA_MAX_JSON_CHARS = 2_500;

/** Bound client metadata before forwarding to Ludwitt. */
function sanitizeEventMetadata(
  input: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  let keys = 0;
  for (const [key, value] of Object.entries(input)) {
    if (keys >= METADATA_MAX_KEYS) break;
    if (!/^[a-zA-Z0-9_.-]{1,40}$/.test(key)) continue;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      const next =
        typeof value === "string" ? value.slice(0, METADATA_MAX_STRING) : value;
      out[key] = next;
      keys += 1;
    }
  }
  if (JSON.stringify(out).length > METADATA_MAX_JSON_CHARS) {
    return {};
  }
  return out;
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { error: "No learning session. Launch from Ludwitt/Hult (or use local bypass)." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event =
    typeof body === "object" &&
    body &&
    "event" in body &&
    typeof (body as { event: unknown }).event === "string"
      ? ((body as { event: string }).event as LearningEventName)
      : null;

  if (!event || !ALLOWED.includes(event)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const metadata = sanitizeEventMetadata(
    typeof body === "object" &&
      body &&
      "metadata" in body &&
      typeof (body as { metadata: unknown }).metadata === "object" &&
      (body as { metadata: unknown }).metadata !== null &&
      !Array.isArray((body as { metadata: unknown }).metadata)
      ? ((body as { metadata: Record<string, unknown> }).metadata ?? {})
      : {},
  );

  const result = await postLearningEvent({
    event,
    userId: session.userId,
    sessionId: session.sessionId,
    metadata,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, mode: result.mode }, { status: 202 });
}
