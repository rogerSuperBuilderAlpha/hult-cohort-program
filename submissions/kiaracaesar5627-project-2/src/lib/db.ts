import { getSupabaseAdmin } from "./supabase";
import type {
  Channel,
  ChannelKind,
  Conversation,
  Message,
  Notification,
  User,
  UserPublic,
  UserRole,
} from "./types";

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function db() {
  return getSupabaseAdmin();
}

const HISTORY_DAYS = 30;

export function historyCutoffIso() {
  return new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export function dmKeyFor(userA: string, userB: string) {
  return [userA, userB].sort().join(":");
}

export function slugifyChannel(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "channel";
}

// Users
export async function findUserById(id: string): Promise<User | null> {
  const { data, error } = await db().from("comms_users").select("*").eq("id", id).maybeSingle();
  throwIfError(error);
  return data as User | null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await db()
    .from("comms_users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  throwIfError(error);
  return data as User | null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await db()
    .from("comms_users")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  throwIfError(error);
  return data as User | null;
}

export async function findUserByEmailOrUsername(email: string, username: string) {
  return (await findUserByEmail(email)) ?? (await findUserByUsername(username));
}

export async function createUser(input: {
  name: string;
  email: string;
  username: string;
  password_hash: string;
  role?: UserRole;
}): Promise<User> {
  const { data, error } = await db()
    .from("comms_users")
    .insert({
      name: input.name,
      email: input.email.toLowerCase(),
      username: input.username,
      password_hash: input.password_hash,
      role: input.role ?? "MEMBER",
    })
    .select("*")
    .single();
  throwIfError(error);
  return data as User;
}

export async function listUsersPublic(): Promise<UserPublic[]> {
  const { data, error } = await db()
    .from("comms_users")
    .select("id,email,username,name,role")
    .order("username", { ascending: true });
  throwIfError(error);
  return (data ?? []) as UserPublic[];
}

// Channels
export async function listChannels(opts?: { includeArchived?: boolean }): Promise<Channel[]> {
  let query = db().from("comms_channels").select("*").order("name", { ascending: true });
  if (!opts?.includeArchived) query = query.eq("archived", false);
  const { data, error } = await query;
  throwIfError(error);
  return (data ?? []) as Channel[];
}

export async function getChannelById(id: string): Promise<Channel | null> {
  const { data, error } = await db().from("comms_channels").select("*").eq("id", id).maybeSingle();
  throwIfError(error);
  return data as Channel | null;
}

export async function getChannelBySlug(slug: string): Promise<Channel | null> {
  const { data, error } = await db()
    .from("comms_channels")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  throwIfError(error);
  return data as Channel | null;
}

export async function createChannel(input: {
  name: string;
  slug: string;
  description?: string;
  kind?: ChannelKind;
  created_by_id: string;
}): Promise<Channel> {
  const { data, error } = await db()
    .from("comms_channels")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description ?? "",
      kind: input.kind ?? "public",
      created_by_id: input.created_by_id,
    })
    .select("*")
    .single();
  throwIfError(error);
  return data as Channel;
}

export async function updateChannel(
  id: string,
  input: Partial<Pick<Channel, "name" | "slug" | "description" | "archived">>,
): Promise<Channel> {
  const { data, error } = await db()
    .from("comms_channels")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  throwIfError(error);
  return data as Channel;
}

// Conversations / DMs
export async function getOrCreateDm(userA: string, userB: string): Promise<Conversation> {
  if (userA === userB) throw new Error("INVALID_DM");
  const key = dmKeyFor(userA, userB);
  const existing = await db()
    .from("comms_conversations")
    .select("*")
    .eq("dm_key", key)
    .maybeSingle();
  throwIfError(existing.error);
  if (existing.data) return existing.data as Conversation;

  const { data: conversation, error } = await db()
    .from("comms_conversations")
    .insert({ kind: "dm", dm_key: key })
    .select("*")
    .single();
  throwIfError(error);
  const { error: membersError } = await db().from("comms_conversation_members").insert([
    { conversation_id: conversation.id, user_id: userA },
    { conversation_id: conversation.id, user_id: userB },
  ]);
  throwIfError(membersError);
  return conversation as Conversation;
}

export async function listDmConversations(userId: string) {
  const { data: memberships, error } = await db()
    .from("comms_conversation_members")
    .select("conversation_id")
    .eq("user_id", userId);
  throwIfError(error);
  const ids = (memberships ?? []).map((row) => row.conversation_id as string);
  if (ids.length === 0) return [] as Array<{
    conversation: Conversation;
    peer: UserPublic;
  }>;

  const { data: conversations, error: convError } = await db()
    .from("comms_conversations")
    .select("*")
    .in("id", ids)
    .order("created_at", { ascending: false });
  throwIfError(convError);

  const results: Array<{ conversation: Conversation; peer: UserPublic }> = [];
  for (const conversation of (conversations ?? []) as Conversation[]) {
    const { data: members, error: memError } = await db()
      .from("comms_conversation_members")
      .select("user_id, user:comms_users!user_id(id,email,username,name,role)")
      .eq("conversation_id", conversation.id);
    throwIfError(memError);
    type Row = { user_id: string; user: UserPublic };
    const peer = ((members ?? []) as unknown as Row[]).find((m) => m.user_id !== userId)?.user;
    if (peer) results.push({ conversation, peer });
  }
  return results;
}

export async function getConversationForUser(conversationId: string, userId: string) {
  const { data: membership, error } = await db()
    .from("comms_conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  throwIfError(error);
  if (!membership) return null;
  const { data, error: convError } = await db()
    .from("comms_conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();
  throwIfError(convError);
  return data as Conversation | null;
}

// Messages
export async function listChannelMessages(
  channelId: string,
  opts?: { since?: string; limit?: number },
): Promise<Message[]> {
  let query = db()
    .from("comms_messages")
    .select("*, author:comms_users!author_id(id,email,username,name,role)")
    .eq("channel_id", channelId)
    .gte("created_at", historyCutoffIso())
    .order("created_at", { ascending: true })
    .limit(opts?.limit ?? 200);
  if (opts?.since) query = query.gt("created_at", opts.since);
  const { data, error } = await query;
  throwIfError(error);
  return (data ?? []) as unknown as Message[];
}

export async function listConversationMessages(
  conversationId: string,
  opts?: { since?: string; limit?: number },
): Promise<Message[]> {
  let query = db()
    .from("comms_messages")
    .select("*, author:comms_users!author_id(id,email,username,name,role)")
    .eq("conversation_id", conversationId)
    .gte("created_at", historyCutoffIso())
    .order("created_at", { ascending: true })
    .limit(opts?.limit ?? 200);
  if (opts?.since) query = query.gt("created_at", opts.since);
  const { data, error } = await query;
  throwIfError(error);
  return (data ?? []) as unknown as Message[];
}

export async function createMessage(input: {
  channel_id?: string | null;
  conversation_id?: string | null;
  author_id: string;
  body: string;
}): Promise<Message> {
  const { data, error } = await db()
    .from("comms_messages")
    .insert({
      channel_id: input.channel_id ?? null,
      conversation_id: input.conversation_id ?? null,
      author_id: input.author_id,
      body: input.body,
    })
    .select("*, author:comms_users!author_id(id,email,username,name,role)")
    .single();
  throwIfError(error);
  return data as unknown as Message;
}

export async function searchMessages(queryText: string, limit = 40): Promise<Message[]> {
  const q = queryText.trim();
  if (!q) return [];
  const { data, error } = await db()
    .from("comms_messages")
    .select("*, author:comms_users!author_id(id,email,username,name,role)")
    .gte("created_at", historyCutoffIso())
    .ilike("body", `%${q}%`)
    .order("created_at", { ascending: false })
    .limit(limit);
  throwIfError(error);
  return (data ?? []) as unknown as Message[];
}

// Notifications
export async function createNotification(input: {
  user_id: string;
  body: string;
  link?: string;
}): Promise<void> {
  const { error } = await db()
    .from("comms_notifications")
    .insert({ link: "", ...input });
  throwIfError(error);
}

export async function listNotifications(userId: string, limit = 30): Promise<Notification[]> {
  const { data, error } = await db()
    .from("comms_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  throwIfError(error);
  return (data ?? []) as Notification[];
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const { count, error } = await db()
    .from("comms_notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  throwIfError(error);
  return count ?? 0;
}

export async function markNotificationsRead(userId: string): Promise<void> {
  const { error } = await db()
    .from("comms_notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  throwIfError(error);
}
