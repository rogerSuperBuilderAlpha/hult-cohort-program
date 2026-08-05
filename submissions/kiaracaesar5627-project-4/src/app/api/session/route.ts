import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyLaunchToken } from "@/lib/ludwitt";
import { recordEvent, SEEDED_APP } from "@/lib/platform/store";

export type LearnerSession = {
  user_id: string;
  email: string;
  app_id: string;
  session_id: string;
};

const COOKIE = "pf_session";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { token?: string };
  if (!body.token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  const verified = await verifyLaunchToken(body.token);
  if (!verified.ok) {
    return NextResponse.json(
      { error: "Launch from Ludwitt/Hult", code: verified.error },
      { status: 401 },
    );
  }

  if (verified.claims.app_id !== SEEDED_APP.app_id) {
    return NextResponse.json({ error: "wrong app_id" }, { status: 401 });
  }

  const session: LearnerSession = {
    user_id: verified.claims.sub,
    email: verified.claims.email,
    app_id: verified.claims.app_id,
    session_id: crypto.randomUUID(),
  };

  const jar = await cookies();
  jar.set(COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  recordEvent(SEEDED_APP.app_id, {
    event: "lesson_started",
    user_id: session.user_id,
    session_id: session.session_id,
    metadata: { lesson_id: "session-open", via: "launch" },
    sandbox: false,
  });

  return NextResponse.json({ ok: true, session });
}

export async function GET() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return NextResponse.json({ session: null });
  try {
    const session = JSON.parse(raw) as LearnerSession;
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ session: null });
  }
}
