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

export type TaskLink = {
  id: string;
  forth_ticket_id: string;
  forth_url: string;
  title_snapshot: string;
  status_snapshot: string;
  assignee_email_snapshot: string | null;
  last_synced_at: string;
  channel_id: string;
  channel_name: string | null;
};

export async function listVisibleTicketLinks(): Promise<TaskLink[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("ticket_links")
    .select(
      `
      id,
      forth_ticket_id,
      forth_url,
      title_snapshot,
      status_snapshot,
      assignee_email_snapshot,
      last_synced_at,
      channel_id,
      channels:channel_id ( name )
    `,
    )
    .order("last_synced_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const ch = Array.isArray(row.channels) ? row.channels[0] : row.channels;
    return {
      id: row.id as string,
      forth_ticket_id: row.forth_ticket_id as string,
      forth_url: row.forth_url as string,
      title_snapshot: row.title_snapshot as string,
      status_snapshot: row.status_snapshot as string,
      assignee_email_snapshot: (row.assignee_email_snapshot as string | null) ?? null,
      last_synced_at: row.last_synced_at as string,
      channel_id: row.channel_id as string,
      channel_name: (ch?.name as string | null) ?? null,
    };
  });
}
