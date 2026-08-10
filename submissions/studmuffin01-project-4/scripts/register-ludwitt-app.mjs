#!/usr/bin/env node
/**
 * Register this course on the local Ludwitt/Hult API (cmd-friendly).
 *
 * Terminal 1:
 *   cd ..\..\execution\ludwitt-hult-api
 *   npm run dev
 *
 * Terminal 2 (this folder):
 *   node scripts\register-ludwitt-app.mjs
 */
const BASE = process.env.LUDWITT_API_BASE_URL || "http://localhost:4000/v1";
const DEV_KEY = process.env.LUDWITT_DEV_KEY || "prod_key_demo";

const body = {
  title: "Prompt Like a Pro: The SCORE Method for Copilot",
  description:
    "A professional prompting course that teaches the SCORE method so managers, analysts, and other knowledge workers get reliable results from Copilot and similar AI tools.",
  topic: "Professional skills / Prompt engineering",
  launch_url: "http://localhost:3000/launch",
  repo_url: "https://github.com/Studmuffin01",
};

const res = await fetch(`${BASE.replace(/\/$/, "")}/developer/apps`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${DEV_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const text = await res.text();
let json;
try {
  json = JSON.parse(text);
} catch {
  json = { raw: text };
}

if (!res.ok) {
  console.error(`Register failed (${res.status}). Is the API running on port 4000?`);
  console.error(json);
  process.exit(1);
}

const appId = json.app_id ?? json.appId ?? "";
const jwtSecret = json.jwt_secret ?? json.jwtSecret ?? "";

console.log("Registered OK. Copy these into .env.local:\n");
console.log(`LUDWITT_APP_ID=${appId}`);
// Local reference API authenticates events with the *developer* key, not the app_ key.
console.log(`LUDWITT_API_KEY=prod_key_demo`);
console.log(`LUDWITT_JWT_SECRET=${jwtSecret}`);
console.log(`LUDWITT_API_BASE_URL=${BASE}`);
console.log(`NEXT_PUBLIC_APP_URL=http://localhost:3000`);
console.log(`ALLOW_DEV_BYPASS=true`);
console.log(
  "\nNote: keep jwt_secret from registration. For localhost:4000 events, use prod_key_demo as LUDWITT_API_KEY (not the returned app_ key)."
);
console.log("\nFull JSON:");
console.log(JSON.stringify(json, null, 2));
