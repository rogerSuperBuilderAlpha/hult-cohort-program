#!/usr/bin/env node
/**
 * Verify PRD §3 tables exist and seed row counts look sane (service role).
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./load-env.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnvLocal(path.join(__dirname, ".."));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const REQUIRED_TABLES = [
  "profiles",
  "workspaces",
  "channels",
  "channel_members",
  "conversations",
  "conversation_members",
  "messages",
  "reactions",
  "attachments",
  "mentions",
  "ticket_links",
  "notifications",
  "integration_configs",
  "roster_allowlist",
];

async function count(table) {
  const { count, error } = await admin
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) {
    return { table, ok: false, error: error.message };
  }
  return { table, ok: true, count: count ?? 0 };
}

const results = [];
for (const table of REQUIRED_TABLES) {
  results.push(await count(table));
}

const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error("Schema verification failed — missing or inaccessible tables:");
  for (const f of failed) {
    console.error(`  ${f.table}: ${f.error}`);
  }
  console.error("\nRun: npm run db:apply && npm run db:seed");
  process.exit(1);
}

const profiles = results.find((r) => r.table === "profiles");
const channels = results.find((r) => r.table === "channels");
const workspaces = results.find((r) => r.table === "workspaces");

if ((profiles?.count ?? 0) < 10) {
  console.error(`Expected ≥10 profiles, found ${profiles?.count ?? 0}. Run npm run db:seed`);
  process.exit(1);
}
if ((channels?.count ?? 0) < 3) {
  console.error(`Expected ≥3 channels, found ${channels?.count ?? 0}. Run npm run db:seed`);
  process.exit(1);
}
if ((workspaces?.count ?? 0) < 1) {
  console.error("Expected ≥1 workspace. Run npm run db:seed");
  process.exit(1);
}

console.log("Schema + seed verification OK");
for (const r of results) {
  console.log(`  ${r.table}: ${r.count}`);
}

// Machine-readable summary for Playwright
console.log(
  JSON.stringify({
    ok: true,
    profiles: profiles.count,
    channels: channels.count,
    workspaces: workspaces.count,
  }),
);
