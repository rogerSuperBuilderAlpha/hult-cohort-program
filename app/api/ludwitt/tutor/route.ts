import { NextRequest, NextResponse } from "next/server";
import { callLudwittAi } from "@/lib/ludwitt/client";
import { LUDWITT_URLS } from "@/lib/ludwitt/config";

type TutorBody = {
  question?: string;
  answer?: string;
  explanation?: string;
  category?: string;
};

export async function POST(request: NextRequest) {
  let body: TutorBody;
  try {
    body = (await request.json()) as TutorBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json(
      { error: "question is required" },
      { status: 400 },
    );
  }

  try {
    const result = await callLudwittAi({
      model: "claude-sonnet-4-6",
      maxTokens: 700,
      system:
        "You are Trini Tutor for TriniIQ Masterclass — a warm, precise coach for Trinidad & Tobago culture, history, geography, cuisine, and sports. Keep answers to 2–4 short paragraphs. Prefer concrete local detail. No markdown headings.",
      messages: [
        {
          role: "user",
          content: [
            `Category: ${body.category || "General"}`,
            `Learner question / card: ${question}`,
            body.answer ? `Canonical answer: ${body.answer}` : "",
            body.explanation ? `Lesson note: ${body.explanation}` : "",
            "",
            "Help the learner understand this concept more deeply with one memorable local example and one quick self-check question.",
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    });

    return NextResponse.json({
      ok: true,
      text: result.text,
      credits: result.credits,
      usage: result.usage,
      topUpUrl: LUDWITT_URLS.topUp,
    });
  } catch (error) {
    const err = error as Error & {
      status?: number;
      code?: string;
      topUpUrl?: string;
    };
    const status = err.status || 500;
    return NextResponse.json(
      {
        ok: false,
        error: err.message,
        code: err.code,
        topUpUrl: err.topUpUrl || LUDWITT_URLS.topUp,
      },
      { status },
    );
  }
}
