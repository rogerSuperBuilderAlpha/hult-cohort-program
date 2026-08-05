/**
 * Smoke the Ludwitt integration against a running Interview Room deploy.
 *
 * Usage:
 *   node scripts/smoke-integration.mjs
 *   node scripts/smoke-integration.mjs https://your-app.vercel.app
 */
const BASE = (process.argv[2] || process.env.SMOKE_BASE || "http://localhost:3000").replace(
  /\/$/,
  "",
);
const DEV_KEY = process.env.LUDWITT_DEV_KEY || "prod_key_demo";
const APP_ID = process.env.LUDWITT_APP_ID || "7f3e9c2a-4b1d-4e8f-9a6c-2d5e8f1a3b7c";

async function api(method, path, body, key = DEV_KEY) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, body: json };
}

async function main() {
  console.log(`Smoke base: ${BASE}`);

  const health = await fetch(`${BASE}/health`).then((r) => r.json());
  console.log("health", health);

  const reg = await api("POST", "/v1/developer/apps", {
    title: "Interview Room",
    description:
      "A mock-interview app for job seekers: timed rounds for behavioral STAR answers, coding screens, system design, and closing questions — with Ludwitt/Hult session tracking so practice sessions count.",
    topic: "Interview prep",
    launch_url: `${BASE}/launch`,
    repo_url:
      "https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/tree/main/submissions/kiaracaesar5627-project-4",
    icon_url: `${BASE}/icon`,
  });
  console.log("register", reg.status, reg.body);
  if (reg.status !== 201) process.exit(1);

  const { app_id, api_key, jwt_secret } = reg.body;
  if (app_id !== APP_ID) {
    console.warn(`Note: registered app_id ${app_id} (expected seed ${APP_ID})`);
  }

  const userId = crypto.randomUUID();
  const launch = await api("POST", "/v1/auth/launch-token", {
    app_id,
    user_id: userId,
    email: "external-learner@example.com",
  });
  console.log("launch-token", launch.status, {
    hasToken: Boolean(launch.body?.token),
    launch_url: launch.body?.launch_url?.slice(0, 80) + "…",
  });
  if (launch.status !== 200) process.exit(1);

  const sessionId = crypto.randomUUID();
  const ev1 = await api(
    "POST",
    `/v1/apps/${app_id}/events`,
    {
      event: "lesson_started",
      user_id: userId,
      session_id: sessionId,
      metadata: { lesson_id: "behavioral-star", smoke: true },
    },
    api_key,
  );
  const ev2 = await api(
    "POST",
    `/v1/apps/${app_id}/events`,
    {
      event: "quiz_submitted",
      user_id: userId,
      session_id: sessionId,
      metadata: { lesson_id: "behavioral-star", correct: true },
    },
    api_key,
  );
  console.log("events", ev1.status, ev1.body, ev2.status, ev2.body);

  const metrics = await api("GET", `/v1/apps/${app_id}/metrics`, null, api_key);
  console.log("metrics", metrics.status, metrics.body);

  console.log("\n--- PR snapshot fields ---");
  console.log(`Ludwitt/Hult app ID: ${app_id}`);
  console.log(`Production listing URL: ${BASE}`);
  console.log(
    `Metrics API snapshot (${metrics.body?.as_of || new Date().toISOString()}): unique_users=${metrics.body?.unique_users} qualified_users=${metrics.body?.qualified_users}`,
  );
  console.log(`jwt_secret present: ${Boolean(jwt_secret)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
