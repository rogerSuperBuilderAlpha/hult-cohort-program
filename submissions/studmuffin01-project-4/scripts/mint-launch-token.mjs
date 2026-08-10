/**
 * Mint a local Ludwitt-style launch JWT (HS256) using .env.local values.
 *
 * Usage:
 *   node scripts/mint-launch-token.mjs
 *
 * Requires: LUDWITT_JWT_SECRET (and ideally LUDWITT_APP_ID) in .env.local
 */

import { createHmac, randomUUID } from "crypto";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signJwt(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(payload));
  const data = `${h}.${p}`;
  const sig = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

const env = { ...loadEnvFile(envPath), ...process.env };
const secret = env.LUDWITT_JWT_SECRET;
const appId = env.LUDWITT_APP_ID || "local-app-id";
const base =
  (env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

if (!secret) {
  console.error(
    "Missing LUDWITT_JWT_SECRET. Copy .env.example → .env.local and set the secret from Ludwitt registration (or any test string for local-only).",
  );
  process.exit(1);
}

const now = Math.floor(Date.now() / 1000);
const token = signJwt(
  {
    sub: env.LUDWITT_TEST_USER_ID || randomUUID(),
    email: env.LUDWITT_TEST_EMAIL || "learner@example.com",
    app_id: appId,
    iat: now,
    exp: now + 60 * 60,
  },
  secret,
);

const launchUrl = `${base}/launch?token=${encodeURIComponent(token)}`;

console.log("Launch URL (open in browser):\n");
console.log(launchUrl);
console.log("\nToken expires in 1 hour.");
