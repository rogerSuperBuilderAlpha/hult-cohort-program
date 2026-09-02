import { randomUUID } from "crypto";
import { hultEventsConfigured } from "@/lib/config";
import type { LearningEventType } from "@/lib/ludwitt/crypto";
import { appendEvent } from "@/lib/ludwitt/event-store";
import type { UserSession } from "@/lib/ludwitt/session";
import { ludwitt } from "@/lib/config";

export type EventResult = {
  ok: boolean;
  channel: "hult_api" | "byob_store" | "local_log";
  detail?: string;
};

export async function recordLearningEvent(
  session: UserSession,
  event: LearningEventType,
  metadata?: Record<string, unknown>
): Promise<EventResult> {
  const payload = {
    event,
    user_id: session.sub,
    session_id: session.sessionId,
    metadata: { ...metadata, app: "dealforge", at: new Date().toISOString() },
  };

  if (hultEventsConfigured()) {
    const res = await fetch(
      `${ludwitt.hultEventsUrl}/apps/${ludwitt.hultAppId}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ludwitt.hultApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    if (res.ok || res.status === 202) {
      return { ok: true, channel: "hult_api" };
    }
  }

  appendEvent({
    event,
    userId: session.sub,
    sessionId: session.sessionId,
    metadata: payload.metadata,
    createdAt: new Date().toISOString(),
  });
  return { ok: true, channel: "byob_store" };
}

export function newSessionId(): string {
  return randomUUID();
}
