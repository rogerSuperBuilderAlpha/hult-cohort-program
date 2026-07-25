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

export type HomeDigest = {
  unreadChannels: {
    id: string;
    name: string;
    unreadCount: number;
  }[];
  recentMentions: {
    id: string;
    entity_ref: string;
    created_at: string;
    is_read: boolean;
    actor_name: string | null;
  }[];
  myTickets: {
    id: string;
    title_snapshot: string;
    status_snapshot: string;
    forth_url: string;
    channel_name: string | null;
    assignee_email_snapshot: string | null;
  }[];
};

export async function getHomeDigest(): Promise<HomeDigest> {
  const { supabase, profile } = await requireUser();

  const { data: memberships } = await supabase
    .from("channel_members")
    .select("channel_id, last_read_at, channels:channel_id ( id, name, is_archived )")
    .eq("user_id", profile.id);

  const unreadChannels: HomeDigest["unreadChannels"] = [];
  for (const row of memberships ?? []) {
    const ch = Array.isArray(row.channels) ? row.channels[0] : row.channels;
    if (!ch || ch.is_archived) continue;
    const since = row.last_read_at || "1970-01-01T00:00:00.000Z";
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("parent_type", "channel")
      .eq("parent_id", row.channel_id)
      .is("deleted_at", null)
      .is("thread_root_id", null)
      .gt("created_at", since)
      .neq("author_id", profile.id);
    if ((count ?? 0) > 0) {
      unreadChannels.push({
        id: ch.id as string,
        name: ch.name as string,
        unreadCount: count ?? 0,
      });
    }
  }
  unreadChannels.sort((a, b) => b.unreadCount - a.unreadCount);

  const { data: mentions } = await supabase
    .from("notifications")
    .select(
      `
      id,
      entity_ref,
      created_at,
      is_read,
      actor:actor_id ( display_name )
    `,
    )
    .eq("user_id", profile.id)
    .eq("type", "mention")
    .order("created_at", { ascending: false })
    .limit(8);

  const recentMentions = (mentions ?? []).map((n) => {
    const actor = Array.isArray(n.actor) ? n.actor[0] : n.actor;
    return {
      id: n.id as string,
      entity_ref: n.entity_ref as string,
      created_at: n.created_at as string,
      is_read: Boolean(n.is_read),
      actor_name: (actor?.display_name as string | null) ?? null,
    };
  });

  const { data: tickets } = await supabase
    .from("ticket_links")
    .select(
      `
      id,
      title_snapshot,
      status_snapshot,
      forth_url,
      assignee_email_snapshot,
      created_by,
      channels:channel_id ( name )
    `,
    )
    .or(
      `assignee_email_snapshot.eq."${profile.email}",created_by.eq.${profile.id}`,
    )
    .order("last_synced_at", { ascending: false })
    .limit(12);

  const myTickets = (tickets ?? []).map((t) => {
    const ch = Array.isArray(t.channels) ? t.channels[0] : t.channels;
    return {
      id: t.id as string,
      title_snapshot: t.title_snapshot as string,
      status_snapshot: t.status_snapshot as string,
      forth_url: t.forth_url as string,
      channel_name: (ch?.name as string | null) ?? null,
      assignee_email_snapshot: (t.assignee_email_snapshot as string | null) ?? null,
    };
  });

  return { unreadChannels, recentMentions, myTickets };
}
