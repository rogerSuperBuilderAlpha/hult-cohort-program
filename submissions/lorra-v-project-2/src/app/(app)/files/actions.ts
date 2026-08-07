"use server";

import { createClient } from "@/lib/supabase/server";

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

export type FileRow = {
  id: string;
  file_url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  message_id: string;
  parent_type: string;
  parent_id: string;
  channel_name: string | null;
  channel_id: string | null;
};

export async function listVisibleAttachments(): Promise<FileRow[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("attachments")
    .select(
      `
      id,
      file_url,
      file_name,
      mime_type,
      size_bytes,
      created_at,
      message_id,
      messages:message_id (
        id,
        parent_type,
        parent_id
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);

  const channelIds = new Set<string>();
  for (const row of data ?? []) {
    const msg = Array.isArray(row.messages) ? row.messages[0] : row.messages;
    if (msg?.parent_type === "channel" && msg.parent_id) {
      channelIds.add(msg.parent_id as string);
    }
  }

  const channelNameById = new Map<string, string>();
  if (channelIds.size) {
    const { data: channels } = await supabase
      .from("channels")
      .select("id, name")
      .in("id", Array.from(channelIds));
    for (const c of channels ?? []) {
      channelNameById.set(c.id as string, c.name as string);
    }
  }

  return (data ?? []).map((row) => {
    const msg = Array.isArray(row.messages) ? row.messages[0] : row.messages;
    const parentType = (msg?.parent_type as string) || "";
    const parentId = (msg?.parent_id as string) || "";
    const channelId = parentType === "channel" ? parentId : null;
    return {
      id: row.id as string,
      file_url: row.file_url as string,
      file_name: row.file_name as string,
      mime_type: row.mime_type as string,
      size_bytes: Number(row.size_bytes ?? 0),
      created_at: row.created_at as string,
      message_id: row.message_id as string,
      parent_type: parentType,
      parent_id: parentId,
      channel_id: channelId,
      channel_name: channelId ? channelNameById.get(channelId) ?? null : null,
    };
  });
}
