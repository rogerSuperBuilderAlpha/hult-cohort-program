export type TelemetryEventType =
  | "APP_INITIALIZED"
  | "CARD_FLIPPED"
  | "ANSWER_REVEALED"
  | "QUESTION_ANSWERED"
  | "EXPLANATION_VIEWED"
  | "REMATCH_STARTED"
  | "SESSION_MODE_SET"
  | "SESSION_COMPLETED";

export type SessionCompletePayload = {
  finalScore: number;
  total: number;
  bestStreak: number;
  masteredTotal: number;
  seconds: number;
  missedCount: number;
  rematchScore?: number;
  rematchTotal?: number;
  composition?: {
    weak: number;
    due: number;
    fresh: number;
    strong: number;
    total: number;
  } | null;
  category: string;
  deckMode?: string;
};

const JWT_STORAGE_KEY = "ludwitt_jwt";
const APP_ID = "trinidad-tobago-trivia-app";

export function resolveJwt(): string | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("token") || params.get("jwt");
  if (fromUrl) {
    localStorage.setItem(JWT_STORAGE_KEY, fromUrl);
    return fromUrl;
  }

  return localStorage.getItem(JWT_STORAGE_KEY);
}

export function formatEventLog(
  type: TelemetryEventType | string,
  details: object,
): string {
  return `[${new Date().toLocaleTimeString()}] ${type}: ${JSON.stringify(details)}`;
}

/** Posts telemetry via local API proxy (JWT resolved at call time). */
export async function logTelemetryEvent(
  type: TelemetryEventType | string,
  details: object,
): Promise<void> {
  const jwt = resolveJwt();

  try {
    await fetch("/api/telemetry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify({
        app: APP_ID,
        type,
        details,
        jwt,
      }),
    });
  } catch {
    // Fail soft — learning UX should not break if telemetry is down.
  }
}

/** Dedicated session-complete handshake for cohort metrics. */
export async function completeSession(
  payload: SessionCompletePayload,
): Promise<void> {
  const jwt = resolveJwt();

  try {
    await fetch("/api/session/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify({
        app: APP_ID,
        ...payload,
        jwt,
        completedAt: new Date().toISOString(),
      }),
    });
  } catch {
    // Fail soft.
  }
}

export { APP_ID, JWT_STORAGE_KEY };
