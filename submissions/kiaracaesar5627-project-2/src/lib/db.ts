import { ensureSchema, getStore, newId, nowIso } from "./client";
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

async function ready() {
  await ensureSchema();
  return getStore();
}

function toPublic(user: User): UserPublic {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
  };
}

function withAuthor(message: Message, users: Map<string, User>): Message {
  const author = users.get(message.author_id);
  if (!author) return message;
  return { ...message, author: toPublic(author) };
}

// Users
export async function findUserById(id: string): Promise<User | null> {
  const store = await ready();
  return store.users.get(id) ?? null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const store = await ready();
  const needle = email.toLowerCase();
  for (const user of store.users.values()) {
    if (user.email.toLowerCase() === needle) return user;
  }
  return null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const store = await ready();
  for (const user of store.users.values()) {
    if (user.username === username) return user;
  }
  return null;
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
  const store = await ready();
  const user: User = {
    id: newId(),
    email: input.email.toLowerCase(),
    username: input.username,
    name: input.name,
    password_hash: input.password_hash,
    role: input.role ?? "MEMBER",
    created_at: nowIso(),
  };
  store.users.set(user.id, user);
  return user;
}

export async function listUsersPublic(): Promise<UserPublic[]> {
  const store = await ready();
  return [...store.users.values()]
    .sort((a, b) => a.username.localeCompare(b.username))
    .map(toPublic);
}

// Channels
export async function listChannels(opts?: { includeArchived?: boolean }): Promise<Channel[]> {
  const store = await ready();
  return [...store.channels.values()]
    .filter((channel) => (opts?.includeArchived ? true : !channel.archived))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getChannelById(id: string): Promise<Channel | null> {
  const store = await ready();
  return store.channels.get(id) ?? null;
}

export async function getChannelBySlug(slug: string): Promise<Channel | null> {
  const store = await ready();
  for (const channel of store.channels.values()) {
    if (channel.slug === slug) return channel;
  }
  return null;
}

export async function createChannel(input: {
  name: string;
  slug: string;
  description?: string;
  kind?: ChannelKind;
  created_by_id: string;
}): Promise<Channel> {
  const store = await ready();
  const created_at = nowIso();
  const channel: Channel = {
    id: newId(),
    name: input.name,
    slug: input.slug,
    description: input.description ?? "",
    kind: input.kind ?? "public",
    archived: false,
    created_by_id: input.created_by_id,
    created_at,
    updated_at: created_at,
  };
  store.channels.set(channel.id, channel);
  return channel;
}

export async function updateChannel(
  id: string,
  input: Partial<Pick<Channel, "name" | "slug" | "description" | "archived">>,
): Promise<Channel> {
  const existing = await getChannelById(id);
  if (!existing) throw new Error("Channel not found");
  const store = await ready();
  const next: Channel = {
    ...existing,
    name: input.name ?? existing.name,
    slug: input.slug ?? existing.slug,
    description: input.description ?? existing.description,
    archived: input.archived ?? existing.archived,
    updated_at: nowIso(),
  };
  store.channels.set(id, next);
  return next;
}

// Conversations / DMs
export async function getOrCreateDm(userA: string, userB: string): Promise<Conversation> {
  if (userA === userB) throw new Error("INVALID_DM");
  const store = await ready();
  const key = dmKeyFor(userA, userB);
  for (const conversation of store.conversations.values()) {
    if (conversation.dm_key === key) return conversation;
  }

  const conversation: Conversation = {
    id: newId(),
    kind: "dm",
    dm_key: key,
    created_at: nowIso(),
  };
  store.conversations.set(conversation.id, conversation);
  store.conversationMembers.set(conversation.id, new Set([userA, userB]));
  return conversation;
}

export async function listDmConversations(userId: string) {
  const store = await ready();
  const results: Array<{ conversation: Conversation; peer: UserPublic }> = [];
  for (const [conversationId, members] of store.conversationMembers.entries()) {
    if (!members.has(userId)) continue;
    const conversation = store.conversations.get(conversationId);
    if (!conversation) continue;
    const peerId = [...members].find((id) => id !== userId);
    if (!peerId) continue;
    const peer = store.users.get(peerId);
    if (!peer) continue;
    results.push({ conversation, peer: toPublic(peer) });
  }
  return results;
}

export async function getConversationForUser(conversationId: string, userId: string) {
  const store = await ready();
  const members = store.conversationMembers.get(conversationId);
  if (!members?.has(userId)) return null;
  return store.conversations.get(conversationId) ?? null;
}

export async function listChannelMessages(
  channelId: string,
  opts?: { since?: string; limit?: number },
): Promise<Message[]> {
  const store = await ready();
  const limit = opts?.limit ?? 200;
  const cutoff = historyCutoffIso();
  return [...store.messages.values()]
    .filter((message) => {
      if (message.channel_id !== channelId) return false;
      if (message.created_at < cutoff) return false;
      if (opts?.since && message.created_at <= opts.since) return false;
      return true;
    })
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, limit)
    .map((message) => withAuthor(message, store.users));
}

export async function listConversationMessages(
  conversationId: string,
  opts?: { since?: string; limit?: number },
): Promise<Message[]> {
  const store = await ready();
  const limit = opts?.limit ?? 200;
  const cutoff = historyCutoffIso();
  return [...store.messages.values()]
    .filter((message) => {
      if (message.conversation_id !== conversationId) return false;
      if (message.created_at < cutoff) return false;
      if (opts?.since && message.created_at <= opts.since) return false;
      return true;
    })
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, limit)
    .map((message) => withAuthor(message, store.users));
}

export async function createMessage(input: {
  channel_id?: string | null;
  conversation_id?: string | null;
  author_id: string;
  body: string;
}): Promise<Message> {
  const store = await ready();
  const message: Message = {
    id: newId(),
    channel_id: input.channel_id ?? null,
    conversation_id: input.conversation_id ?? null,
    author_id: input.author_id,
    body: input.body,
    created_at: nowIso(),
  };
  store.messages.set(message.id, message);
  return withAuthor(message, store.users);
}

export async function searchMessages(queryText: string, limit = 40): Promise<Message[]> {
  const q = queryText.trim().toLowerCase();
  if (!q) return [];
  const store = await ready();
  const cutoff = historyCutoffIso();
  return [...store.messages.values()]
    .filter(
      (message) =>
        message.created_at >= cutoff && message.body.toLowerCase().includes(q),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit)
    .map((message) => withAuthor(message, store.users));
}

// Notifications
export async function createNotification(input: {
  user_id: string;
  body: string;
  link?: string;
}): Promise<void> {
  const store = await ready();
  const notification: Notification = {
    id: newId(),
    user_id: input.user_id,
    body: input.body,
    link: input.link ?? "",
    read: false,
    created_at: nowIso(),
  };
  store.notifications.set(notification.id, notification);
}

export async function listNotifications(userId: string, limit = 30): Promise<Notification[]> {
  const store = await ready();
  return [...store.notifications.values()]
    .filter((notification) => notification.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const store = await ready();
  let count = 0;
  for (const notification of store.notifications.values()) {
    if (notification.user_id === userId && !notification.read) count += 1;
  }
  return count;
}

export async function markNotificationsRead(userId: string): Promise<void> {
  const store = await ready();
  for (const [id, notification] of store.notifications.entries()) {
    if (notification.user_id === userId && !notification.read) {
      store.notifications.set(id, { ...notification, read: true });
    }
  }
}
