import { createClient } from "@supabase/supabase-js";
import { hashPassword } from "../src/lib/password";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env for seed");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const sb = admin();

async function upsertUser(input: {
  email: string;
  username: string;
  name: string;
  password: string;
  role: "ADMIN" | "MEMBER";
}) {
  const password_hash = await hashPassword(input.password);
  const { data: existing } = await sb
    .from("relay_users")
    .select("*")
    .eq("email", input.email)
    .maybeSingle();
  if (existing) {
    const { data, error } = await sb
      .from("relay_users")
      .update({
        username: input.username,
        name: input.name,
        password_hash,
        role: input.role,
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return data!;
  }
  const { data, error } = await sb
    .from("relay_users")
    .insert({
      email: input.email,
      username: input.username,
      name: input.name,
      password_hash,
      role: input.role,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data!;
}

async function ensureChannel(input: {
  name: string;
  slug: string;
  description: string;
  kind: "public" | "announcements";
  created_by_id: string;
}) {
  const { data: existing } = await sb
    .from("relay_channels")
    .select("*")
    .eq("slug", input.slug)
    .maybeSingle();
  if (existing) return existing;
  const { data, error } = await sb
    .from("relay_channels")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data!;
}

async function main() {
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

  // Seed a few messages if channel is empty
  const { count } = await sb
    .from("relay_messages")
    .select("*", { count: "exact", head: true })
    .eq("channel_id", general.id);
  if (!count) {
    await sb.from("relay_messages").insert([
      {
        channel_id: general.id,
        author_id: adminUser.id,
        body: "Welcome to Relay — the cohort communications layer.",
      },
      {
        channel_id: general.id,
        author_id: sam.id,
        body: "Glad to be here. Looking forward to reviews week.",
      },
      {
        channel_id: reviews.id,
        author_id: guest.id,
        body: "I'll drop my review links in this channel.",
      },
      {
        channel_id: announcements.id,
        author_id: adminUser.id,
        body: "Staff announcement: submission PR due Thursday 17:00 ET.",
      },
    ]);
  }

  console.log("Seeded Relay users + channels:");
  console.log("- demo@flexiflow.test / DemoPass1! (ADMIN)");
  console.log("- sam@flexiflow.test / SamPass1!");
  console.log("- guest@flexiflow.test / GuestPass1!");
  console.log(`Channels: #${general.slug}, #${reviews.slug}, #${announcements.slug}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
