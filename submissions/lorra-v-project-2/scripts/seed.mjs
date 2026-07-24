#!/usr/bin/env node
/**
 * Seed ~10 fake cohort users + default workspace/channels (PRD §3 / §4.1).
 * Uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS). Run after schema migrations.
 *
 * Auth Admin calls use the REST API with the secret on `apikey` (and Bearer) so
 * new-format `sb_secret_…` keys work reliably with hosted GoTrue.
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./load-env.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnvLocal(path.join(__dirname, ".."));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const forthBase =
  process.env.NEXT_PUBLIC_FORTH_BASE_URL || "https://forth-bice.vercel.app";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Shared password for local seed accounts only — never use in production. */
export const SEED_PASSWORD = "ConexusSeed!2026";

const SEED_USERS = [
  {
    email: "admin@conexus.local",
    display_name: "Casey Admin",
    role: "admin",
  },
  { email: "asha@conexus.local", display_name: "Asha Patel", role: "member" },
  { email: "daniel@conexus.local", display_name: "Daniel Kim", role: "member" },
  { email: "maria@conexus.local", display_name: "Maria Lopez", role: "member" },
  { email: "jordan@conexus.local", display_name: "Jordan Lee", role: "member" },
  { email: "sam@conexus.local", display_name: "Sam Okonkwo", role: "member" },
  { email: "riley@conexus.local", display_name: "Riley Chen", role: "member" },
  { email: "alex@conexus.local", display_name: "Alex Nguyen", role: "member" },
  { email: "taylor@conexus.local", display_name: "Taylor Brooks", role: "member" },
  { email: "morgan@conexus.local", display_name: "Morgan Diaz", role: "member" },
];

function authHeaders() {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAuthAdmin(pathname, init, { retries = 5 } = {}) {
  let lastErr = "unknown error";
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const res = await fetch(`${url}${pathname}`, {
      ...init,
      headers: { ...authHeaders(), ...(init.headers ?? {}) },
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) return body;

    lastErr = `${res.status}: ${body.msg || body.message || JSON.stringify(body)}`;
    const retryable =
      res.status === 403 ||
      res.status === 429 ||
      res.status >= 500 ||
      /invalid JWT/i.test(lastErr);
    if (!retryable || attempt === retries) {
      throw new Error(`Auth Admin ${pathname} failed (${lastErr})`);
    }
    const waitMs = 400 * attempt * attempt;
    console.warn(`  retry ${attempt}/${retries} after Auth Admin error (${lastErr})`);
    await sleep(waitMs);
  }
  throw new Error(`Auth Admin ${pathname} failed (${lastErr})`);
}

async function listAllAuthUsers() {
  const users = [];
  for (let page = 1; page <= 10; page += 1) {
    const body = await fetchAuthAdmin(
      `/auth/v1/admin/users?page=${page}&per_page=200`,
      { method: "GET" },
    );
    const batch = body.users ?? [];
    users.push(...batch);
    if (batch.length < 200) break;
  }
  return users;
}

async function upsertAuthUser(existingByEmail, { email, display_name, role }) {
  const existing = existingByEmail.get(email.toLowerCase());

  // Existing users: reuse id. Avoid Admin PUT/PATCH — hosted GoTrue + sb_secret
  // intermittently rejects those with ES256 JWT errors. Password is only set on create.
  if (existing) {
    return existing.id;
  }

  const body = await fetchAuthAdmin("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name, role },
    }),
  });
  existingByEmail.set(email.toLowerCase(), body);
  return body.id;
}

async function main() {
  console.log("Seeding Conexus cohort…");

  const existingUsers = await listAllAuthUsers();
  const existingByEmail = new Map(
    existingUsers
      .filter((u) => u.email)
      .map((u) => [u.email.toLowerCase(), u]),
  );

  const profileIds = [];
  for (const user of SEED_USERS) {
    const id = await upsertAuthUser(existingByEmail, user);
    profileIds.push({ id, ...user });

    const { error: rosterErr } = await admin.from("roster_allowlist").upsert(
      { email: user.email, display_name: user.display_name },
      { onConflict: "email" },
    );
    if (rosterErr) throw new Error(`roster ${user.email}: ${rosterErr.message}`);

    const { error: profileErr } = await admin.from("profiles").upsert(
      {
        id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        status: "active",
        avatar_url: null,
      },
      { onConflict: "id" },
    );
    if (profileErr) throw new Error(`profile ${user.email}: ${profileErr.message}`);

    console.log(`  user ${user.email} (${user.role})`);
  }

  const adminId = profileIds.find((p) => p.role === "admin").id;

  let workspaceId;
  const { data: existingWs, error: wsReadErr } = await admin
    .from("workspaces")
    .select("id")
    .eq("name", "Hult Cohort Summer 26")
    .maybeSingle();
  if (wsReadErr) throw new Error(`workspace read: ${wsReadErr.message}`);

  if (existingWs) {
    workspaceId = existingWs.id;
  } else {
    const { data: ws, error: wsErr } = await admin
      .from("workspaces")
      .insert({ name: "Hult Cohort Summer 26" })
      .select("id")
      .single();
    if (wsErr) throw new Error(`workspace insert: ${wsErr.message}`);
    workspaceId = ws.id;
  }

  const defaultChannels = [
    {
      name: "announcements",
      description: "Official cohort announcements (admin post only)",
      type: "public",
      admin_post_only: true,
    },
    {
      name: "general",
      description: "Day-to-day cohort chat",
      type: "public",
      admin_post_only: false,
    },
    {
      name: "random",
      description: "Off-topic and watercooler",
      type: "public",
      admin_post_only: false,
    },
  ];

  const channelIds = [];
  for (const ch of defaultChannels) {
    const { data: existing, error: chReadErr } = await admin
      .from("channels")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("name", ch.name)
      .maybeSingle();
    if (chReadErr) throw new Error(`channel read #${ch.name}: ${chReadErr.message}`);

    let channelId = existing?.id;
    if (!channelId) {
      const { data: created, error: chErr } = await admin
        .from("channels")
        .insert({
          workspace_id: workspaceId,
          name: ch.name,
          description: ch.description,
          type: ch.type,
          created_by: adminId,
          admin_post_only: ch.admin_post_only,
        })
        .select("id")
        .single();
      if (chErr) throw new Error(`channel insert #${ch.name}: ${chErr.message}`);
      channelId = created.id;
    }
    channelIds.push(channelId);
    console.log(`  channel #${ch.name}`);
  }

  for (const channelId of channelIds) {
    const rows = profileIds.map((p) => ({
      channel_id: channelId,
      user_id: p.id,
      notification_level: "all",
    }));
    const { error: memErr } = await admin.from("channel_members").upsert(rows, {
      onConflict: "channel_id,user_id",
    });
    if (memErr) throw new Error(`channel_members: ${memErr.message}`);
  }

  const { data: existingCfg, error: cfgReadErr } = await admin
    .from("integration_configs")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (cfgReadErr) throw new Error(`integration_configs read: ${cfgReadErr.message}`);

  if (!existingCfg) {
    const { error: cfgErr } = await admin.from("integration_configs").insert({
      forth_base_url: forthBase,
      shared_api_key_encrypted: null,
      webhook_secret: null,
    });
    if (cfgErr) throw new Error(`integration_configs insert: ${cfgErr.message}`);
  }

  const generalId = channelIds[1];
  const asha = profileIds.find((p) => p.email.startsWith("asha"));
  const { data: existingMsg, error: msgReadErr } = await admin
    .from("messages")
    .select("id")
    .eq("parent_type", "channel")
    .eq("parent_id", generalId)
    .limit(1)
    .maybeSingle();
  if (msgReadErr) throw new Error(`messages read: ${msgReadErr.message}`);

  if (!existingMsg && asha) {
    const { error: msgErr } = await admin.from("messages").insert({
      parent_type: "channel",
      parent_id: generalId,
      author_id: asha.id,
      body_richtext: "Welcome to Conexus — seed message for local testing.",
    });
    if (msgErr) throw new Error(`messages insert: ${msgErr.message}`);
  }

  console.log(`
Seed complete.
  Users: ${SEED_USERS.length}
  Password (all seed accounts): ${SEED_PASSWORD}
  Admin: admin@conexus.local
`);
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
