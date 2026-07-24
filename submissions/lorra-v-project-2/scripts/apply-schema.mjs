#!/usr/bin/env node
/**
 * Apply supabase/migrations/*.sql to the linked Postgres database.
 * Requires DATABASE_URL in .env.local (Supabase → Project Settings → Database → URI).
 * Ignores a parent-shell DATABASE_URL so other projects (e.g. Neon) cannot leak in.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { loadEnvLocal } from "./load-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
loadEnvLocal(root);

function readEnvFileValue(key) {
  const full = path.join(root, ".env.local");
  if (!fs.existsSync(full)) return "";
  for (const raw of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (!line.startsWith(`${key}=`)) continue;
    let value = line.slice(key.length + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value;
  }
  return "";
}

const databaseUrl =
  readEnvFileValue("DATABASE_URL") || readEnvFileValue("SUPABASE_DB_URL");

if (!databaseUrl) {
  console.error(`
Missing DATABASE_URL in submissions/lorra-v-project-2/.env.local

API keys alone cannot run DDL. Add the Postgres connection string:

  DATABASE_URL=postgresql://postgres.[ref]:[YOUR-DB-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres

Find it in Supabase Dashboard → Project Settings → Database → Connection string (URI).
Use the Session pooler URI if Direct connections are blocked on your network.

Note: a DATABASE_URL in your shell from another project (e.g. Neon) is intentionally ignored.
`);
  process.exit(1);
}

let host = "";
try {
  host = new URL(databaseUrl.replace(/^postgresql:/, "http:")).hostname;
} catch {
  console.error("DATABASE_URL is not a valid URI");
  process.exit(1);
}

if (!/supabase\.(co|com)$/i.test(host) && !host.includes("pooler.supabase")) {
  console.error(
    `Refusing to apply migrations: DATABASE_URL host "${host}" does not look like Supabase.`,
  );
  process.exit(1);
}

const migrationsDir = path.join(root, "supabase", "migrations");
const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("No migration files found in supabase/migrations");
  process.exit(1);
}

const sql = postgres(databaseUrl, {
  max: 1,
  idle_timeout: 5,
  prepare: false,
  ssl: "require",
});

try {
  for (const file of files) {
    const full = path.join(migrationsDir, file);
    const body = fs.readFileSync(full, "utf8");
    console.log(`Applying ${file}…`);
    await sql.unsafe(body);
    console.log(`  ok ${file}`);
  }
  console.log("All migrations applied.");
} catch (err) {
  console.error("Migration failed:", err.message ?? err);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
