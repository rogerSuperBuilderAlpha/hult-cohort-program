/**
 * Generate batch Ludwitt launch URLs for a live session (metrics gate).
 * Usage:
 *   npm run generate-launch-links-batch -- --count 30
 *   npm run generate-launch-links-batch -- --count 30 --prefix external-ceal50
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

function parseArgs() {
  const args = process.argv.slice(2);
  let count = 30;
  let prefix = 'external-ceal50';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) count = parseInt(args[++i]!, 10);
    if (args[i] === '--prefix' && args[i + 1]) prefix = args[++i]!;
  }
  if (!Number.isFinite(count) || count < 1 || count > 100) {
    throw new Error('--count must be 1–100');
  }
  if (/ryanroper79/i.test(prefix)) {
    throw new Error('prefix must not contain your cohort handle');
  }
  return { count, prefix };
}

async function main() {
  loadEnv();
  const { count, prefix } = parseArgs();
  const baseUrl = (process.env.LUDWITT_API_BASE_URL || 'http://localhost:4000/v1').replace(/\/$/, '');
  const devKey = process.env.LUDWITT_DEVELOPER_KEY || 'prod_key_demo';
  const appId = process.env.LUDWITT_APP_ID?.trim();
  if (!appId) throw new Error('LUDWITT_APP_ID missing — run npm run register-app against your Render API first');

  const links: { user_id: string; email: string; launch_url: string; expires_at: string }[] = [];
  const tokenTtlHours = parseInt(process.env.LAUNCH_TOKEN_HOURS || '48', 10);

  for (let i = 1; i <= count; i++) {
    const user_id = `${prefix}-${String(i).padStart(2, '0')}`;
    const email = `${user_id}@external.cealgreen.demo`;
    const res = await fetch(`${baseUrl}/auth/launch-token`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${devKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, user_id, email }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(`Token failed for ${user_id}: ${JSON.stringify(body)}`);
    const expiresAt = new Date(Date.now() + tokenTtlHours * 60 * 60 * 1000).toISOString();
    links.push({ user_id, email, launch_url: body.launch_url as string, expires_at: expiresAt });
  }

  const outDir = path.join(root, 'evidence');
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const outPath = path.join(outDir, `launch-links-${stamp}.json`);
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        token_ttl_hours: tokenTtlHours,
        count: links.length,
        links,
      },
      null,
      2
    ) + '\n',
    'utf8'
  );

  console.log(`Wrote ${links.length} launch links (${tokenTtlHours}h validity) → ${outPath}\n`);
  console.log('Share one unique link per external participant. Each must complete the calculator.\n');
  for (const l of links.slice(0, 5)) {
    console.log(`${l.user_id}: ${l.launch_url}`);
  }
  if (links.length > 5) console.log(`… and ${links.length - 5} more in ${outPath}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
