import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode } from "@/lib/app-config";
import { trackEvent } from "@/lib/events";
import { LudwittApiError } from "@/lib/ludwitt/client";
import { getLudwittConfig } from "@/lib/ludwitt/config";
import { aiMessages } from "@/lib/ludwitt/data";
import { getQuestion } from "@/lib/questions";
import { requireSession } from "@/lib/session";

const bodySchema = z.object({
  sessionId: z.string().min(3),
  questionId: z.string().min(1),
  answer: z.string().min(20).max(8000),
});

function localCoachFeedback(prompt: string, answer: string, track: string) {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const hasNumbers = /\d/.test(answer);
  const structureHints =
    track === "behavioral"
      ? ["Open with situation + task in one sentence.", "Make the action section the longest part.", "End with a measurable result."]
      : track === "system-design"
        ? ["State requirements and constraints first.", "Call out one clear tradeoff (latency, cost, or consistency).", "Mention failure modes / scaling bottleneck."]
        : ["State the approach before details.", "Give time and space complexity explicitly.", "Name one edge case you would test."];

  const specificity = hasNumbers ? 4 : 3;
  const structure = words >= 80 ? 4 : words >= 40 ? 3 : 2;
  const signal = Math.min(5, Math.round((specificity + structure) / 2 + (words > 120 ? 1 : 0)));

  return [
    `Local coach (demo — not Ludwitt AI)`,
    ``,
    `Scores: structure ${structure}/5 · specificity ${specificity}/5 · signal ${signal}/5`,
    ``,
    `You wrote about ${words} words on: "${prompt.slice(0, 90)}${prompt.length > 90 ? "…" : ""}"`,
    ``,
    `Improvements:`,
    ...structureHints.map((h, i) => `${i + 1}. ${h}`),
  ].join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const parsed = bodySchema.parse(await request.json());
    const question = getQuestion(parsed.questionId);
    if (!question) {
      return NextResponse.json({ error: "unknown_question" }, { status: 404 });
    }

    if (session.demo || isDemoMode()) {
      const feedback = localCoachFeedback(
        question.prompt,
        parsed.answer,
        question.track,
      );

      await trackEvent(session.accessToken, {
        eventType: "feedback_requested",
        sessionId: parsed.sessionId,
        track: question.track,
        questionId: parsed.questionId,
        userSub: session.user.sub,
        properties: { source: "local_coach" },
      });

      return NextResponse.json({ feedback, credits: null, demo: true });
    }

    const cfg = getLudwittConfig();
    const result = await aiMessages(session.accessToken, {
      model: cfg.aiModel,
      max_tokens: 1024,
      system:
        "You are a concise interview coach. Score the answer 1-5 for structure, specificity, and signal. Give 3 concrete improvements. Keep under 180 words.",
      messages: [
        {
          role: "user",
          content: `Question (${question.track}): ${question.prompt}\n\nCandidate answer:\n${parsed.answer}`,
        },
      ],
    });

    const feedback =
      result.content
        ?.filter((c) => c.type === "text" && c.text)
        .map((c) => c.text)
        .join("\n") || "No feedback returned.";

    await trackEvent(session.accessToken, {
      eventType: "feedback_requested",
      sessionId: parsed.sessionId,
      track: question.track,
      questionId: parsed.questionId,
      userSub: session.user.sub,
      properties: {
        chargedCostCents:
          result["x-ludwitt-credits"]?.chargedCostCents ?? null,
        transactionId: result["x-ludwitt-credits"]?.transactionId ?? null,
      },
    });

    return NextResponse.json({
      feedback,
      credits: result["x-ludwitt-credits"] ?? null,
      demo: false,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    if (error instanceof LudwittApiError) {
      const insufficient =
        error.status === 402 ||
        error.code === "INSUFFICIENT_PAID_CREDITS" ||
        error.error === "insufficient_paid_credits";
      return NextResponse.json(
        {
          error: error.error,
          code: error.code,
          message: insufficient
            ? "You're out of Ludwitt credits for third-party apps — top up at https://pitchrise.ludwitt.com/account/credits"
            : error.message,
          details: error.details,
          topUpUrl: insufficient
            ? "https://pitchrise.ludwitt.com/account/credits"
            : undefined,
        },
        { status: error.status },
      );
    }
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
