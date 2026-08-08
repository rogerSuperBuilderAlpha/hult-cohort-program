import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { trackEvent, upsertSessionDoc } from "@/lib/events";
import { LudwittApiError } from "@/lib/ludwitt/client";
import { requireSession } from "@/lib/session";

const bodySchema = z.object({
  sessionId: z.string().min(3),
  track: z.enum(["behavioral", "system-design", "algorithms"]),
  answeredCount: z.number().int().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const parsed = bodySchema.parse(await request.json());
    const completedAt = new Date().toISOString();

    await upsertSessionDoc(
      session.accessToken,
      parsed.sessionId,
      {
        status: "completed",
        completedAt,
        track: parsed.track,
        answeredCount: parsed.answeredCount,
        userSub: session.user.sub,
      },
      session.user.sub,
    );

    await trackEvent(session.accessToken, {
      eventType: "session_complete",
      sessionId: parsed.sessionId,
      track: parsed.track,
      userSub: session.user.sub,
      properties: {
        answeredCount: parsed.answeredCount,
      },
    });

    return NextResponse.json({ ok: true, completedAt });
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
