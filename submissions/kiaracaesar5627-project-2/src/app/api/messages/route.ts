import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  getChannelById,
  getConversationForUser,
  listChannelMessages,
  listConversationMessages,
} from "@/lib/db";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId");
  const conversationId = searchParams.get("conversationId");
  const since = searchParams.get("since") ?? undefined;

  if (channelId) {
    const channel = await getChannelById(channelId);
    if (!channel || channel.archived) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const messages = await listChannelMessages(channelId, { since });
    return NextResponse.json({ messages });
  }

  if (conversationId) {
    const conversation = await getConversationForUser(conversationId, user.id);
    if (!conversation) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const messages = await listConversationMessages(conversationId, { since });
    return NextResponse.json({ messages });
  }

  return NextResponse.json({ error: "Missing target" }, { status: 400 });
}
