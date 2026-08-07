import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type LudwittEventType =
  | "lesson_started"
  | "lesson_completed"
  | "quiz_submitted"
  | "session_heartbeat";

export type SendLudwittEventResult = {
  ok: boolean;
  status?: number;
  error?: string;
};

function getEventsUrl(appId: string): string {
  const base = (
    process.env.LUDWITT_API_BASE_URL || "http://localhost:4000/v1"
  ).replace(/\/$/, "");
  return `${base}/apps/${appId}/events`;
}

/**
 * POST a learning event to Ludwitt and always write a ludwitt_event_log row.
 * Never throws — callers should treat delivery failures as silent to learners.
 *
 * API body shape (confirmed against execution/ludwitt-hult-api):
 *   { event, user_id, session_id, metadata? }
 * Success: 202 { accepted: true, counted: boolean }
 *
 * `userId` is the platform user id sent as `user_id` (Ludwitt `sub`).
 * Pass `appUserId` in payload to attach the log row to `app_users.id`.
 * Pass `session_id` in payload (generated if omitted).
 */
export async function sendLudwittEvent(
  userId: string,
  eventType: LudwittEventType,
  payload: Record<string, unknown> = {},
): Promise<SendLudwittEventResult> {
  const appId = process.env.LUDWITT_APP_ID;
  const apiKey = process.env.LUDWITT_API_KEY;

  const { session_id: sessionFromPayload, appUserId, ...rest } = payload;
  const sessionId =
    typeof sessionFromPayload === "string" && sessionFromPayload
      ? sessionFromPayload
      : randomUUID();

  const body: Record<string, unknown> = {
    event: eventType,
    user_id: userId,
    session_id: sessionId,
  };

  if (Object.keys(rest).length > 0) {
    body.metadata = rest;
  }

  let status: number | undefined;
  let error: string | undefined;
  let ok = false;

  if (!appId || !apiKey) {
    error = "LUDWITT_APP_ID or LUDWITT_API_KEY is not set";
  } else {
    try {
      const res = await fetch(getEventsUrl(appId), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      status = res.status;
      const text = await res.text();
      let parsed: unknown = text;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        /* keep raw text */
      }

      if (res.ok) {
        ok = true;
      } else {
        error =
          typeof parsed === "object" &&
          parsed !== null &&
          "error" in parsed &&
          typeof (parsed as { error: unknown }).error === "string"
            ? (parsed as { error: string }).error
            : text || `HTTP ${res.status}`;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }
  }

  // Always attempt to log — regardless of delivery outcome.
  try {
    const supabase = createAdminClient();
    const logUserId =
      typeof appUserId === "string" && appUserId ? appUserId : null;

    const { error: logError } = await supabase.from("ludwitt_event_log").insert({
      user_id: logUserId,
      event_type: eventType,
      payload: body,
      http_status: status ?? null,
      error: error ?? null,
    });

    if (logError) {
      console.error("ludwitt_event_log insert failed", logError);
      if (!error) error = `event_log: ${logError.message}`;
    }
  } catch (err) {
    console.error("ludwitt_event_log insert error", err);
    if (!error) {
      error = err instanceof Error ? err.message : String(err);
    }
  }

  return { ok, status, error };
}
