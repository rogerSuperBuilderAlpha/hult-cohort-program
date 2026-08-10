import { NextResponse } from "next/server";
import { forwardTelemetry } from "@/lib/telemetry-server";

type SessionCompleteBody = {
  app?: string;
  jwt?: string | null;
  finalScore?: number;
  total?: number;
  bestStreak?: number;
  masteredTotal?: number;
  seconds?: number;
  missedCount?: number;
  rematchScore?: number;
  rematchTotal?: number;
  composition?: Record<string, number> | null;
  category?: string;
  completedAt?: string;
};

function isNonNegInt(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export async function POST(request: Request) {
  let body: SessionCompleteBody;
  try {
    body = (await request.json()) as SessionCompleteBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isNonNegInt(body.finalScore) || !isNonNegInt(body.total)) {
    return NextResponse.json(
      { error: "finalScore and total are required non-negative numbers" },
      { status: 400 },
    );
  }

  const authHeader = request.headers.get("authorization");
  const jwtFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;
  const jwt = jwtFromHeader || body.jwt || null;

  const details = {
    finalScore: body.finalScore,
    total: body.total,
    bestStreak: isNonNegInt(body.bestStreak) ? body.bestStreak : 0,
    masteredTotal: isNonNegInt(body.masteredTotal) ? body.masteredTotal : 0,
    seconds: isNonNegInt(body.seconds) ? body.seconds : 0,
    missedCount: isNonNegInt(body.missedCount) ? body.missedCount : 0,
    rematchScore: isNonNegInt(body.rematchScore) ? body.rematchScore : 0,
    rematchTotal: isNonNegInt(body.rematchTotal) ? body.rematchTotal : 0,
    composition: body.composition ?? null,
    category: typeof body.category === "string" ? body.category : "All",
    completedAt:
      typeof body.completedAt === "string"
        ? body.completedAt
        : new Date().toISOString(),
    accuracy:
      body.total > 0
        ? Math.round((body.finalScore / body.total) * 1000) / 10
        : 0,
  };

  const app =
    typeof body.app === "string" && body.app.length > 0
      ? body.app
      : "trinidad-tobago-trivia-app";

  const result = await forwardTelemetry({
    app,
    type: "SESSION_COMPLETED",
    details,
    jwt,
  });

  return NextResponse.json(
    {
      ok: true,
      received: details,
      forwarded: result.ok,
      upstreamStatus: result.status,
      ...(result.upstreamError ? { upstreamError: result.upstreamError } : {}),
    },
    { status: 200 },
  );
}
