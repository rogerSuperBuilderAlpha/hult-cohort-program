import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { ludwitt } from "@/lib/config";
import { newSessionId, recordLearningEvent } from "@/lib/ludwitt/events";
import { setSession } from "@/lib/ludwitt/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${ludwitt.appUrl}/?launch_error=missing_token`);
  }

  if (!ludwitt.jwtSecret) {
    return NextResponse.redirect(`${ludwitt.appUrl}/?launch_error=jwt_not_configured`);
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(ludwitt.jwtSecret)
    );
    const sub = String(payload.sub ?? "");
    const email = String(payload.email ?? "");
    const appId = String(payload.app_id ?? "");

    if (!sub || !email) {
      return NextResponse.redirect(`${ludwitt.appUrl}/?launch_error=invalid_payload`);
    }

    if (ludwitt.hultAppId && appId && appId !== ludwitt.hultAppId) {
      return NextResponse.redirect(`${ludwitt.appUrl}/?launch_error=app_mismatch`);
    }

    const session = {
      sub,
      email,
      sessionId: newSessionId(),
      authMethod: "jwt_launch" as const,
    };
    await setSession(session);
    await recordLearningEvent(session, "lesson_started", {
      source: "jwt_launch",
    });

    return NextResponse.redirect(`${ludwitt.appUrl}/learn`);
  } catch {
    return NextResponse.redirect(`${ludwitt.appUrl}/?launch_error=invalid_token`);
  }
}
