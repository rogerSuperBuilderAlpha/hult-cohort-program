"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createSession,
  destroySession,
  hashPassword,
  requireUser,
  verifyPassword,
} from "./auth";
import { ensureSeeded } from "./bootstrap";
import {
  createChannel,
  createMessage,
  createNotification,
  createUser,
  findUserByEmail,
  findUserByEmailOrUsername,
  findUserById,
  findUserByUsername,
  getChannelById,
  getChannelBySlug,
  getConversationForUser,
  getOrCreateDm,
  listUsersPublic,
  markNotificationsRead,
  slugifyChannel,
  updateChannel,
  updateUser,
} from "./db";

export type ActionResult = { ok: true } | { ok: false; error: string };

const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  username: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/, "Username: letters, numbers, _ or -"),
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function registerAction(formData: FormData): Promise<ActionResult> {
  await ensureSeeded();
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };

  const existing = await findUserByEmailOrUsername(parsed.data.email, parsed.data.username);
  if (existing) return { ok: false, error: "Email or username already in use." };

  const user = await createUser({
    ...parsed.data,
    email: parsed.data.email.toLowerCase(),
    password_hash: await hashPassword(parsed.data.password),
  });
  await createSession({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
  });
  redirect("/app");
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  await ensureSeeded();
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid email or password." };

  const user = await findUserByEmail(parsed.data.email);
  if (!user || !(await verifyPassword(parsed.data.password, user.password_hash))) {
    return { ok: false, error: "Invalid email or password." };
  }
  await createSession({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
  });
  redirect("/app");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

function extractMentions(body: string): string[] {
  return Array.from(body.matchAll(/@([a-zA-Z0-9_-]+)/g)).map((m) => m[1].toLowerCase());
}

async function notifyMentions(opts: {
  body: string;
  authorId: string;
  authorUsername: string;
  link: string;
  excludeIds?: string[];
}) {
  const usernames = extractMentions(opts.body);
  if (usernames.length === 0) return;
  const users = await listUsersPublic();
  const exclude = new Set(opts.excludeIds ?? []);
  exclude.add(opts.authorId);
  for (const username of usernames) {
    const target = users.find((u) => u.username.toLowerCase() === username);
    if (!target || exclude.has(target.id)) continue;
    await createNotification({
      user_id: target.id,
      body: `@${opts.authorUsername} mentioned you: ${opts.body.slice(0, 120)}`,
      link: opts.link,
    });
  }
}

export async function sendChannelMessageAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const channelId = String(formData.get("channelId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!channelId || !body) return;

  const channel = await getChannelById(channelId);
  if (!channel || channel.archived) return;
  if (channel.kind === "announcements" && user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  await createMessage({
    channel_id: channelId,
    author_id: user.id,
    body,
  });
  await notifyMentions({
    body,
    authorId: user.id,
    authorUsername: user.username,
    link: `/app/c/${channel.slug}`,
  });
  revalidatePath(`/app/c/${channel.slug}`);
}

export async function sendDmMessageAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const conversationId = String(formData.get("conversationId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!conversationId || !body) return;

  const conversation = await getConversationForUser(conversationId, user.id);
  if (!conversation) throw new Error("FORBIDDEN");

  await createMessage({
    conversation_id: conversationId,
    author_id: user.id,
    body,
  });

  // Notify the other participant
  const dms = await (await import("./db")).listDmConversations(user.id);
  const peer = dms.find((d) => d.conversation.id === conversationId)?.peer;
  if (peer) {
    await createNotification({
      user_id: peer.id,
      body: `New DM from @${user.username}: ${body.slice(0, 120)}`,
      link: `/app/dm/${conversationId}`,
    });
  }
  await notifyMentions({
    body,
    authorId: user.id,
    authorUsername: user.username,
    link: `/app/dm/${conversationId}`,
    excludeIds: peer ? [peer.id] : [],
  });
  revalidatePath(`/app/dm/${conversationId}`);
}

export async function startDmAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const peerId = String(formData.get("peerId") ?? "");
  if (!peerId) return;
  const peer = await findUserById(peerId);
  if (!peer) return;
  const conversation = await getOrCreateDm(user.id, peer.id);
  redirect(`/app/dm/${conversation.id}`);
}

export async function createChannelAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return;

  let slug = slugifyChannel(name);
  if (await getChannelBySlug(slug)) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  const channel = await createChannel({
    name,
    slug,
    description,
    kind: "public",
    created_by_id: user.id,
  });
  revalidatePath("/app");
  redirect(`/app/c/${channel.slug}`);
}

export async function renameChannelAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  const channelId = String(formData.get("channelId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!channelId || !name) return;
  const channel = await getChannelById(channelId);
  if (!channel || channel.kind === "announcements") return;

  let slug = slugifyChannel(name);
  const clash = await getChannelBySlug(slug);
  if (clash && clash.id !== channelId) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  const updated = await updateChannel(channelId, { name, slug });
  revalidatePath("/app");
  redirect(`/app/c/${updated.slug}`);
}

export async function archiveChannelAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  const channelId = String(formData.get("channelId") ?? "");
  const archived = String(formData.get("archived") ?? "true") === "true";
  if (!channelId) return;
  const channel = await getChannelById(channelId);
  if (!channel || channel.kind === "announcements") return;
  await updateChannel(channelId, { archived });
  revalidatePath("/app");
  redirect("/app");
}

export async function markNotificationsReadAction(): Promise<void> {
  const user = await requireUser();
  await markNotificationsRead(user.id);
  revalidatePath("/app/notifications");
}

const profileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  username: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/, "Username: letters, numbers, _ or -"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const session = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid profile." };
  }

  const clash = await findUserByUsername(parsed.data.username);
  if (clash && clash.id !== session.id) {
    return { ok: false, error: "Username already in use." };
  }

  const updated = await updateUser(session.id, {
    name: parsed.data.name,
    username: parsed.data.username,
  });
  if (!updated) return { ok: false, error: "Could not update profile." };

  await createSession({
    id: updated.id,
    email: updated.email,
    username: updated.username,
    name: updated.name,
    role: updated.role,
  });
  revalidatePath("/app/profile");
  revalidatePath("/app");
  return { ok: true };
}

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  const session = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid password.",
    };
  }

  const dbUser = await findUserById(session.id);
  if (!dbUser) return { ok: false, error: "Could not update password." };

  if (!(await verifyPassword(parsed.data.currentPassword, dbUser.password_hash))) {
    return { ok: false, error: "Current password is incorrect." };
  }

  const updated = await updateUser(session.id, {
    password_hash: await hashPassword(parsed.data.newPassword),
  });
  if (!updated) return { ok: false, error: "Could not update password." };

  revalidatePath("/app/profile");
  return { ok: true };
}
