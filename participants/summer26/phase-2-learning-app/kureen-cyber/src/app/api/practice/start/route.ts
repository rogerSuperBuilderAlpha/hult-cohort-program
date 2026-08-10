import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { trackEvent, upsertSessionDoc } from "@/lib/events";
import { LudwittApiError } from "@/lib/ludwitt/client";
import { questionsForTrack, type InterviewTrack } from "@/lib/questions";
import { requireSession } from "@/lib/session";

const bodySchema = z.object({
  track: z.enum(["behavioral", "system-design", "algorithms"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const parsed = bodySchema.parse(await request.json());
    const track = parsed.track as InterviewTrack;
    const questions = questionsForTrack(track);
    const sessionId = `ses_${Date.now()}_${randomBytes(4).toString("hex")}`;
    const createdAt = new Date().toISOString();

    await upsertSessionDoc(
      session.accessToken,
      sessionId,
      {
        status: "in_progress",
        createdAt,
        track,
        questionIds: questions.map((q) => q.id),
        answers: {},
        userSub: session.user.sub,
      },
      session.user.sub,
    );

    await trackEvent(session.accessToken, {
      eventType: "session_start",
      sessionId,
      track,
      userSub: session.user.sub,
      properties: {
        questionCount: questions.length,
      },
    });

    return NextResponse.json({
      sessionId,
      track,
      questions,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
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
