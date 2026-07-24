"use server";

import { createClient } from "@/lib/supabase/server";
import { getPMAdapter } from "@/lib/forth";
import { upsertTicketLinkFromTicket, type TicketLinkRow } from "@/lib/forth/sync";
import type { MessageParentType } from "@/app/(app)/messaging/actions";

import {
  forthTicketIdFromUrl,
  ticketCardBody,
  TICKET_MARKER_RE,
} from "@/lib/forth/ticket-card";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email, role, avatar_url, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.status !== "active") throw new Error("Inactive profile");
  return { supabase, user, profile };
}

async function resolveChannelId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  parentType: MessageParentType,
  parentId: string,
): Promise<string> {
  if (parentType === "channel") return parentId;
  const { data } = await supabase
    .from("channels")
    .select("id")
    .eq("name", "general")
    .eq("is_archived", false)
    .maybeSingle();
  if (!data) throw new Error("No #general channel to attach TicketLink");
  return data.id as string;
}

export async function listAssigneeOptions(): Promise<
  { id: string; display_name: string; email: string }[]
> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .eq("status", "active")
    .order("display_name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as { id: string; display_name: string; email: string }[];
}

export async function getTicketLinksByIds(
  ids: string[],
): Promise<Record<string, TicketLinkRow>> {
  if (!ids.length) return {};
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("ticket_links")
    .select("*")
    .in("id", ids);
  if (error) throw new Error(error.message);
  const map: Record<string, TicketLinkRow> = {};
  for (const row of data ?? []) {
    map[row.id as string] = row as TicketLinkRow;
  }
  return map;
}

export async function getTicketLinksForMessageIds(
  messageIds: string[],
): Promise<Record<string, TicketLinkRow>> {
  if (!messageIds.length) return {};
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("ticket_links")
    .select("*")
    .in("message_id", messageIds);
  if (error) throw new Error(error.message);
  const map: Record<string, TicketLinkRow> = {};
  for (const row of data ?? []) {
    if (row.message_id) map[row.message_id as string] = row as TicketLinkRow;
  }
  return map;
}

/**
 * Create Forth ticket from a message, post TicketLink card as a thread reply (PRD §7.4).
 */
export async function createTicketFromMessage(input: {
  messageId: string;
  title: string;
  description?: string;
  assigneeEmail?: string | null;
  pathKey: string;
}): Promise<{ ticketLinkId: string; replyId: string; forthUrl: string }> {
  const { supabase, profile } = await requireUser();

  const { data: root, error: rootErr } = await supabase
    .from("messages")
    .select("id, parent_type, parent_id, body_richtext, thread_root_id")
    .eq("id", input.messageId)
    .is("deleted_at", null)
    .maybeSingle();
  if (rootErr) throw new Error(rootErr.message);
  if (!root) throw new Error("Message not found");
  if (root.thread_root_id) {
    throw new Error("Create ticket from a root message (not a thread reply)");
  }

  const parentType = root.parent_type as MessageParentType;
  const parentId = root.parent_id as string;
  const channelId = await resolveChannelId(supabase, parentType, parentId);

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const sourceUrl =
    parentType === "channel"
      ? `${appUrl}/channels/${input.pathKey}?thread=${root.id}`
      : `${appUrl}/messages/${parentId}?thread=${root.id}`;

  const adapter = getPMAdapter();
  const ticket = await adapter.createTicket({
    title: input.title.trim() || "Untitled",
    description:
      input.description?.trim() ||
      String(root.body_richtext || "").slice(0, 2000),
    assigneeEmail: input.assigneeEmail?.trim() || null,
    sourceUrl,
  });

  // Insert thread reply first (placeholder), then TicketLink with message_id = reply
  const { data: reply, error: replyErr } = await supabase
    .from("messages")
    .insert({
      parent_type: parentType,
      parent_id: parentId,
      thread_root_id: root.id,
      author_id: profile.id,
      body_richtext: `Forth ticket: ${ticket.title}`,
    })
    .select("id")
    .single();
  if (replyErr) throw new Error(replyErr.message);

  const link = await upsertTicketLinkFromTicket({
    ticket,
    channelId,
    messageId: reply.id,
    createdBy: profile.id,
  });

  const body = ticketCardBody(link.id, ticket.title, ticket.url);
  const { error: updateErr } = await supabase
    .from("messages")
    .update({ body_richtext: body })
    .eq("id", reply.id);
  if (updateErr) throw new Error(updateErr.message);

  return {
    ticketLinkId: link.id,
    replyId: reply.id as string,
    forthUrl: ticket.url,
  };
}

/**
 * Unfurl Forth ticket URLs in a newly sent message (PRD §7.5).
 * Links TicketLink to the message and rewrites body with a card marker when found.
 */
export async function unfurlForthUrlsInMessage(input: {
  messageId: string;
  body: string;
  parentType: MessageParentType;
  parentId: string;
}): Promise<string> {
  const ids = forthTicketIdFromUrl(input.body);
  if (!ids.length) return input.body;

  const { supabase, profile } = await requireUser();
  const adapter = getPMAdapter();
  const channelId = await resolveChannelId(
    supabase,
    input.parentType,
    input.parentId,
  );

  let nextBody = input.body;
  for (const ticketId of ids) {
    const ticket = await adapter.getTicket(ticketId);
    if (!ticket) continue;

    const link = await upsertTicketLinkFromTicket({
      ticket,
      channelId,
      messageId: input.messageId,
      createdBy: profile.id,
    });

    const card = ticketCardBody(link.id, ticket.title, ticket.url);
    // Replace first occurrence of the URL with the card marker block
    const base =
      process.env.NEXT_PUBLIC_FORTH_BASE_URL?.replace(/\/$/, "") ||
      "https://forth-bice.vercel.app";
    const url = `${base}/t/${ticketId}`;
    if (nextBody.includes(url)) {
      nextBody = nextBody.replace(url, card);
    } else if (!TICKET_MARKER_RE.test(nextBody)) {
      nextBody = `${nextBody.trim()}\n\n${card}`;
    }
  }

  if (nextBody !== input.body) {
    await supabase
      .from("messages")
      .update({ body_richtext: nextBody })
      .eq("id", input.messageId);
  }

  return nextBody;
}
