import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { trackEvent, upsertSessionDoc } from "@/lib/events";
import { LudwittApiError } from "@/lib/ludwitt/client";
import { getQuestion } from "@/lib/questions";
import { requireSession } from "@/lib/session";

const bodySchema = z.object({
  sessionId: z.string().min(3),
  questionId: z.string().min(1),
  track: z.enum(["behavioral", "system-design", "algorithms"]),
  answer: z.string().min(20).max(8000),
  answeredCount: z.number().int().min(1),
  totalQuestions: z.number().int().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const parsed = bodySchema.parse(await request.json());
    const question = getQuestion(parsed.questionId);
    if (!question) {
      return NextResponse.json({ error: "unknown_question" }, { status: 404 });
    }

    const updatedAt = new Date().toISOString();

    await upsertSessionDoc(
      session.accessToken,
      parsed.sessionId,
      {
        status: "in_progress",
        updatedAt,
        track: parsed.track,
        lastQuestionId: parsed.questionId,
        answeredCount: parsed.answeredCount,
        totalQuestions: parsed.totalQuestions,
        userSub: session.user.sub,
      },
      session.user.sub,
    );

    await trackEvent(session.accessToken, {
      eventType: "answer_submitted",
      sessionId: parsed.sessionId,
      track: parsed.track,
      questionId: parsed.questionId,
      userSub: session.user.sub,
      properties: {
        answerLength: parsed.answer.length,
        answeredCount: parsed.answeredCount,
      },
    });

    return NextResponse.json({ ok: true, updatedAt });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "invalid_body", details: error.flatten() },
        { status: 400 },
      );
    }
    if (error instanceof LudwittApiError) {
      return NextResponse.json(
        { error: error.error, message: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
