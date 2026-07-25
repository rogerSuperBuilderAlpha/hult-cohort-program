import "server-only";

import { createServiceClient } from "@/lib/supabase/admin";
import { createNotifications } from "@/lib/notify-server";
import { getPMAdapter } from "@/lib/forth";
import type { ForthTicket, PMEvent } from "@/lib/forth/types";

export type TicketLinkRow = {
  id: string;
  message_id: string | null;
  channel_id: string;
  forth_ticket_id: string;
  forth_url: string;
  title_snapshot: string;
  status_snapshot: string;
  assignee_email_snapshot: string | null;
  created_by: string;
  last_synced_at: string;
};

export async function upsertTicketLinkFromTicket(input: {
  ticket: ForthTicket;
  channelId: string;
  messageId?: string | null;
  createdBy: string;
}): Promise<TicketLinkRow> {
  const admin = createServiceClient();
  const { data: existing } = await admin
    .from("ticket_links")
    .select("*")
    .eq("forth_ticket_id", input.ticket.id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await admin
      .from("ticket_links")
      .update({
        forth_url: input.ticket.url,
        title_snapshot: input.ticket.title,
        status_snapshot: input.ticket.status,
        assignee_email_snapshot: input.ticket.assigneeEmail,
        last_synced_at: new Date().toISOString(),
        message_id: input.messageId ?? existing.message_id,
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as TicketLinkRow;
  }

  const { data, error } = await admin
    .from("ticket_links")
    .insert({
      message_id: input.messageId ?? null,
      channel_id: input.channelId,
      forth_ticket_id: input.ticket.id,
      forth_url: input.ticket.url,
      title_snapshot: input.ticket.title,
      status_snapshot: input.ticket.status,
      assignee_email_snapshot: input.ticket.assigneeEmail,
      created_by: input.createdBy,
      last_synced_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as TicketLinkRow;
}

async function resolveProfileIdByEmail(email: string | null | undefined) {
  if (!email) return null;
  const admin = createServiceClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", email.trim())
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

async function maybeSetForthUserRef(email: string | null, ticketId: string) {
  if (!email) return;
  const admin = createServiceClient();
  await admin
    .from("profiles")
    .update({ forth_user_ref: ticketId })
    .ilike("email", email.trim())
    .is("forth_user_ref", null);
}

async function subscriberIdsForMessage(messageId: string | null) {
  if (!messageId) return [] as string[];
  const admin = createServiceClient();
  const { data: msg } = await admin
    .from("messages")
    .select("id, author_id, thread_root_id")
    .eq("id", messageId)
    .maybeSingle();
  if (!msg) return [];

  const rootId = (msg.thread_root_id as string | null) ?? (msg.id as string);
  const ids = new Set<string>([msg.author_id as string]);

  const { data: subs } = await admin
    .from("thread_subscriptions")
    .select("user_id")
    .eq("thread_root_id", rootId);
  for (const s of subs ?? []) ids.add(s.user_id as string);

  const { data: replies } = await admin
    .from("messages")
    .select("author_id")
    .eq("thread_root_id", rootId);
  for (const r of replies ?? []) ids.add(r.author_id as string);

  return Array.from(ids);
}

/** Apply a Forth webhook/poll delta → TicketLink snapshots + notifications. */
export async function applyForthEvent(event: PMEvent): Promise<{
  updated: boolean;
  linkId: string | null;
}> {
  const admin = createServiceClient();
  const { data: link } = await admin
    .from("ticket_links")
    .select("*")
    .eq("forth_ticket_id", event.ticket.id)
    .maybeSingle();

  if (!link) {
    // No local TicketLink yet — still notify assignee on assign events
    if (event.type === "ticket.assigned" && event.ticket.assigneeEmail) {
      const userId = await resolveProfileIdByEmail(event.ticket.assigneeEmail);
      if (userId) {
        await maybeSetForthUserRef(event.ticket.assigneeEmail, event.ticket.id);
        await createNotifications([
          {
            userId,
            type: "forth_assigned",
            actorId: null,
            entityRef: `forth:${event.ticket.id}`,
          },
        ]);
      }
    }
    return { updated: false, linkId: null };
  }

  const prevStatus = link.status_snapshot as string;
  const prevAssignee = link.assignee_email_snapshot as string | null;

  const { error } = await admin
    .from("ticket_links")
    .update({
      forth_url: event.ticket.url,
      title_snapshot: event.ticket.title,
      status_snapshot: event.ticket.status,
      assignee_email_snapshot: event.ticket.assigneeEmail,
      last_synced_at: new Date().toISOString(),
    })
    .eq("id", link.id);
  if (error) throw new Error(error.message);

  const notifyRows: {
    userId: string;
    type: "forth_assigned" | "forth_status";
    actorId: string | null;
    entityRef: string;
  }[] = [];

  const entityRef = `forth:${event.ticket.id}`;

  if (
    event.type === "ticket.assigned" ||
    (event.ticket.assigneeEmail &&
      event.ticket.assigneeEmail !== prevAssignee)
  ) {
    const userId = await resolveProfileIdByEmail(event.ticket.assigneeEmail);
    if (userId) {
      await maybeSetForthUserRef(event.ticket.assigneeEmail, event.ticket.id);
      notifyRows.push({
        userId,
        type: "forth_assigned",
        actorId: null,
        entityRef,
      });
    }
  }

  if (
    event.type === "ticket.status_changed" ||
    event.ticket.status !== prevStatus
  ) {
    const recipients = new Set<string>([link.created_by as string]);
    for (const id of await subscriberIdsForMessage(
      (link.message_id as string | null) ?? null,
    )) {
      recipients.add(id);
    }
    for (const userId of recipients) {
      notifyRows.push({
        userId,
        type: "forth_status",
        actorId: null,
        entityRef,
      });
    }
  }

  if (notifyRows.length) await createNotifications(notifyRows);
  return { updated: true, linkId: link.id as string };
}

/** Poll TicketLinks touched in the last 14 days (PRD §7.3 fallback). */
export async function pollRecentTicketLinks(): Promise<{
  checked: number;
  changed: number;
}> {
  const admin = createServiceClient();
  const adapter = getPMAdapter();
  const since = new Date();
  since.setDate(since.getDate() - 14);

  const { data: links, error } = await admin
    .from("ticket_links")
    .select("*")
    .gte("last_synced_at", since.toISOString())
    .order("last_synced_at", { ascending: true })
    .limit(100);
  if (error) throw new Error(error.message);

  let changed = 0;
  for (const link of links ?? []) {
    const ticket = await adapter.getTicket(link.forth_ticket_id as string);
    if (!ticket) continue;

    const statusChanged = ticket.status !== link.status_snapshot;
    const assigneeChanged =
      (ticket.assigneeEmail || null) !==
      (link.assignee_email_snapshot || null);

    if (!statusChanged && !assigneeChanged) {
      await admin
        .from("ticket_links")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("id", link.id);
      continue;
    }

    await applyForthEvent({
      type: statusChanged ? "ticket.status_changed" : "ticket.assigned",
      ticket,
      previousStatus: link.status_snapshot as string,
    });
    changed += 1;
  }

  return { checked: links?.length ?? 0, changed };
}
