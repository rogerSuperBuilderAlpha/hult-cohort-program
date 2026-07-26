import { ensureSchema, getDb, newId, nowIso } from "./client";
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
  return getDb();
}

function mapUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    email: String(row.email),
    username: String(row.username),
    name: String(row.name),
    password_hash: String(row.password_hash),
    role: row.role as UserRole,
    created_at: String(row.created_at),
  };
}

function mapUserPublic(row: Record<string, unknown>): UserPublic {
  return {
    id: String(row.id),
    email: String(row.email),
    username: String(row.username),
    name: String(row.name),
    role: row.role as UserRole,
  };
}

function mapChannel(row: Record<string, unknown>): Channel {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description ?? ""),
    kind: row.kind as ChannelKind,
    archived: Boolean(row.archived),
    created_by_id: String(row.created_by_id),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function mapMessage(row: Record<string, unknown>): Message {
  const message: Message = {
    id: String(row.id),
    channel_id: row.channel_id ? String(row.channel_id) : null,
    conversation_id: row.conversation_id ? String(row.conversation_id) : null,
    author_id: String(row.author_id),
    body: String(row.body),
    created_at: String(row.created_at),
  };
  if (row.author_username) {
    message.author = {
      id: String(row.author_id),
      email: String(row.author_email ?? ""),
      username: String(row.author_username),
      name: String(row.author_name ?? ""),
      role: (row.author_role as UserRole) ?? "MEMBER",
    };
  }
  return message;
}

// Users
export async function findUserById(id: string): Promise<User | null> {
  const db = await ready();
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE id = ?",
    args: [id],
  });
  const row = result.rows[0] as Record<string, unknown> | undefined;
  return row ? mapUser(row) : null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await ready();
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE lower(email) = lower(?)",
    args: [email],
  });
  const row = result.rows[0] as Record<string, unknown> | undefined;
  return row ? mapUser(row) : null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const db = await ready();
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE username = ?",
    args: [username],
  });
  const row = result.rows[0] as Record<string, unknown> | undefined;
  return row ? mapUser(row) : null;
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
  const db = await ready();
  const id = newId();
  const created_at = nowIso();
  const role = input.role ?? "MEMBER";
  await db.execute({
    sql: `INSERT INTO users (id, email, username, name, password_hash, role, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.email.toLowerCase(),
      input.username,
      input.name,
      input.password_hash,
      role,
      created_at,
    ],
  });
  return {
    id,
    email: input.email.toLowerCase(),
    username: input.username,
    name: input.name,
    password_hash: input.password_hash,
    role,
    created_at,
  };
}

export async function listUsersPublic(): Promise<UserPublic[]> {
  const db = await ready();
  const result = await db.execute(
    "SELECT id, email, username, name, role FROM users ORDER BY username ASC",
  );
  return result.rows.map((row) => mapUserPublic(row as Record<string, unknown>));
}

// Channels
export async function listChannels(opts?: { includeArchived?: boolean }): Promise<Channel[]> {
  const db = await ready();
  const result = opts?.includeArchived
    ? await db.execute("SELECT * FROM channels ORDER BY name ASC")
    : await db.execute("SELECT * FROM channels WHERE archived = 0 ORDER BY name ASC");
  return result.rows.map((row) => mapChannel(row as Record<string, unknown>));
}

export async function getChannelById(id: string): Promise<Channel | null> {
  const db = await ready();
  const result = await db.execute({
    sql: "SELECT * FROM channels WHERE id = ?",
    args: [id],
  });
  const row = result.rows[0] as Record<string, unknown> | undefined;
  return row ? mapChannel(row) : null;
}

export async function getChannelBySlug(slug: string): Promise<Channel | null> {
  const db = await ready();
  const result = await db.execute({
    sql: "SELECT * FROM channels WHERE slug = ?",
    args: [slug],
  });
  const row = result.rows[0] as Record<string, unknown> | undefined;
  return row ? mapChannel(row) : null;
}

export async function createChannel(input: {
  name: string;
  slug: string;
  description?: string;
  kind?: ChannelKind;
  created_by_id: string;
}): Promise<Channel> {
  const db = await ready();
  const id = newId();
  const created_at = nowIso();
  const kind = input.kind ?? "public";
  const description = input.description ?? "";
  await db.execute({
    sql: `INSERT INTO channels
      (id, name, slug, description, kind, archived, created_by_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    args: [
      id,
      input.name,
      input.slug,
      description,
      kind,
      input.created_by_id,
      created_at,
      created_at,
    ],
  });
  return {
    id,
    name: input.name,
    slug: input.slug,
    description,
    kind,
    archived: false,
    created_by_id: input.created_by_id,
    created_at,
    updated_at: created_at,
  };
}

export async function updateChannel(
  id: string,
  input: Partial<Pick<Channel, "name" | "slug" | "description" | "archived">>,
): Promise<Channel> {
  const existing = await getChannelById(id);
  if (!existing) throw new Error("Channel not found");
  const next = {
    name: input.name ?? existing.name,
    slug: input.slug ?? existing.slug,
    description: input.description ?? existing.description,
    archived: input.archived ?? existing.archived,
    updated_at: nowIso(),
  };
  const db = await ready();
  await db.execute({
    sql: `UPDATE channels
      SET name = ?, slug = ?, description = ?, archived = ?, updated_at = ?
      WHERE id = ?`,
    args: [
      next.name,
      next.slug,
      next.description,
      next.archived ? 1 : 0,
      next.updated_at,
      id,
    ],
  });
  return { ...existing, ...next };
}

// Conversations / DMs
export async function getOrCreateDm(userA: string, userB: string): Promise<Conversation> {
  if (userA === userB) throw new Error("INVALID_DM");
  const db = await ready();
  const key = dmKeyFor(userA, userB);
  const existing = await db.execute({
    sql: "SELECT * FROM conversations WHERE dm_key = ?",
    args: [key],
  });
  const row = existing.rows[0] as Record<string, unknown> | undefined;
  if (row) {
    return {
      id: String(row.id),
      kind: "dm",
      dm_key: String(row.dm_key),
      created_at: String(row.created_at),
    };
  }

  const id = newId();
  const created_at = nowIso();
  await db.execute({
    sql: "INSERT INTO conversations (id, kind, dm_key, created_at) VALUES (?, 'dm', ?, ?)",
    args: [id, key, created_at],
  });
  await db.execute({
    sql: "INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?), (?, ?)",
    args: [id, userA, id, userB],
  });
  return { id, kind: "dm", dm_key: key, created_at };
}

export async function listDmConversations(userId: string) {
  const db = await ready();
  const memberships = await db.execute({
    sql: "SELECT conversation_id FROM conversation_members WHERE user_id = ?",
    args: [userId],
  });
  const ids = memberships.rows.map((row) => String((row as Record<string, unknown>).conversation_id));
  if (ids.length === 0) return [] as Array<{ conversation: Conversation; peer: UserPublic }>;

  const results: Array<{ conversation: Conversation; peer: UserPublic }> = [];
  for (const conversationId of ids) {
    const convResult = await db.execute({
      sql: "SELECT * FROM conversations WHERE id = ?",
      args: [conversationId],
    });
    const convRow = convResult.rows[0] as Record<string, unknown> | undefined;
    if (!convRow) continue;
    const members = await db.execute({
      sql: `SELECT u.id, u.email, u.username, u.name, u.role
            FROM conversation_members cm
            JOIN users u ON u.id = cm.user_id
            WHERE cm.conversation_id = ?`,
      args: [conversationId],
    });
    const peerRow = members.rows
      .map((row) => mapUserPublic(row as Record<string, unknown>))
      .find((user) => user.id !== userId);
    if (!peerRow) continue;
    results.push({
      conversation: {
        id: String(convRow.id),
        kind: "dm",
        dm_key: convRow.dm_key ? String(convRow.dm_key) : null,
        created_at: String(convRow.created_at),
      },
      peer: peerRow,
    });
  }
  return results;
}

export async function getConversationForUser(conversationId: string, userId: string) {
  const db = await ready();
  const membership = await db.execute({
    sql: `SELECT conversation_id FROM conversation_members
          WHERE conversation_id = ? AND user_id = ?`,
    args: [conversationId, userId],
  });
  if (!membership.rows[0]) return null;
  const conv = await db.execute({
    sql: "SELECT * FROM conversations WHERE id = ?",
    args: [conversationId],
  });
  const row = conv.rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    id: String(row.id),
    kind: "dm" as const,
    dm_key: row.dm_key ? String(row.dm_key) : null,
    created_at: String(row.created_at),
  };
}

const MESSAGE_SELECT = `
  SELECT m.*,
    u.email AS author_email,
    u.username AS author_username,
    u.name AS author_name,
    u.role AS author_role
  FROM messages m
  JOIN users u ON u.id = m.author_id
`;

export async function listChannelMessages(
  channelId: string,
  opts?: { since?: string; limit?: number },
): Promise<Message[]> {
  const db = await ready();
  const limit = opts?.limit ?? 200;
  const cutoff = historyCutoffIso();
  const result = opts?.since
    ? await db.execute({
        sql: `${MESSAGE_SELECT}
              WHERE m.channel_id = ? AND m.created_at >= ? AND m.created_at > ?
              ORDER BY m.created_at ASC LIMIT ?`,
        args: [channelId, cutoff, opts.since, limit],
      })
    : await db.execute({
        sql: `${MESSAGE_SELECT}
              WHERE m.channel_id = ? AND m.created_at >= ?
              ORDER BY m.created_at ASC LIMIT ?`,
        args: [channelId, cutoff, limit],
      });
  return result.rows.map((row) => mapMessage(row as Record<string, unknown>));
}

export async function listConversationMessages(
  conversationId: string,
  opts?: { since?: string; limit?: number },
): Promise<Message[]> {
  const db = await ready();
  const limit = opts?.limit ?? 200;
  const cutoff = historyCutoffIso();
  const result = opts?.since
    ? await db.execute({
        sql: `${MESSAGE_SELECT}
              WHERE m.conversation_id = ? AND m.created_at >= ? AND m.created_at > ?
              ORDER BY m.created_at ASC LIMIT ?`,
        args: [conversationId, cutoff, opts.since, limit],
      })
    : await db.execute({
        sql: `${MESSAGE_SELECT}
              WHERE m.conversation_id = ? AND m.created_at >= ?
              ORDER BY m.created_at ASC LIMIT ?`,
        args: [conversationId, cutoff, limit],
      });
  return result.rows.map((row) => mapMessage(row as Record<string, unknown>));
}

export async function createMessage(input: {
  channel_id?: string | null;
  conversation_id?: string | null;
  author_id: string;
  body: string;
}): Promise<Message> {
  const db = await ready();
  const id = newId();
  const created_at = nowIso();
  await db.execute({
    sql: `INSERT INTO messages (id, channel_id, conversation_id, author_id, body, created_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.channel_id ?? null,
      input.conversation_id ?? null,
      input.author_id,
      input.body,
      created_at,
    ],
  });
  const author = await findUserById(input.author_id);
  return {
    id,
    channel_id: input.channel_id ?? null,
    conversation_id: input.conversation_id ?? null,
    author_id: input.author_id,
    body: input.body,
    created_at,
    author: author
      ? {
          id: author.id,
          email: author.email,
          username: author.username,
          name: author.name,
          role: author.role,
        }
      : undefined,
  };
}

export async function searchMessages(queryText: string, limit = 40): Promise<Message[]> {
  const q = queryText.trim();
  if (!q) return [];
  const db = await ready();
  const result = await db.execute({
    sql: `${MESSAGE_SELECT}
          WHERE m.created_at >= ? AND lower(m.body) LIKE lower(?)
          ORDER BY m.created_at DESC LIMIT ?`,
    args: [historyCutoffIso(), `%${q}%`, limit],
  });
  return result.rows.map((row) => mapMessage(row as Record<string, unknown>));
}

// Notifications
export async function createNotification(input: {
  user_id: string;
  body: string;
  link?: string;
}): Promise<void> {
  const db = await ready();
  await db.execute({
    sql: `INSERT INTO notifications (id, user_id, body, link, read, created_at)
          VALUES (?, ?, ?, ?, 0, ?)`,
    args: [newId(), input.user_id, input.body, input.link ?? "", nowIso()],
  });
}

export async function listNotifications(userId: string, limit = 30): Promise<Notification[]> {
  const db = await ready();
  const result = await db.execute({
    sql: `SELECT * FROM notifications WHERE user_id = ?
          ORDER BY created_at DESC LIMIT ?`,
    args: [userId, limit],
  });
  return result.rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.id),
      user_id: String(r.user_id),
      body: String(r.body),
      link: String(r.link ?? ""),
      read: Boolean(r.read),
      created_at: String(r.created_at),
    };
  });
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const db = await ready();
  const result = await db.execute({
    sql: "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read = 0",
    args: [userId],
  });
  const row = result.rows[0] as Record<string, unknown> | undefined;
  return Number(row?.count ?? 0);
}

export async function markNotificationsRead(userId: string): Promise<void> {
  const db = await ready();
  await db.execute({
    sql: "UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0",
    args: [userId],
  });
}
