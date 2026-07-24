"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { extractMentionIds } from "@/lib/format";
import {
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_BYTES,
  type Channel,
  type Message,
} from "@/lib/types";
import { listParentMessages } from "@/app/(app)/messaging/actions";

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

export async function listVisibleChannels(): Promise<Channel[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .eq("is_archived", false)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Channel[];
}

export async function getChannelBySlug(slug: string): Promise<Channel | null> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .eq("name", slug)
    .eq("is_archived", false)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Channel | null) ?? null;
}

export async function listChannelMessages(channelId: string): Promise<Message[]> {
  return listParentMessages("channel", channelId);
}

export async function listChannelMembers(channelId: string) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("channel_members")
    .select(
      `
      channel_id,
      user_id,
      last_read_at,
      notification_level,
      profiles:user_id ( id, display_name, avatar_url, email, role )
    `,
    )
    .eq("channel_id", channelId);
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const profiles = Array.isArray(row.profiles) ? row.profiles[0] ?? null : row.profiles;
    return {
      channel_id: row.channel_id as string,
      user_id: row.user_id as string,
      last_read_at: (row.last_read_at as string | null) ?? null,
      notification_level: row.notification_level as string,
      profiles: profiles
        ? {
            id: profiles.id as string,
            display_name: profiles.display_name as string,
            avatar_url: (profiles.avatar_url as string | null) ?? null,
            email: profiles.email as string,
            role: profiles.role as string,
          }
        : null,
    };
  });
}

export async function sendChannelMessage(input: {
  channelId: string;
  body: string;
  channelSlug: string;
  mentionedUserIds?: string[];
}): Promise<Message> {
  const { supabase, profile } = await requireUser();
  const body = input.body.trim();
  if (!body) throw new Error("Message cannot be empty");

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      parent_type: "channel",
      parent_id: input.channelId,
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

  const members = await listChannelMembers(input.channelId);
  const memberProfiles = members
    .map((m) => m.profiles)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ id: p.id, display_name: p.display_name }));

  const mentionIds = Array.from(
    new Set([
      ...(input.mentionedUserIds ?? []),
      ...extractMentionIds(body, memberProfiles),
    ]),
  ).filter((id) => id !== profile.id);

  if (mentionIds.length) {
    await supabase.from("mentions").insert(
      mentionIds.map((mentioned_user_id) => ({
        message_id: message.id,
        mentioned_user_id,
      })),
    );
  }

  revalidatePath(`/channels/${input.channelSlug}`);
  return message as Message;
}

export async function editChannelMessage(input: {
  messageId: string;
  body: string;
  channelSlug: string;
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

  revalidatePath(`/channels/${input.channelSlug}`);
}

export async function deleteChannelMessage(input: {
  messageId: string;
  channelSlug: string;
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

  revalidatePath(`/channels/${input.channelSlug}`);
}

export async function toggleReaction(input: {
  messageId: string;
  emoji: string;
  channelSlug: string;
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

  revalidatePath(`/channels/${input.channelSlug}`);
}

export async function createChannel(input: {
  name: string;
  description?: string;
  type: "public" | "private";
}) {
  const { supabase, profile } = await requireUser();
  const name = input.name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
  if (!name) throw new Error("Channel name required");
  if (input.type === "public" && profile.role !== "admin") {
    throw new Error("Only admins can create public channels");
  }

  const { data: workspace } = await supabase.from("workspaces").select("id").limit(1).maybeSingle();
  if (!workspace) throw new Error("No workspace found");

  const { data: channel, error } = await supabase
    .from("channels")
    .insert({
      workspace_id: workspace.id,
      name,
      description: input.description?.trim() || "",
      type: input.type,
      created_by: profile.id,
      admin_post_only: false,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  await supabase.from("channel_members").upsert({
    channel_id: channel.id,
    user_id: profile.id,
    notification_level: "all",
  });

  // Public channels: add all active profiles
  if (input.type === "public") {
    const admin = createServiceClient();
    const { data: profiles } = await admin
      .from("profiles")
      .select("id")
      .eq("status", "active");
    if (profiles?.length) {
      await admin.from("channel_members").upsert(
        profiles.map((p) => ({
          channel_id: channel.id,
          user_id: p.id,
          notification_level: "all" as const,
        })),
        { onConflict: "channel_id,user_id" },
      );
    }
  }

  revalidatePath("/");
  return channel as Channel;
}

export async function archiveChannel(input: { channelId: string; channelSlug: string }) {
  const { supabase, profile } = await requireUser();
  if (profile.role !== "admin") throw new Error("Only admins can archive channels");

  const { error } = await supabase
    .from("channels")
    .update({ is_archived: true })
    .eq("id", input.channelId);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/channels/${input.channelSlug}`);
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

  // Ensure bucket exists (idempotent)
  const admin = createServiceClient();
  await admin.storage.createBucket("attachments", {
    public: false,
    fileSizeLimit: MAX_ATTACHMENT_BYTES,
    allowedMimeTypes: ALLOWED_ATTACHMENT_TYPES,
  }).catch(() => undefined);

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
  if (signErr || !signed?.signedUrl) throw new Error(signErr?.message || "Could not sign URL");

  return {
    file_url: signed.signedUrl,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    storage_path: path,
  };
}

export async function attachFileToMessage(input: {
  messageId: string;
  file_url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  channelSlug: string;
}) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("attachments").insert({
    message_id: input.messageId,
    file_url: input.file_url,
    file_name: input.file_name,
    mime_type: input.mime_type,
    size_bytes: input.size_bytes,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/channels/${input.channelSlug}`);
}

export async function sendChannelMessageWithFiles(input: {
  channelId: string;
  body: string;
  channelSlug: string;
  files?: {
    file_url: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
  }[];
}) {
  const message = await sendChannelMessage({
    channelId: input.channelId,
    body: input.body || (input.files?.length ? "(attachment)" : ""),
    channelSlug: input.channelSlug,
  });

  for (const file of input.files ?? []) {
    await attachFileToMessage({
      messageId: message.id,
      ...file,
      channelSlug: input.channelSlug,
    });
  }

  return message;
}
