const LUDWITT_API = process.env.LUDWITT_API_URL ?? "https://api.ludwitt.hult/v1";
const API_KEY = process.env.LUDWITT_API_KEY ?? process.env.LUDWITT_DEV_API_KEY ?? "";

export type LearningEvent =
  | { name: "lesson_started"; properties: Record<string, string | number | boolean | null> }
  | { name: "lesson_completed"; properties: Record<string, string | number | boolean | null> }
  | { name: "quiz_submitted"; properties: Record<string, string | number | boolean | null> }
  | { name: "session_heartbeat"; properties: Record<string, string | number | boolean | null> };

export async function postEvent(appId: string, event: LearningEvent): Promise<boolean> {
  if (!API_KEY) {
    console.warn("[events] no LUDWITT_API_KEY configured; event dropped", event.name);
    return false;
  }
  try {
    const { user_id, ...props } = event.properties;
    const res = await fetch(`${LUDWITT_API}/apps/${appId}/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: event.name,
        user_id: String(user_id ?? "anonymous"),
        session_id: crypto.randomUUID(),
        metadata: { ts: new Date().toISOString(), ...props },
      }),
    });
    return res.ok || res.status === 202;
  } catch (err) {
    console.warn("[events] delivery failed", err instanceof Error ? err.message : err);
    return false;
  }
}