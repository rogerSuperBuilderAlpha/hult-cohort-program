import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPMAdapter, useForthFixtures } from "@/lib/forth";
import { upsertTicketLinkFromTicket } from "@/lib/forth/sync";

export const runtime = "nodejs";

/**
 * Dev-only: create a fixture Forth ticket + TicketLink for smoke tests.
 * Disabled when FORTH_USE_FIXTURES=false.
 */
export async function POST(request: Request) {
  if (!useForthFixtures()) {
    return NextResponse.json(
      { error: "Dev Forth create only available in fixture mode" },
      { status: 403 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    channelId?: string;
    assigneeEmail?: string;
  };

  let channelId = body.channelId;
  if (!channelId) {
    const { data: channel } = await supabase
      .from("channels")
      .select("id")
      .eq("name", "general")
      .maybeSingle();
    channelId = channel?.id;
  }
  if (!channelId) {
    return NextResponse.json({ error: "No channel found" }, { status: 400 });
  }

  const adapter = getPMAdapter();
  const ticket = await adapter.createTicket({
    title: body.title || `Fixture ticket ${Date.now()}`,
    description: "Created via /api/dev/forth-create",
    assigneeEmail: body.assigneeEmail || "asha@conexus.local",
    sourceUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/channels/general`,
  });

  const link = await upsertTicketLinkFromTicket({
    ticket,
    channelId,
    createdBy: user.id,
  });

  return NextResponse.json({
    ok: true,
    ticket,
    ticketLinkId: link.id,
  });
}
