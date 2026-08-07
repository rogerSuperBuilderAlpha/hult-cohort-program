import { NextResponse } from "next/server";
import {
  authenticateDeveloper,
  getApp,
  getMetrics,
  getStore,
  isBlockedUser,
  recordEvent,
  registerApp,
  type LearningEventName,
} from "@/lib/platform/store";
import { mintLaunchToken } from "@/lib/ludwitt";

const EVENTS = new Set<LearningEventName>([
  "lesson_started",
  "lesson_completed",
  "quiz_submitted",
  "session_heartbeat",
]);

function bearer(req: Request): string {
  const header = req.headers.get("authorization") || "";
  return header.replace(/^Bearer\s+/i, "").trim();
}

function resolveAuth(req: Request) {
  const key = bearer(req);
  const dev = authenticateDeveloper(key);
  if (dev) return { key, kind: "developer" as const, dev };

  for (const app of getStore().apps.values()) {
    if (app.api_key === key) return { key, kind: "app" as const, app };
  }
  return null;
}

export async function POST_register(req: Request) {
  const auth = resolveAuth(req);
  if (!auth || auth.kind !== "developer") {
    return NextResponse.json({ error: "invalid api key" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const title = String(body.title || "");
  const description = String(body.description || "");
  const topic = String(body.topic || "");
  const launch_url = String(body.launch_url || "");
  const repo_url = String(body.repo_url || "");
  const icon_url = body.icon_url ? String(body.icon_url) : undefined;

  if (!title || description.length < 100 || !topic || !launch_url || !repo_url) {
    return NextResponse.json({ error: "missing or invalid fields" }, { status: 400 });
  }

  const creds = registerApp(auth.dev.id, {
    title,
    description,
    topic,
    launch_url,
    repo_url,
    icon_url,
    student_handle: auth.dev.handle,
  });
  return NextResponse.json(creds, { status: 201 });
}

export async function POST_launchToken(req: Request) {
  const auth = resolveAuth(req);
  if (!auth || auth.kind !== "developer") {
    return NextResponse.json({ error: "invalid api key" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    app_id?: string;
    user_id?: string;
    email?: string;
  };
  const appRecord = body.app_id ? getApp(body.app_id) : null;
  if (!appRecord || !body.user_id || !body.email) {
    return NextResponse.json({ error: "app_id, user_id, email required" }, { status: 400 });
  }

  const token = await mintLaunchToken({
    app_id: appRecord.app_id,
    user_id: body.user_id,
    email: body.email,
    jwt_secret: appRecord.jwt_secret,
  });
  return NextResponse.json({
    token,
    launch_url: `${appRecord.launch_url}?token=${encodeURIComponent(token)}`,
  });
}

export async function POST_event(req: Request, appId: string) {
  const auth = resolveAuth(req);
  if (!auth) return NextResponse.json({ error: "invalid api key" }, { status: 401 });

  const appRecord = getApp(appId);
  if (!appRecord) return NextResponse.json({ error: "app not found" }, { status: 404 });

  if (auth.kind === "app" && auth.app.app_id !== appId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    event?: string;
    user_id?: string;
    session_id?: string;
    metadata?: Record<string, unknown>;
  };

  if (!body.event || !body.user_id || !body.session_id) {
    return NextResponse.json(
      { error: "event, user_id, session_id required" },
      { status: 400 },
    );
  }
  if (!EVENTS.has(body.event as LearningEventName)) {
    return NextResponse.json({ error: "invalid event" }, { status: 400 });
  }

  if (isBlockedUser(body.user_id, appRecord.student_handle)) {
    return NextResponse.json({ accepted: true, counted: false }, { status: 202 });
  }

  const sandbox = auth.kind === "developer" ? auth.dev.sandbox : false;
  recordEvent(appId, {
    event: body.event as LearningEventName,
    user_id: body.user_id,
    session_id: body.session_id,
    metadata: body.metadata,
    sandbox,
  });
  return NextResponse.json({ accepted: true, counted: !sandbox }, { status: 202 });
}

export async function GET_metrics(req: Request, appId: string) {
  const auth = resolveAuth(req);
  if (!auth) return NextResponse.json({ error: "invalid api key" }, { status: 401 });

  const appRecord = getApp(appId);
  if (!appRecord) return NextResponse.json({ error: "app not found" }, { status: 404 });

  return NextResponse.json(getMetrics(appId));
}
