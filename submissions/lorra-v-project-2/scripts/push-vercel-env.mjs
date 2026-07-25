#!/usr/bin/env node
/**
 * Push selected .env.local keys to Vercel without printing secret values.
 * Usage: node scripts/push-vercel-env.mjs [--production] [--preview] [--development]
 *
 * Production defaults: disables NEXT_PUBLIC_ENABLE_DEV_LOGIN and skips DEV_ADMIN_*.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const full = path.join(root, ".env.local");
  if (!fs.existsSync(full)) {
    console.error("Missing .env.local");
    process.exit(1);
  }
  const map = {};
  for (const raw of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value) map[key] = value;
  }
  return map;
}

const args = process.argv.slice(2);
const targets = [];
if (args.includes("--production") || args.length === 0) targets.push("production");
if (args.includes("--preview")) targets.push("preview");
if (args.includes("--development")) targets.push("development");

const env = loadEnvLocal();

/** Keys copied from .env.local into Vercel (values never logged). */
const COPY_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_FORTH_BASE_URL",
  "FORTH_USE_FIXTURES",
  "FORTH_API_KEY",
  "FORTH_WEBHOOK_SECRET",
  "CRON_SECRET",
];

function setEnv(key, value, target) {
  // Remove existing so re-runs are idempotent (ignore failures).
  spawnSync("npx", ["vercel", "env", "rm", key, target, "-y"], {
    cwd: root,
    encoding: "utf8",
    shell: true,
  });
  const res = spawnSync(
    "npx",
    ["vercel", "env", "add", key, target],
    {
      cwd: root,
      encoding: "utf8",
      shell: true,
      input: `${value}\n`,
    },
  );
  if (res.status !== 0) {
    const err = (res.stderr || res.stdout || "").trim();
    console.error(`Failed to set ${key} (${target}): ${err.slice(0, 200)}`);
    return false;
  }
  console.log(`  set ${key} → ${target}`);
  return true;
}

let ok = true;
for (const target of targets) {
  console.log(`Pushing env → ${target}`);
  for (const key of COPY_KEYS) {
    if (!env[key]) {
      console.log(`  skip ${key} (not set locally)`);
      continue;
    }
    if (!setEnv(key, env[key], target)) ok = false;
  }

  // Production / preview: never enable seed-password login on the shared project surface.
  if (target === "production" || target === "preview") {
    if (!setEnv("NEXT_PUBLIC_ENABLE_DEV_LOGIN", "false", target)) ok = false;
  } else if (env.NEXT_PUBLIC_ENABLE_DEV_LOGIN) {
    if (!setEnv("NEXT_PUBLIC_ENABLE_DEV_LOGIN", env.NEXT_PUBLIC_ENABLE_DEV_LOGIN, target)) {
      ok = false;
    }
  }

  // Optional override: NEXT_PUBLIC_APP_URL from CLI --app-url=https://...
  const appUrlArg = args.find((a) => a.startsWith("--app-url="));
  if (appUrlArg) {
    const appUrl = appUrlArg.slice("--app-url=".length);
    if (!setEnv("NEXT_PUBLIC_APP_URL", appUrl, target)) ok = false;
  } else if (target === "development" && env.NEXT_PUBLIC_APP_URL) {
    if (!setEnv("NEXT_PUBLIC_APP_URL", env.NEXT_PUBLIC_APP_URL, target)) ok = false;
  }
}

process.exit(ok ? 0 : 1);
