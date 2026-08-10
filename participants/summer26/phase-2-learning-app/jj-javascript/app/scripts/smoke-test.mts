/**
 * Production smoke: demo-launch → session cookie → challenge events → metrics
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env.local');

function loadEnv() {
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim().replace(/^\uFEFF/, '');
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

function parseSetCookie(raw: string | null): { name: string; value: string } | null {
  if (!raw) return null;
  const first = raw.split(',')[0]?.trim();
  const eq = first?.indexOf('=');
  if (!eq || eq <= 0) return null;
  return { name: first.slice(0, eq), value: first.slice(eq + 1) };
}

async function main() {
  loadEnv();
  const baseUrl = (process.env.LUDWITT_API_BASE_URL || 'http://localhost:4000/v1').replace(/\/$/, '');
  const devKey = process.env.LUDWITT_DEVELOPER_KEY || 'prod_key_demo';
  const appId = process.env.LUDWITT_APP_ID?.trim();
  const appUrl = (process.env.APP_PRODUCTION_URL || 'http://localhost:3000').replace(/\/$/, '');

  if (!appId) throw new Error('Run npm run register-app first');

  // Demo launch path (what real visitors use)
  const demoRes = await fetch(`${appUrl}/api/demo-launch`, { method: 'POST', redirect: 'manual' });
  if (demoRes.status !== 303) throw new Error(`demo-launch expected 303, got ${demoRes.status}`);
  const launchUrl = demoRes.headers.get('location');
  if (!launchUrl) throw new Error('demo-launch missing Location header');

  const launchRes = await fetch(launchUrl, { redirect: 'manual' });
  const cookieRaw = launchRes.headers.get('set-cookie') || '';
  if (!cookieRaw.includes('git_arcade_session')) throw new Error('launch did not set session cookie');

  const parsed = parseSetCookie(cookieRaw);
  if (!parsed) throw new Error('could not parse session cookie');
  const cookieHeader = `${parsed.name}=${parsed.value}`;

  const submitRes = await fetch(`${appUrl}/api/challenge/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      challengeId: 'first-commit',
      commands: ['git init', 'git add notes.txt', 'git commit -m "Initial commit"'],
      elapsedSec: 30,
    }),
  });
  const submitBody = await submitRes.json();
  if (!submitRes.ok || !submitBody.passed) throw new Error(JSON.stringify(submitBody));

  const metricsRes = await fetch(`${baseUrl}/apps/${appId}/metrics`, {
    headers: { Authorization: `Bearer ${devKey}` },
  });
  const metrics = await metricsRes.json();
  if (!metricsRes.ok) throw new Error(JSON.stringify(metrics));

  console.log(
    JSON.stringify(
      {
        ok: true,
        demoLaunch: { status: demoRes.status, launchUrl },
        submit: submitBody,
        metrics,
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
