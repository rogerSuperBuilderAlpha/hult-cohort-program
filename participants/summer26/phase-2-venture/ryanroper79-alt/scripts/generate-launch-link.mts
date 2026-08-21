/**
 * Generate an authenticated launch URL for one external user (simulates platform launcher).
 * Usage:
 *   npm run generate-launch-link -- --user external-tt-facility-01 --email contact@example.com
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

function parseArgs() {
  const args = process.argv.slice(2);
  let user = '';
  let email = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--user' && args[i + 1]) user = args[++i]!;
    if (args[i] === '--email' && args[i + 1]) email = args[++i]!;
  }
  return { user, email };
}

async function main() {
  loadEnv();
  const { user, email } = parseArgs();
  if (!user || !email) {
    throw new Error('Usage: npm run generate-launch-link -- --user <opaque-id> --email <email>');
  }
  const handle = 'ryanroper79';
  if (user.toLowerCase().includes(handle)) {
    throw new Error(`user id must not contain your handle (${handle}) — use opaque external ids`);
  }

  const baseUrl = (process.env.LUDWITT_API_BASE_URL || 'http://localhost:4000/v1').replace(/\/$/, '');
  const devKey = process.env.LUDWITT_DEVELOPER_KEY || 'prod_key_demo';
  const appId = process.env.LUDWITT_APP_ID?.trim();
  if (!appId) throw new Error('LUDWITT_APP_ID missing — run npm run register-app first');

  const res = await fetch(`${baseUrl}/auth/launch-token`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${devKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, user_id: user, email }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(body));

  const launchUrl = body.launch_url as string;
  console.log(
    JSON.stringify(
      {
        user_id: user,
        email,
        launch_url: launchUrl,
        instructions:
          'Send this link to one external user. They must open it, complete the calculator, and submit. Do not reuse the same user id for different people.',
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
