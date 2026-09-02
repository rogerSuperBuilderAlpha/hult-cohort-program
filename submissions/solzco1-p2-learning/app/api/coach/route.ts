import { NextResponse } from "next/server";
import { sendAiMessage } from "@/lib/ludwitt/ai";
import { recordLearningEvent } from "@/lib/ludwitt/events";
import { requireAccessToken } from "@/lib/ludwitt/tokens";

type Body = {
  prompt?: string;
  lessonId?: string;
};

export async function POST(request: Request) {
  const auth = await requireAccessToken();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const system =
    "You are DealForge, a concise B2B enterprise sales coach. Give practical, actionable advice for winning high-value clients. Keep answers under 200 words.";

  const result = await sendAiMessage(auth.accessToken, [
    { role: "user", content: `${system}\n\nLearner question: ${prompt}` },
  ]);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.code },
      { status: result.status }
    );
  }

  await recordLearningEvent(auth.session, "lesson_started", {
    source: "sales_coach_ai",
    lesson_id: body.lessonId,
    prompt_length: prompt.length,
  });

  return NextResponse.json({ answer: result.content });
}
