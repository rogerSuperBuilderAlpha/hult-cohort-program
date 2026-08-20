/**
 * E2E: launch JWT → calculator_completed → metrics
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

  if (!appId) throw new Error('Run npm run register-app first');

  const tokenRes = await fetch(`${baseUrl}/auth/launch-token`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${devKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: appId,
      user_id: 'external-smoke-user-venture-1',
      email: 'smoke.external.venture@example.com',
    }),
  });
  const tokenBody = await tokenRes.json();
  if (!tokenRes.ok) throw new Error(JSON.stringify(tokenBody));

  const tokenFromApi = new URL(tokenBody.launch_url);
  const launchUrl = `${appUrl}/launch?${tokenFromApi.searchParams.toString()}`;

  const launchRes = await fetch(launchUrl, { redirect: 'manual' });
  const setCookies =
    typeof launchRes.headers.getSetCookie === 'function'
      ? launchRes.headers.getSetCookie()
      : (launchRes.headers.get('set-cookie') || '').split(/,(?=\s*[^;,]+=)/);
  const sessionPair = setCookies
    .map((c) => c.split(';')[0]?.trim())
    .find((c) => c.startsWith('energy_auditor_session='));
  if (!sessionPair) throw new Error('launch did not set session cookie');

  const sessionCookie = sessionPair;

  await fetch(`${appUrl}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
    body: JSON.stringify({ event: 'calculator_started' }),
  });

  const calcRes = await fetch(`${appUrl}/api/calculator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
    body: JSON.stringify({
      jurisdiction: 'jamaica',
      propertyType: 'residential',
      monthlyExpenditureUsd: 250,
      monthlyKwh: 600,
      floorAreaSqm: 120,
      weeklyOperatingHours: 40,
      majorLoads: ['air_conditioning', 'lighting'],
      efficiencyMeasures: [],
      contact: {
        companyName: 'Smoke Test User',
        email: 'smoke.external.venture@example.com',
      },
    }),
  });
  const calcBody = await calcRes.json();
  if (!calcRes.ok) throw new Error(JSON.stringify(calcBody));

  await fetch(`${appUrl}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
    body: JSON.stringify({ event: 'calculator_completed' }),
  });

  const metricsRes = await fetch(`${baseUrl}/apps/${appId}/metrics`, {
    headers: { Authorization: `Bearer ${devKey}` },
  });
  const metrics = await metricsRes.json();

  console.log(
    JSON.stringify(
      {
        ok: true,
        auditReadinessScore: calcBody.result?.auditReadinessScore,
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
