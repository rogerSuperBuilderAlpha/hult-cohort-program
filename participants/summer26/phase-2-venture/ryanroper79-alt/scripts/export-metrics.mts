/**
 * Export sanitized metrics snapshot from Ludwitt/Hult API.
 * Run: npm run export-metrics
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
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
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

  if (!appId) throw new Error('LUDWITT_APP_ID required');

  const metricsRes = await fetch(`${baseUrl}/apps/${appId}/metrics`, {
    headers: { Authorization: `Bearer ${devKey}` },
  });
  const metrics = await metricsRes.json();
  if (!metricsRes.ok) throw new Error(JSON.stringify(metrics));

  const snapshot = {
    snapshot_timestamp: new Date().toISOString(),
    metrics_source: 'Ludwitt/Hult reference API',
    application_id: appId,
    application_version: appVersion,
    qualification_rule:
      'Authenticated opaque platform user ID with calculator_completed event; excludes cohort handle matches, duplicates and test accounts per platform blocklist',
    aggregate_qualified_user_count: metrics.qualified_users ?? 0,
    aggregate_unique_user_count: metrics.unique_users ?? 0,
    query_method: `GET ${baseUrl}/apps/${appId}/metrics with developer API key`,
    excluded_accounts_note:
      'Platform blocklist excludes student handle and designated test user IDs; duplicate emails deduped by platform',
    privacy: 'Snapshot contains no names, emails, or utility account data',
    production_url: process.env.APP_PRODUCTION_URL || 'https://caribbeanenergyauditor.vercel.app',
  };

  const prodUrl = snapshot.production_url;
  if (/localhost|127\.0\.0\.1/i.test(prodUrl)) {
    console.warn('WARN: production_url is local — do not commit this snapshot to the public submission.');
  }
  if (snapshot.aggregate_qualified_user_count < 25) {
    console.warn(
      `WARN: qualified_users=${snapshot.aggregate_qualified_user_count} — need ≥25 (target 30+) before PR.`
    );
  }

  const outDir = path.join(root, 'evidence');
  mkdirSync(outDir, { recursive: true });
  const stamp = snapshot.snapshot_timestamp.slice(0, 10);
  const outPath = path.join(outDir, `metrics-snapshot-${stamp}.json`);
  writeFileSync(outPath, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({ written: outPath, snapshot }, null, 2));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
