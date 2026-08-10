import { NextResponse } from "next/server";
import { forwardTelemetry } from "@/lib/telemetry-server";

type TelemetryBody = {
  app?: string;
  type?: string;
  details?: Record<string, unknown>;
  jwt?: string | null;
};

export async function POST(request: Request) {
  let body: TelemetryBody;
  try {
    body = (await request.json()) as TelemetryBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.type || typeof body.type !== "string") {
    return NextResponse.json({ error: "type is required" }, { status: 400 });
  }

  const authHeader = request.headers.get("authorization");
  const jwtFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;
  const jwt = jwtFromHeader || body.jwt || null;

  const result = await forwardTelemetry({
    app:
      typeof body.app === "string" && body.app.length > 0
        ? body.app
        : "trinidad-tobago-trivia-app",
    type: body.type,
    details:
      body.details && typeof body.details === "object" ? body.details : {},
    jwt,
  });

  // Always acknowledge locally so the learner UI stays resilient.
  return NextResponse.json(
    {
      ok: true,
      forwarded: result.ok,
      upstreamStatus: result.status,
      ...(result.upstreamError ? { upstreamError: result.upstreamError } : {}),
    },
    { status: 200 },
  );
}
