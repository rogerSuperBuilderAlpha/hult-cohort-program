import { NextResponse } from "next/server";
import { verifyLaunchToken } from "@/lib/ludwitt";
import { SESSION_COOKIE, type LearnerSession } from "@/lib/session";
import { randomUUID } from "crypto";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const result = await verifyLaunchToken(token);

  if (!result.ok) {
    const gate = new URL("/launch", url.origin);
    gate.searchParams.set("error", result.reason);
    return NextResponse.redirect(gate);
  }

  const session: LearnerSession = {
    userId: result.payload.sub,
    email: result.payload.email,
    appId: result.payload.app_id,
    sessionId: randomUUID(),
    launchedAt: new Date().toISOString(),
    source: "ludwitt",
  };

  const dest = new URL("/modules/cold-open", url.origin);
  const res = NextResponse.redirect(dest);
  res.cookies.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
