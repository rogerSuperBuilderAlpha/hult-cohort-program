import { ludwittConfig } from "@/lib/ludwitt";

export type LearningEventName =
  | "lesson_started"
  | "lesson_completed"
  | "quiz_submitted"
  | "session_heartbeat";

export type PostEventInput = {
  event: LearningEventName;
  userId: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
};

export type PostEventResult =
  | { ok: true; mode: "live" | "dry-run"; status?: number }
  | { ok: false; error: string };

/** Server-side POST to Ludwitt/Hult events API. Dry-runs when keys are missing. */
export async function postLearningEvent(
  input: PostEventInput,
): Promise<PostEventResult> {
  const { appId, apiKey, apiBaseUrl } = ludwittConfig();

  if (!appId || !apiKey) {
    console.info("[ludwitt:dry-run]", input);
    return { ok: true, mode: "dry-run" };
  }

  const url = `${apiBaseUrl.replace(/\/$/, "")}/apps/${appId}/events`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: input.event,
        user_id: input.userId,
        session_id: input.sessionId,
        metadata: input.metadata ?? {},
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Events API ${res.status}: ${text || res.statusText}`,
      };
    }

    return { ok: true, mode: "live", status: res.status };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}
