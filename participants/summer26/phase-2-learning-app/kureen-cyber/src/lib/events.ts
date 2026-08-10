import { randomBytes } from "crypto";
import { isDemoMode } from "./app-config";
import { localPutEvent, localPutSession } from "./local-store";
import { LUDWITT_COLLECTIONS } from "./ludwitt/collections";
import { putDocument } from "./ludwitt/data";

export type LearningEventType =
  | "app_launch"
  | "session_start"
  | "answer_submitted"
  | "session_complete"
  | "feedback_requested";

export async function trackEvent(
  accessToken: string,
  event: {
    eventType: LearningEventType;
    sessionId?: string;
    track?: string;
    questionId?: string;
    properties?: Record<string, unknown>;
    userSub?: string;
  },
) {
  const createdAt = new Date().toISOString();
  const docId = `evt_${Date.now()}_${randomBytes(4).toString("hex")}`;
  const data = {
    eventType: event.eventType,
    createdAt,
    sessionId: event.sessionId ?? "",
    track: event.track ?? "",
    questionId: event.questionId ?? "",
    properties: event.properties ?? {},
  };

  if (isDemoMode() || accessToken === "demo_local_token") {
    localPutEvent(event.userSub || "demo-user", docId, data);
    return { docId, createdAt };
  }

  await putDocument(accessToken, LUDWITT_COLLECTIONS.events, docId, data);
  return { docId, createdAt };
}

export async function upsertSessionDoc(
  accessToken: string,
  sessionId: string,
  data: Record<string, unknown>,
  userSub?: string,
) {
  if (isDemoMode() || accessToken === "demo_local_token") {
    localPutSession(userSub || "demo-user", sessionId, data);
    return;
  }

  await putDocument(accessToken, LUDWITT_COLLECTIONS.sessions, sessionId, data);
}
