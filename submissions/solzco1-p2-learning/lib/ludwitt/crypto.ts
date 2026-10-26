import { createHash, randomBytes } from "crypto";

export function randomUrlSafe(bytes = 32): string {
  return randomBytes(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function pkceChallenge(verifier: string): string {
  return createHash("sha256")
    .update(verifier)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export type LearningEventType =
  | "lesson_started"
  | "lesson_completed"
  | "quiz_submitted"
  | "session_heartbeat";

export function isNonHeartbeat(
  event: LearningEventType
): event is Exclude<LearningEventType, "session_heartbeat"> {
  return event !== "session_heartbeat";
}
