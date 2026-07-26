import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

type WebhookBody = {
  taskId?: string;
  title?: string;
  status?: string;
  message?: string;
};

export async function POST(request: Request) {
  const secret = request.headers.get("x-forth-webhook-secret");
  const expected = process.env.FORTH_WEBHOOK_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: WebhookBody;
  try {
    body = (await request.json()) as WebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const taskId = body.taskId?.trim();
  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 });
  }

  const pmBase =
    process.env.NEXT_PUBLIC_PM_PLATFORM_URL?.replace(/\/+$/, "") ??
    "https://forth-bice.vercel.app";
  const link = `${pmBase}/?taskId=${encodeURIComponent(taskId)}`;
  const line =
    body.message?.trim() ||
    `Forth update: ${body.title ?? "Task"} (${body.status ?? "changed"}) — ${link}`;

  try {
    const supabase = createServiceClient();
    const { data: channel } = await supabase
      .from("channels")
      .select("id")
      .eq("slug", "forth-updates")
      .single();

    if (!channel) {
      return NextResponse.json({ error: "forth-updates channel missing" }, { status: 500 });
    }

    const { error } = await supabase.from("messages").insert({
      channel_id: channel.id,
      user_id: null,
      body: line,
      is_system: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
