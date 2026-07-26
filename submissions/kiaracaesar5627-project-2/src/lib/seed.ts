import { hashPassword } from "./password";
import {
  createChannel,
  createMessage,
  createUser,
  findUserByEmail,
  getChannelBySlug,
  listChannelMessages,
} from "./db";
import { ensureSchema } from "./client";

async function upsertUser(input: {
  email: string;
  username: string;
  name: string;
  password: string;
  role: "ADMIN" | "MEMBER";
}) {
  const existing = await findUserByEmail(input.email);
  if (existing) return existing;
  return createUser({
    email: input.email,
    username: input.username,
    name: input.name,
    password_hash: await hashPassword(input.password),
    role: input.role,
  });
}

async function ensureChannel(input: {
  name: string;
  slug: string;
  description: string;
  kind: "public" | "announcements";
  created_by_id: string;
}) {
  const existing = await getChannelBySlug(input.slug);
  if (existing) return existing;
  return createChannel(input);
}

export async function seedComms() {
  await ensureSchema();

  const adminUser = await upsertUser({
    email: "demo@flexiflow.test",
    username: "demo",
    name: "Demo Admin",
    password: "DemoPass1!",
    role: "ADMIN",
  });
  const sam = await upsertUser({
    email: "sam@flexiflow.test",
    username: "sam",
    name: "Sam Member",
    password: "SamPass1!",
    role: "MEMBER",
  });
  const guest = await upsertUser({
    email: "guest@flexiflow.test",
    username: "guest",
    name: "Gina Guest",
    password: "GuestPass1!",
    role: "MEMBER",
  });

  const general = await ensureChannel({
    name: "general",
    slug: "general",
    description: "Day-to-day cohort chat",
    kind: "public",
    created_by_id: adminUser.id,
  });
  const reviews = await ensureChannel({
    name: "reviews",
    slug: "reviews",
    description: "Peer review coordination",
    kind: "public",
    created_by_id: adminUser.id,
  });
  const announcements = await ensureChannel({
    name: "announcements",
    slug: "announcements",
    description: "Staff posts only",
    kind: "announcements",
    created_by_id: adminUser.id,
  });
  await ensureChannel({
    name: "setup",
    slug: "setup",
    description: "Onboarding and tooling help",
    kind: "public",
    created_by_id: adminUser.id,
  });

  const existing = await listChannelMessages(general.id, { limit: 1 });
  if (existing.length === 0) {
    await createMessage({
      channel_id: general.id,
      author_id: adminUser.id,
      body: "Welcome to Chorus — the cohort communications layer.",
    });
    await createMessage({
      channel_id: general.id,
      author_id: sam.id,
      body: "Glad to be here. Looking forward to reviews week.",
    });
    await createMessage({
      channel_id: reviews.id,
      author_id: guest.id,
      body: "I'll drop my review links in this channel.",
    });
    await createMessage({
      channel_id: announcements.id,
      author_id: adminUser.id,
      body: "Staff announcement: submission PR due Thursday 17:00 ET.",
    });
  }
}
