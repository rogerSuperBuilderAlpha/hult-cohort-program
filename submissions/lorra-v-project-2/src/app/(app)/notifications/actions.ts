"use server";

import { createClient } from "@/lib/supabase/server";
import type { NotificationLevel } from "@/lib/types";
import type { AppNotification } from "@/lib/notifications";

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

export async function listNotifications(limit = 40): Promise<AppNotification[]> {
  const { supabase, profile } = await requireUser();
  const { data, error } = await supabase
    .from("notifications")
    .select(
      `
      id,
      user_id,
      type,
      actor_id,
      entity_ref,
      is_read,
      created_at,
      actor:actor_id ( id, display_name, avatar_url )
    `,
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const actor = Array.isArray(row.actor) ? row.actor[0] ?? null : row.actor;
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      type: row.type as string,
      actor_id: (row.actor_id as string | null) ?? null,
      entity_ref: row.entity_ref as string,
      is_read: Boolean(row.is_read),
      created_at: row.created_at as string,
      actor: actor
        ? {
            id: actor.id as string,
            display_name: actor.display_name as string,
            avatar_url: (actor.avatar_url as string | null) ?? null,
          }
        : null,
    };
  });
}

export async function countUnreadNotifications(): Promise<number> {
  const { supabase, profile } = await requireUser();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("is_read", false);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function markNotificationRead(id: string) {
  const { supabase, profile } = await requireUser();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", profile.id);
  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead() {
  const { supabase, profile } = await requireUser();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", profile.id)
    .eq("is_read", false);
  if (error) throw new Error(error.message);
}

export async function getMyChannelNotificationLevel(
  channelId: string,
): Promise<NotificationLevel> {
  const { supabase, profile } = await requireUser();
  const { data, error } = await supabase
    .from("channel_members")
    .select("notification_level")
    .eq("channel_id", channelId)
    .eq("user_id", profile.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.notification_level as NotificationLevel) || "all";
}

export async function setChannelNotificationLevel(input: {
  channelId: string;
  level: NotificationLevel;
}) {
  const { supabase, profile } = await requireUser();
  const { error } = await supabase
    .from("channel_members")
    .update({ notification_level: input.level })
    .eq("channel_id", input.channelId)
    .eq("user_id", profile.id);
  if (error) throw new Error(error.message);
}
