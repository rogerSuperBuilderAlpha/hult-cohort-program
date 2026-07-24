"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

export type ConversationSummary = {
  id: string;
  type: "dm" | "group_dm";
  name: string | null;
  created_at: string;
  title: string;
  member_ids: string[];
  members: { id: string; display_name: string; avatar_url: string | null }[];
  last_read_at: string | null;
};

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

function conversationTitle(
  type: "dm" | "group_dm",
  name: string | null,
  members: { id: string; display_name: string }[],
  selfId: string,
) {
  if (name?.trim()) return name.trim();
  const others = members
    .filter((m) => m.id !== selfId)
    .map((m) => m.display_name)
    .filter(Boolean);
  if (others.length === 0) return type === "dm" ? "Direct message" : "Group DM";
  return others.join(", ");
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const { supabase, profile } = await requireUser();

  const { data: memberships, error } = await supabase
    .from("conversation_members")
    .select("conversation_id, last_read_at")
    .eq("user_id", profile.id);
  if (error) throw new Error(error.message);
  if (!memberships?.length) return [];

  const ids = memberships.map((m) => m.conversation_id);
  const lastReadById = new Map(
    memberships.map((m) => [m.conversation_id, m.last_read_at as string | null]),
  );

  const { data: conversations, error: cErr } = await supabase
    .from("conversations")
    .select("id, type, name, created_at")
    .in("id", ids)
    .order("created_at", { ascending: false });
  if (cErr) throw new Error(cErr.message);

  const { data: allMembers, error: mErr } = await supabase
    .from("conversation_members")
    .select(
      `
      conversation_id,
      user_id,
      profiles:user_id ( id, display_name, avatar_url )
    `,
    )
    .in("conversation_id", ids);
  if (mErr) throw new Error(mErr.message);

  const membersByConvo = new Map<
    string,
    { id: string; display_name: string; avatar_url: string | null }[]
  >();
  for (const row of allMembers ?? []) {
    const profileRow = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    if (!profileRow) continue;
    const list = membersByConvo.get(row.conversation_id) ?? [];
    list.push({
      id: profileRow.id,
      display_name: profileRow.display_name,
      avatar_url: profileRow.avatar_url,
    });
    membersByConvo.set(row.conversation_id, list);
  }

  return (conversations ?? []).map((c) => {
    const members = membersByConvo.get(c.id) ?? [];
    return {
      id: c.id,
      type: c.type as "dm" | "group_dm",
      name: c.name,
      created_at: c.created_at,
      title: conversationTitle(c.type as "dm" | "group_dm", c.name, members, profile.id),
      member_ids: members.map((m) => m.id),
      members,
      last_read_at: lastReadById.get(c.id) ?? null,
    };
  });
}

export async function getConversation(conversationId: string) {
  const list = await listConversations();
  return list.find((c) => c.id === conversationId) ?? null;
}

export async function listActiveProfiles() {
  const { supabase, profile } = await requireUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, email, avatar_url, role")
    .eq("status", "active")
    .neq("id", profile.id)
    .order("display_name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listConversationMembers(conversationId: string) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("conversation_members")
    .select(
      `
      conversation_id,
      user_id,
      last_read_at,
      profiles:user_id ( id, display_name, avatar_url, email, role )
    `,
    )
    .eq("conversation_id", conversationId);
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const profiles = Array.isArray(row.profiles) ? row.profiles[0] ?? null : row.profiles;
    return {
      conversation_id: row.conversation_id as string,
      user_id: row.user_id as string,
      last_read_at: (row.last_read_at as string | null) ?? null,
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

/**
 * Start or reopen a DM / group DM.
 * - 1 other user → dm (reuse existing 1:1 if present)
 * - 2–9 other users → group_dm
 */
export async function startConversation(input: {
  memberIds: string[];
  name?: string;
}): Promise<{ id: string }> {
  const { supabase, profile } = await requireUser();
  const uniqueOthers = Array.from(
    new Set(input.memberIds.filter((id) => id && id !== profile.id)),
  );

  if (uniqueOthers.length < 1) throw new Error("Pick at least one person");
  if (uniqueOthers.length > 9) throw new Error("Group DMs support up to 9 other people");

  const type = uniqueOthers.length === 1 ? "dm" : "group_dm";

  if (type === "dm") {
    const existing = await listConversations();
    const match = existing.find(
      (c) =>
        c.type === "dm" &&
        c.member_ids.length === 2 &&
        c.member_ids.includes(uniqueOthers[0]),
    );
    if (match) {
      revalidatePath("/messages");
      return { id: match.id };
    }
  }

  // Service role: insert+select on conversations needs membership for SELECT RLS,
  // so we create the conversation and memberships atomically as admin.
  const admin = createServiceClient();
  const { data: conversation, error } = await admin
    .from("conversations")
    .insert({
      type,
      name: input.name?.trim() || null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const memberRows = [profile.id, ...uniqueOthers].map((user_id) => ({
    conversation_id: conversation.id,
    user_id,
  }));
  const { error: memErr } = await admin.from("conversation_members").insert(memberRows);
  if (memErr) throw new Error(memErr.message);

  revalidatePath("/messages");
  revalidatePath("/");
  return { id: conversation.id };
}

export async function markConversationRead(conversationId: string) {
  const { supabase, profile } = await requireUser();
  const { error } = await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", profile.id);
  if (error) throw new Error(error.message);
  revalidatePath(`/messages/${conversationId}`);
}
