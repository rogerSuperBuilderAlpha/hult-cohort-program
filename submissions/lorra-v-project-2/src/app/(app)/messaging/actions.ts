"use server";

import { createClient } from "@/lib/supabase/server";
import { extractMentionIds } from "@/lib/format";
import {
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_BYTES,
  type Message,
} from "@/lib/types";
import { createServiceClient } from "@/lib/supabase/admin";
import { createNotifications } from "@/lib/notify-server";
import {
  getTicketLinksForMessageIds,
  unfurlForthUrlsInMessage,
} from "@/app/(app)/forth/actions";

export type MessageParentType = "channel" | "conversation";

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

export async function listParentMessages(
  parentType: MessageParentType,
  parentId: string,
): Promise<Message[]> {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      profiles:author_id ( id, display_name, avatar_url, email ),
      reactions ( message_id, user_id, emoji ),
      attachments ( id, message_id, file_url, file_name, mime_type, size_bytes ),
      mentions ( message_id, mentioned_user_id )
    `,
    )
    .eq("parent_type", parentType)
    .eq("parent_id", parentId)
    .is("thread_root_id", null)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) throw new Error(error.message);

  const roots = (data ?? []) as Message[];
  if (roots.length === 0) return [];

  const rootIds = roots.map((m) => m.id);
  const { data: replies } = await supabase
    .from("messages")
    .select(
      `
      thread_root_id,
      author_id,
      created_at,
      profiles:author_id ( id, display_name, avatar_url )
    `,
    )
    .in("thread_root_id", rootIds)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const byRoot = new Map<
    string,
    {
      count: number;
      last_reply_at: string | null;
      participants: Map<string, { id: string; display_name: string; avatar_url: string | null }>;
    }
  >();

  for (const r of replies ?? []) {
    if (!r.thread_root_id) continue;
    const cur = byRoot.get(r.thread_root_id) ?? {
      count: 0,
      last_reply_at: null,
      participants: new Map(),
    };
    cur.count += 1;
    cur.last_reply_at = r.created_at;
    const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    if (p) {
      cur.participants.set(p.id, {
        id: p.id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
      });
    }
    byRoot.set(r.thread_root_id, cur);
  }

  const ticketLinks = await getTicketLinksForMessageIds(rootIds);

  return roots.map((m) => {
    const meta = byRoot.get(m.id);
    const author = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    const participants = new Map(meta?.participants ?? []);
    if (author) {
      participants.set(author.id, {
        id: author.id,
        display_name: author.display_name,
        avatar_url: author.avatar_url,
      });
    }
    const link = ticketLinks[m.id];
    return {
      ...m,
      profiles: author,
      reply_count: meta?.count ?? 0,
      last_reply_at: meta?.last_reply_at ?? null,
      participants: Array.from(participants.values()),
      ticket_link: link
        ? {
            id: link.id,
            forth_ticket_id: link.forth_ticket_id,
            forth_url: link.forth_url,
            title_snapshot: link.title_snapshot,
            status_snapshot: link.status_snapshot,
            assignee_email_snapshot: link.assignee_email_snapshot,
            last_synced_at: link.last_synced_at,
          }
        : null,
    };
  });
}

export async function sendParentMessage(input: {
  parentType: MessageParentType;
  parentId: string;
  pathKey: string;
  body: string;
  memberProfiles: { id: string; display_name: string }[];
  files?: {
    file_url: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
  }[];
}): Promise<Message> {
  const { supabase, profile } = await requireUser();
  const body =
    input.body.trim() || (input.files?.length ? "(attachment)" : "");
  if (!body) throw new Error("Message cannot be empty");

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      parent_type: input.parentType,
      parent_id: input.parentId,
      author_id: profile.id,
      body_richtext: body,
    })
    .select(
      `
      *,
      profiles:author_id ( id, display_name, avatar_url, email )
    `,
    )
    .single();

  if (error) throw new Error(error.message);

  const mentionIds = extractMentionIds(body, input.memberProfiles).filter(
    (id) => id !== profile.id,
  );
  if (mentionIds.length) {
    await supabase.from("mentions").insert(
      mentionIds.map((mentioned_user_id) => ({
        message_id: message.id,
        mentioned_user_id,
      })),
    );
  }

  for (const file of input.files ?? []) {
    const { error: attErr } = await supabase.from("attachments").insert({
      message_id: message.id,
      file_url: file.file_url,
      file_name: file.file_name,
      mime_type: file.mime_type,
      size_bytes: file.size_bytes,
    });
    if (attErr) throw new Error(attErr.message);
  }

  // PRD §4.4 — mentions + DMs (channel-message dots are sidebar-only later)
  try {
    if (input.parentType === "conversation") {
      const { data: members } = await supabase
        .from("conversation_members")
        .select("user_id")
        .eq("conversation_id", input.parentId);
      const recipients = (members ?? [])
        .map((m) => m.user_id as string)
        .filter((id) => id !== profile.id);
      await createNotifications(
        recipients.map((userId) => ({
          userId,
          type: "dm" as const,
          actorId: profile.id,
          entityRef: `conversation:${input.parentId}:message:${message.id}`,
        })),
      );
      if (mentionIds.length) {
        await createNotifications(
          mentionIds.map((userId) => ({
            userId,
            type: "mention" as const,
            actorId: profile.id,
            entityRef: `conversation:${input.parentId}:message:${message.id}`,
          })),
        );
      }
    } else if (mentionIds.length) {
      const { data: members } = await supabase
        .from("channel_members")
        .select("user_id, notification_level")
        .eq("channel_id", input.parentId);
      const levelByUser = new Map(
        (members ?? []).map((m) => [
          m.user_id as string,
          (m.notification_level as string) || "all",
        ]),
      );
      const mentionRecipients = mentionIds.filter((id) => {
        const level = levelByUser.get(id) || "all";
        return level !== "mute";
      });
      if (mentionRecipients.length) {
        await createNotifications(
          mentionRecipients.map((userId) => ({
            userId,
            type: "mention" as const,
            actorId: profile.id,
            entityRef: `channel:${input.pathKey}:message:${message.id}`,
          })),
        );
      }
    }
  } catch (e) {
    console.warn("notify after send failed", e instanceof Error ? e.message : e);
  }

  let bodyFinal = body;
  try {
    bodyFinal = await unfurlForthUrlsInMessage({
      messageId: message.id as string,
      body,
      parentType: input.parentType,
      parentId: input.parentId,
    });
  } catch (e) {
    console.warn("forth unfurl failed", e instanceof Error ? e.message : e);
  }

  const ticketLinks = await getTicketLinksForMessageIds([message.id as string]);
  const link = ticketLinks[message.id as string];

  return {
    ...(message as Message),
    body_richtext: bodyFinal,
    profiles: Array.isArray(message.profiles) ? message.profiles[0] : message.profiles,
    ticket_link: link
      ? {
          id: link.id,
          forth_ticket_id: link.forth_ticket_id,
          forth_url: link.forth_url,
          title_snapshot: link.title_snapshot,
          status_snapshot: link.status_snapshot,
          assignee_email_snapshot: link.assignee_email_snapshot,
          last_synced_at: link.last_synced_at,
        }
      : null,
  };
}

export async function editParentMessage(input: {
  messageId: string;
  body: string;
  parentType: MessageParentType;
  pathKey: string;
}) {
  const { supabase, profile } = await requireUser();
  const body = input.body.trim();
  if (!body) throw new Error("Message cannot be empty");

  const { data: existing, error: readErr } = await supabase
    .from("messages")
    .select("id, author_id, created_at, edited_at")
    .eq("id", input.messageId)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!existing) throw new Error("Message not found");
  if (existing.author_id !== profile.id && profile.role !== "admin") {
    throw new Error("Not allowed to edit this message");
  }

  const start = new Date(existing.edited_at || existing.created_at).getTime();
  if (Date.now() - start > 15 * 60 * 1000 && profile.role !== "admin") {
    throw new Error("Edit window expired (15 minutes)");
  }

  const { error } = await supabase
    .from("messages")
    .update({ body_richtext: body, edited_at: new Date().toISOString() })
    .eq("id", input.messageId);
  if (error) throw new Error(error.message);
}

export async function deleteParentMessage(input: {
  messageId: string;
  parentType: MessageParentType;
  pathKey: string;
}) {
  const { supabase, profile } = await requireUser();
  const { data: existing, error: readErr } = await supabase
    .from("messages")
    .select("id, author_id")
    .eq("id", input.messageId)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!existing) throw new Error("Message not found");
  if (existing.author_id !== profile.id && profile.role !== "admin") {
    throw new Error("Not allowed to delete this message");
  }

  const { error } = await supabase
    .from("messages")
    .update({ deleted_at: new Date().toISOString(), body_richtext: "" })
    .eq("id", input.messageId);
  if (error) throw new Error(error.message);
}

export async function toggleParentReaction(input: {
  messageId: string;
  emoji: string;
  parentType: MessageParentType;
  pathKey: string;
}) {
  const { supabase, profile } = await requireUser();
  const { data: existing } = await supabase
    .from("reactions")
    .select("message_id")
    .eq("message_id", input.messageId)
    .eq("user_id", profile.id)
    .eq("emoji", input.emoji)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("reactions")
      .delete()
      .eq("message_id", input.messageId)
      .eq("user_id", profile.id)
      .eq("emoji", input.emoji);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("reactions").insert({
      message_id: input.messageId,
      user_id: profile.id,
      emoji: input.emoji,
    });
    if (error) throw new Error(error.message);
  }
}

export async function uploadAttachment(formData: FormData): Promise<{
  file_url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
}> {
  const { supabase, profile } = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file provided");
  if (file.size > MAX_ATTACHMENT_BYTES) throw new Error("File exceeds 10 MB limit");
  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
    throw new Error("Unsupported file type");
  }

  const admin = createServiceClient();
  await admin.storage
    .createBucket("attachments", {
      public: false,
      fileSizeLimit: MAX_ATTACHMENT_BYTES,
      allowedMimeTypes: ALLOWED_ATTACHMENT_TYPES,
    })
    .catch(() => undefined);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${profile.id}/${Date.now()}-${safeName}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage
    .from("attachments")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (upErr) throw new Error(upErr.message);

  const { data: signed, error: signErr } = await supabase.storage
    .from("attachments")
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signErr || !signed?.signedUrl) {
    throw new Error(signErr?.message || "Could not sign URL");
  }

  return {
    file_url: signed.signedUrl,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    storage_path: path,
  };
}
