import { NextResponse } from "next/server";
import { z } from "zod";
import {
  callAnthropic,
  callOpenAI,
  localCoachReply,
  type ChatMessage,
} from "@/lib/coach";

export const runtime = "nodejs";

const Body = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(24),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid messages" }, { status: 400 });
  }

  const messages = parsed.data.messages as ChatMessage[];
  // Cap total chars
  const total = messages.reduce((n, m) => n + m.content.length, 0);
  if (total > 24000) {
    return NextResponse.json({ error: "conversation too long" }, { status: 400 });
  }

  // Providers require the first message to be from the user
  const start = messages.findIndex((m) => m.role === "user");
  if (start < 0) {
    return NextResponse.json({ error: "need a user message" }, { status: 400 });
  }
  const trimmed = messages.slice(start);

  const anthropic = process.env.ANTHROPIC_API_KEY?.trim();
  const openai = process.env.OPENAI_API_KEY?.trim();

  try {
    if (anthropic) {
      const reply = await callAnthropic(anthropic, trimmed);
      return NextResponse.json({ reply, mode: "anthropic" as const });
    }
    if (openai) {
      const reply = await callOpenAI(openai, trimmed);
      return NextResponse.json({ reply, mode: "openai" as const });
    }
  } catch (err) {
    console.error("[coach]", err);
    // Fall through to local coach so practice never hard-fails
  }

  const reply = localCoachReply(trimmed);
  return NextResponse.json({
    reply,
    mode: "local" as const,
    notice:
      anthropic || openai
        ? "AI provider errored — using built-in personalization coach."
        : "No ANTHROPIC_API_KEY or OPENAI_API_KEY set — using built-in personalization coach.",
  });
}
