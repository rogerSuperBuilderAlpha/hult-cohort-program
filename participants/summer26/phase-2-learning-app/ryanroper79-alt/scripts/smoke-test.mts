/**
 * E2E: launch JWT → qualify opportunity → qualification.scored (non-heartbeat)
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
      user_id: 'external-smoke-user-1',
      email: 'smoke.external@example.com',
    }),
  });
  const tokenBody = await tokenRes.json();
  if (!tokenRes.ok) throw new Error(JSON.stringify(tokenBody));

  const launchRes = await fetch(tokenBody.launch_url, { redirect: 'manual' });
  const cookie = launchRes.headers.get('set-cookie') || '';
  if (!cookie.includes('bidmanager_session')) throw new Error('launch did not set session cookie');

  const oppsRes = await fetch(`${appUrl}/api/opportunities`, {
    headers: { Cookie: cookie.split(';')[0] },
  });
  const { opportunities } = await oppsRes.json();
  const rfp = opportunities.find((o: { stage: string }) => o.stage === 'rfp');
  if (!rfp) throw new Error('no rfp opportunity in store');

  const qualRes = await fetch(`${appUrl}/api/opportunities/${rfp.id}/qualify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie.split(';')[0] },
    body: JSON.stringify({
      memberCountryEligible: true,
      dimensionScores: {
        relationship_depth: 75,
        mandatory_criteria_fit: 85,
        evidence_coverage: 70,
        competitive_position: 65,
        commercial_value: 70,
        capacity: 80,
      },
    }),
  });
  const qualBody = await qualRes.json();
  if (!qualRes.ok) throw new Error(JSON.stringify(qualBody));

  const metricsRes = await fetch(`${baseUrl}/apps/${appId}/metrics`, {
    headers: { Authorization: `Bearer ${devKey}` },
  });
  const metrics = await metricsRes.json();

  console.log(
    JSON.stringify(
      {
        ok: true,
        launch: tokenBody.launch_url,
        qualified: qualBody.result?.recommendation,
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
