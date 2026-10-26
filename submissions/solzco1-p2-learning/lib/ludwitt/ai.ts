import { ludwitt } from "@/lib/config";

export type AiMessage = { role: "user" | "assistant"; content: string };

export type AiResult =
  | { ok: true; content: string; credits?: unknown }
  | { ok: false; status: number; code?: string; message: string };

export async function sendAiMessage(
  accessToken: string,
  messages: AiMessage[],
  model = process.env.LUDWITT_AI_MODEL ?? "claude-sonnet-4-6"
): Promise<AiResult> {
  const res = await fetch(`${ludwitt.apiBase}/api/v1/ai/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, max_tokens: 1024, messages }),
  });

  if (res.status === 402) {
    const err = (await res.json().catch(() => ({}))) as {
      code?: string;
      message?: string;
    };
    return {
      ok: false,
      status: 402,
      code: err.code ?? "INSUFFICIENT_PAID_CREDITS",
      message:
        "You're out of Ludwitt credits for third-party apps — top up at https://pitchrise.ludwitt.com/account/credits",
    };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "AI request failed");
    return { ok: false, status: res.status, message: text };
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const block = data.content?.find((c) => c.type === "text");
  return {
    ok: true,
    content: block?.text ?? "No response.",
    credits: res.headers.get("x-ludwitt-credits"),
  };
}
