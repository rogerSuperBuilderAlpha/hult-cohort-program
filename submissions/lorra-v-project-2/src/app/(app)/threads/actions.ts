"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { extractMentionIds } from "@/lib/format";
import type { Message } from "@/lib/types";
import type { MessageParentType } from "@/app/(app)/messaging/actions";
import { createNotifications } from "@/lib/notify-server";
import { getTicketLinksForMessageIds } from "@/app/(app)/forth/actions";

export type ThreadParticipant = {
  id: string;
  display_name: string;
  avatar_url: string | null;
};

export type ThreadSummary = {
  root_id: string;
  root: Message;
  parent_type: MessageParentType;
  parent_id: string;
  parent_label: string;
  href: string;
  reply_count: number;
  last_activity_at: string;
  last_reply_at: string | null;
  participants: ThreadParticipant[];
  unread: boolean;
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

function normalizeMessage(m: Message): Message {
  return {
    ...m,
    profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
  };
}

async function resolveParentLabel(
  supabase: Awaited<ReturnType<typeof createClient>>,
  parentType: MessageParentType,
  parentId: string,
  selfId: string,
): Promise<{ label: string; href: string; pathKey: string }> {
  if (parentType === "channel") {
    const { data } = await supabase
      .from("channels")
      .select("name")
      .eq("id", parentId)
      .maybeSingle();
    const name = data?.name ?? "channel";
    return { label: `#${name}`, href: `/channels/${name}`, pathKey: name };
  }

  const { data: members } = await supabase
    .from("conversation_members")
    .select("user_id, profiles:user_id ( display_name )")
    .eq("conversation_id", parentId);

  const names = (members ?? [])
    .filter((m) => m.user_id !== selfId)
    .map((m) => {
      const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      return (p as { display_name?: string } | null)?.display_name;
    })
    .filter(Boolean) as string[];

  const label = names.length ? names.join(", ") : "Direct message";
  return {
    label,
    href: `/messages/${parentId}`,
    pathKey: parentId,
  };
}

function isMissingSubscriptionsTable(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const msg = (error.message || "").toLowerCase();
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    msg.includes("thread_subscriptions") ||
    msg.includes("schema cache")
  );
}

/** Upsert self subscription; also ensure root author + mentioned via service role. */
async function ensureSubscriptions(
  threadRootId: string,
  selfId: string,
  extraUserIds: string[],
  markRead: boolean,
) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase.from("thread_subscriptions").upsert(
    {
      thread_root_id: threadRootId,
      user_id: selfId,
      ...(markRead ? { last_read_at: now } : {}),
    },
    { onConflict: "thread_root_id,user_id" },
  );
  if (error) {
    if (isMissingSubscriptionsTable(error)) return;
    throw new Error(error.message);
  }

  const others = Array.from(new Set(extraUserIds.filter((id) => id && id !== selfId)));
  if (others.length === 0) return;

  const admin = createServiceClient();
  for (const userId of others) {
    const { error: adminErr } = await admin.from("thread_subscriptions").upsert(
      {
        thread_root_id: threadRootId,
        user_id: userId,
      },
      { onConflict: "thread_root_id,user_id", ignoreDuplicates: true },
    );
    if (adminErr && !isMissingSubscriptionsTable(adminErr)) {
      // Non-fatal: list view still derives subscribers from participation.
      console.warn("thread subscription ensure failed", adminErr.message);
    }
  }
}

export async function getMessageById(messageId: string): Promise<Message | null> {
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
    .eq("id", messageId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return normalizeMessage(data as Message);
}

export async function listThreadReplies(threadRootId: string): Promise<Message[]> {
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
    .eq("thread_root_id", threadRootId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  const messages = (data ?? []).map((m) => normalizeMessage(m as Message));
  const ticketLinks = await getTicketLinksForMessageIds(messages.map((m) => m.id));
  return messages.map((m) => {
    const link = ticketLinks[m.id];
    return {
      ...m,
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

export async function openThread(threadRootId: string) {
  const { profile } = await requireUser();
  const root = await getMessageById(threadRootId);
  if (!root || root.thread_root_id) throw new Error("Thread root not found");

  const replies = await listThreadReplies(threadRootId);
  const mentioned = [
    ...(root.mentions ?? []).map((m) => m.mentioned_user_id),
    ...replies.flatMap((r) => (r.mentions ?? []).map((m) => m.mentioned_user_id)),
  ];

  await ensureSubscriptions(
    threadRootId,
    profile.id,
    [root.author_id, ...mentioned],
    true,
  );

  const parent = await resolveParentLabel(
    await createClient(),
    root.parent_type,
    root.parent_id,
    profile.id,
  );

  return { root, replies, parent };
}

export async function markThreadRead(threadRootId: string) {
  const { supabase, profile } = await requireUser();
  const now = new Date().toISOString();
  const { error } = await supabase.from("thread_subscriptions").upsert(
    {
      thread_root_id: threadRootId,
      user_id: profile.id,
      last_read_at: now,
    },
    { onConflict: "thread_root_id,user_id" },
  );
  if (error && !isMissingSubscriptionsTable(error)) {
    throw new Error(error.message);
  }
  revalidatePath("/threads");
}

export async function sendThreadReply(input: {
  threadRootId: string;
  body: string;
  pathKey: string;
  memberProfiles: { id: string; display_name: string }[];
  alsoSendToParent?: boolean;
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
  if (!body) throw new Error("Reply cannot be empty");

  const root = await getMessageById(input.threadRootId);
  if (!root || root.thread_root_id) throw new Error("Thread root not found");

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      parent_type: root.parent_type,
      parent_id: root.parent_id,
      thread_root_id: input.threadRootId,
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

  if (input.alsoSendToParent) {
    const mirrorBody =
      root.parent_type === "channel"
        ? `↳ ${body}`
        : `↳ ${body}`;
    const { error: mirrorErr } = await supabase.from("messages").insert({
      parent_type: root.parent_type,
      parent_id: root.parent_id,
      author_id: profile.id,
      body_richtext: mirrorBody,
    });
    if (mirrorErr) throw new Error(mirrorErr.message);
  }

  await ensureSubscriptions(
    input.threadRootId,
    profile.id,
    [root.author_id, ...mentionIds],
    true,
  );

  const threadEntity =
    root.parent_type === "channel"
      ? `thread:${input.threadRootId}:channel:${input.pathKey}`
      : `thread:${input.threadRootId}:conversation:${root.parent_id}`;

  const subscriberIds = new Set<string>();
  subscriberIds.add(root.author_id);
  const { data: subs } = await supabase
    .from("thread_subscriptions")
    .select("user_id")
    .eq("thread_root_id", input.threadRootId);
  for (const s of subs ?? []) subscriberIds.add(s.user_id as string);
  const { data: priorReplies } = await supabase
    .from("messages")
    .select("author_id")
    .eq("thread_root_id", input.threadRootId)
    .is("deleted_at", null);
  for (const r of priorReplies ?? []) subscriberIds.add(r.author_id as string);

  subscriberIds.delete(profile.id);
  for (const id of mentionIds) subscriberIds.delete(id);

  await createNotifications(
    Array.from(subscriberIds).map((userId) => ({
      userId,
      type: "thread_reply" as const,
      actorId: profile.id,
      entityRef: threadEntity,
    })),
  );
  if (mentionIds.length) {
    await createNotifications(
      mentionIds.map((userId) => ({
        userId,
        type: "mention" as const,
        actorId: profile.id,
        entityRef: threadEntity,
      })),
    );
  }

  revalidatePath("/threads");

  return normalizeMessage(message as Message);
}

async function collectSubscribedRootIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string[]> {
  const ids = new Set<string>();

  const { data: subs, error: subsErr } = await supabase
    .from("thread_subscriptions")
    .select("thread_root_id")
    .eq("user_id", userId);
  if (!subsErr) {
    for (const s of subs ?? []) ids.add(s.thread_root_id);
  }

  const { data: rootsAuthored } = await supabase
    .from("messages")
    .select("id")
    .eq("author_id", userId)
    .is("thread_root_id", null)
    .is("deleted_at", null);
  for (const r of rootsAuthored ?? []) ids.add(r.id);

  const { data: myReplies } = await supabase
    .from("messages")
    .select("thread_root_id")
    .eq("author_id", userId)
    .not("thread_root_id", "is", null)
    .is("deleted_at", null);
  for (const r of myReplies ?? []) {
    if (r.thread_root_id) ids.add(r.thread_root_id);
  }

  const { data: myMentions } = await supabase
    .from("mentions")
    .select("message_id")
    .eq("mentioned_user_id", userId);
  const mentionMessageIds = (myMentions ?? []).map((m) => m.message_id);
  if (mentionMessageIds.length) {
    const { data: mentionedMsgs } = await supabase
      .from("messages")
      .select("id, thread_root_id")
      .in("id", mentionMessageIds)
      .is("deleted_at", null);
    for (const m of mentionedMsgs ?? []) {
      ids.add(m.thread_root_id ?? m.id);
    }
  }

  return Array.from(ids);
}

export async function listSubscribedThreads(): Promise<ThreadSummary[]> {
  const { supabase, profile } = await requireUser();
  const rootIds = await collectSubscribedRootIds(supabase, profile.id);
  if (rootIds.length === 0) return [];

  const { data: roots, error } = await supabase
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
    .in("id", rootIds)
    .is("thread_root_id", null)
    .is("deleted_at", null);
  if (error) throw new Error(error.message);

  const { data: replies } = await supabase
    .from("messages")
    .select(
      `
      id,
      thread_root_id,
      author_id,
      created_at,
      profiles:author_id ( id, display_name, avatar_url )
    `,
    )
    .in("thread_root_id", rootIds)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const { data: subs, error: subsErr } = await supabase
    .from("thread_subscriptions")
    .select("thread_root_id, last_read_at")
    .eq("user_id", profile.id)
    .in("thread_root_id", rootIds);

  const lastRead = new Map(
    !subsErr
      ? (subs ?? []).map((s) => [s.thread_root_id, s.last_read_at as string | null])
      : [],
  );

  const repliesByRoot = new Map<string, typeof replies>();
  for (const r of replies ?? []) {
    if (!r.thread_root_id) continue;
    const list = repliesByRoot.get(r.thread_root_id) ?? [];
    list.push(r);
    repliesByRoot.set(r.thread_root_id, list);
  }

  const summaries: ThreadSummary[] = [];
  for (const raw of roots ?? []) {
    const root = normalizeMessage(raw as Message);
    const threadReplies = repliesByRoot.get(root.id) ?? [];
    if (threadReplies.length === 0) continue;

    const participantsMap = new Map<string, ThreadParticipant>();
    const rootAuthor = root.profiles;
    if (rootAuthor) {
      participantsMap.set(rootAuthor.id, {
        id: rootAuthor.id,
        display_name: rootAuthor.display_name,
        avatar_url: rootAuthor.avatar_url,
      });
    }
    for (const r of threadReplies) {
      const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      if (p) {
        participantsMap.set(p.id, {
          id: p.id,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
        });
      }
    }

    const lastReply = threadReplies[threadReplies.length - 1]!;
    const lastActivity = lastReply.created_at;
    const readAt = lastRead.get(root.id);
    const unread =
      !readAt ||
      new Date(lastReply.created_at).getTime() > new Date(readAt).getTime();

    const parent = await resolveParentLabel(
      supabase,
      root.parent_type,
      root.parent_id,
      profile.id,
    );

    const participants = Array.from(participantsMap.values());
    summaries.push({
      root_id: root.id,
      root: {
        ...root,
        reply_count: threadReplies.length,
        last_reply_at: lastReply.created_at,
        participants,
      },
      parent_type: root.parent_type,
      parent_id: root.parent_id,
      parent_label: parent.label,
      href: `${parent.href}?thread=${root.id}`,
      reply_count: threadReplies.length,
      last_activity_at: lastActivity,
      last_reply_at: lastReply.created_at,
      participants,
      unread,
    });
  }

  summaries.sort(
    (a, b) =>
      new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime(),
  );

  return summaries;
}
