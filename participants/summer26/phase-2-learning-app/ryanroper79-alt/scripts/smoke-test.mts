/**
 * End-to-end smoke test: Ludwitt API launch token → app /launch → lesson events → metrics.
 * Usage: npm run smoke-test
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env.local');

function loadEnv() {
  const file = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
  for (const line of file.split('\n')) {
    const trimmed = line.trim().replace(/^\uFEFF/, '');
    const m = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2];
  }
}

async function main() {
  loadEnv();
  const baseUrl = (process.env.LUDWITT_API_BASE_URL || 'http://localhost:4000/v1').replace(/\/$/, '');
  const devKey = process.env.LUDWITT_DEVELOPER_KEY || 'prod_key_demo';
  const appId = process.env.LUDWITT_APP_ID?.trim();
  const appUrl = (process.env.APP_PRODUCTION_URL || 'http://localhost:3000').replace(/\/$/, '');

  if (!appId) throw new Error('Run npm run register-app first (LUDWITT_APP_ID missing)');

  const tokenRes = await fetch(`${baseUrl}/auth/launch-token`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${devKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: appId,
      user_id: 'external-smoke-user-1',
      email: 'smoke.external@example.com',
    }),
  });
  const tokenBody = await tokenRes.json();
  if (!tokenRes.ok) throw new Error(`launch-token failed: ${JSON.stringify(tokenBody)}`);

  const launchRes = await fetch(tokenBody.launch_url, { redirect: 'manual' });
  if (launchRes.status !== 307 && launchRes.status !== 302 && launchRes.status !== 200) {
    throw new Error(`launch page failed: ${launchRes.status}`);
  }

  const cookie = launchRes.headers.get('set-cookie') || '';
  if (!cookie.includes('climate_learn_session')) {
    throw new Error('launch did not set session cookie');
  }

  const eventRes = await fetch(`${appUrl}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie.split(';')[0],
    },
    body: JSON.stringify({ event: 'quiz_submitted', metadata: { rfp_case_id: 'won-municipal-solar-2025-q1', smoke: 'true' } }),
  });
  const eventBody = await eventRes.json();
  if (!eventRes.ok) throw new Error(`event proxy failed: ${JSON.stringify(eventBody)}`);

  const metricsRes = await fetch(`${baseUrl}/apps/${appId}/metrics`, {
    headers: { Authorization: `Bearer ${devKey}` },
  });
  const metrics = await metricsRes.json();
  if (!metricsRes.ok) throw new Error(`metrics failed: ${JSON.stringify(metrics)}`);

  console.log(
    JSON.stringify(
      {
        ok: true,
        launch: tokenBody.launch_url,
        metrics,
        event: eventBody,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
