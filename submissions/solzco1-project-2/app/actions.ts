"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseAdminEmails, resolveRoleForEmail } from "@/lib/admin";
import { findMentionHandles } from "@/lib/forth-links";
import { createClient } from "@/lib/supabase/server";

export async function signUp(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim() || email;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  if (data.user) {
    const role = resolveRoleForEmail(email, parseAdminEmails(process.env.ADMIN_EMAILS));
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email,
      display_name: displayName,
      role,
    });
  }

  redirect("/channels/general");
}

export async function signIn(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  const role = resolveRoleForEmail(email, parseAdminEmails(process.env.ADMIN_EMAILS));
  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    await supabase.from("profiles").upsert({
      id: userData.user.id,
      email,
      display_name: userData.user.email?.split("@")[0] ?? "Member",
      role,
    });
  }

  redirect("/channels/general");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  return { supabase, user: data.user };
}

export async function sendMessage(input: {
  channelId: string;
  body: string;
  parentId?: string | null;
}) {
  const body = input.body.trim();
  if (!body) return { error: "Message cannot be empty" };

  const { supabase, user } = await requireUser();

  const { data: channel } = await supabase
    .from("channels")
    .select("id, slug, is_dm")
    .eq("id", input.channelId)
    .single();

  if (!channel) return { error: "Channel not found" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (channel.slug === "announcements" && profile?.role !== "admin") {
    return { error: "Only admins can post in Announcements" };
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      channel_id: input.channelId,
      user_id: user.id,
      body,
      parent_id: input.parentId ?? null,
      is_system: false,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const handles = findMentionHandles(body);
  if (handles.length) {
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("id, email, display_name");

    const mentioned =
      allProfiles?.filter((p) => {
        const local = p.email.split("@")[0]?.toLowerCase();
        const name = p.display_name.toLowerCase();
        return handles.some((h) => h === local || h === name);
      }) ?? [];

    const rows =
      mentioned
        ?.filter((p) => p.id !== user.id)
        .map((p) => ({
          user_id: p.id,
          type: "mention" as const,
          message_id: message.id,
          channel_id: input.channelId,
        })) ?? [];

    if (rows.length) {
      await supabase.from("notifications").insert(rows);
    }
  }

  if (channel.is_dm) {
    const { data: members } = await supabase
      .from("channel_members")
      .select("user_id")
      .eq("channel_id", input.channelId);

    const dmRows =
      members
        ?.filter((m) => m.user_id !== user.id)
        .map((m) => ({
          user_id: m.user_id,
          type: "dm" as const,
          message_id: message.id,
          channel_id: input.channelId,
        })) ?? [];

    if (dmRows.length) {
      await supabase.from("notifications").insert(dmRows);
    }
  }

  revalidatePath(`/channels/${channel.slug ?? input.channelId}`);
  revalidatePath(`/dm/${input.channelId}`);
  return { ok: true };
}

export async function createChannel(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name required" };

  const { supabase, user } = await requireUser();
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { data, error } = await supabase
    .from("channels")
    .insert({
      name: trimmed,
      slug: slug || null,
      is_dm: false,
      created_by: user.id,
    })
    .select("slug")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/");
  redirect(`/channels/${data.slug}`);
}

export async function renameChannel(channelId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name required" };

  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("channels")
    .update({ name: trimmed })
    .eq("id", channelId);

  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true };
}

export async function archiveChannel(channelId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("channels")
    .update({ archived: true })
    .eq("id", channelId);

  if (error) return { error: error.message };
  revalidatePath("/");
  redirect("/channels/general");
}

export async function startDmFromForm(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  await startDm(userId);
}

export async function startDm(otherUserId: string) {
  const { supabase, user } = await requireUser();
  if (otherUserId === user.id) return { error: "Cannot DM yourself" };

  const { data: myDms } = await supabase
    .from("channel_members")
    .select("channel_id, channels!inner(is_dm)")
    .eq("user_id", user.id);

  for (const row of myDms ?? []) {
    const ch = row.channels as unknown as { is_dm: boolean };
    if (!ch?.is_dm) continue;
    const { data: members } = await supabase
      .from("channel_members")
      .select("user_id")
      .eq("channel_id", row.channel_id);
    const ids = (members ?? []).map((m) => m.user_id).sort();
    if (ids.length === 2 && ids.includes(otherUserId)) {
      redirect(`/dm/${row.channel_id}`);
    }
  }

  const { data: other } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", otherUserId)
    .single();

  const { data: channel, error: chErr } = await supabase
    .from("channels")
    .insert({
      name: `DM: ${other?.display_name ?? "Member"}`,
      slug: null,
      is_dm: true,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (chErr || !channel) return { error: chErr?.message ?? "Failed to create DM" };

  await supabase.from("channel_members").insert([
    { channel_id: channel.id, user_id: user.id },
    { channel_id: channel.id, user_id: otherUserId },
  ]);

  redirect(`/dm/${channel.id}`);
}

export async function searchMessages(query: string) {
  const q = query.trim();
  if (!q) return { results: [] };

  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, body, created_at, channel_id, channels(name, slug, is_dm)",
    )
    .ilike("body", `%${q}%`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return { error: error.message, results: [] };
  return { results: data ?? [] };
}

export async function markNotificationRead(notificationId: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);
  revalidatePath("/");
  return { ok: true };
}

export async function markAllNotificationsRead() {
  const { supabase, user } = await requireUser();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
  revalidatePath("/");
  return { ok: true };
}
