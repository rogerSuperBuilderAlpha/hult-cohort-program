/**
 * Register venture app and print Vercel env checklist (secrets written to .env.local only).
 * Usage: npm run setup-production
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

function upsertEnv(key: string, value: string) {
  const lines = existsSync(envPath) ? readFileSync(envPath, 'utf8').split('\n') : [];
  const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
  const entry = `${key}=${value}`;
  if (idx >= 0) lines[idx] = entry;
  else lines.push(entry);
  writeFileSync(envPath, lines.filter(Boolean).join('\n') + '\n', 'utf8');
}

async function main() {
  loadEnv();

  const productionUrl = (process.env.APP_PRODUCTION_URL || 'https://caribbeanenergyauditor.vercel.app').replace(/\/$/, '');
  upsertEnv('APP_PRODUCTION_URL', productionUrl);
  upsertEnv('NEXT_PUBLIC_APP_VERSION', process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0');

  if (!process.env.LUDWITT_API_BASE_URL) {
    upsertEnv('LUDWITT_API_BASE_URL', 'http://localhost:4000/v1');
  }
  if (!process.env.LUDWITT_DEVELOPER_KEY) {
    upsertEnv('LUDWITT_DEVELOPER_KEY', 'prod_key_demo');
  }

  console.log('Step 1/3 — Registering venture app with Ludwitt…');
  console.log(`  APP_PRODUCTION_URL=${productionUrl}`);
  console.log(`  LUDWITT_API_BASE_URL=${process.env.LUDWITT_API_BASE_URL}`);

  execSync('npm run register-app', { cwd: root, stdio: 'inherit' });

  loadEnv();
  const appId = process.env.LUDWITT_APP_ID?.trim();
  if (!appId) throw new Error('Registration did not set LUDWITT_APP_ID');

  const checklistPath = path.join(root, 'vercel-env-checklist.txt');
  const checklist = `
VERCEL ENV CHECKLIST — cEAL Green Energy Auditor
=================================================
Project: energyauditor (or your Vercel project name)
Root Directory: participants/summer26/phase-2-venture/ryanroper79-alt
Production Branch: participants/summer26/phase-2-venture/ryanroper79-alt

Paste these in Vercel → Settings → Environment Variables → Production:

LUDWITT_APP_ID=${appId}
LUDWITT_JWT_SECRET=<copy from .env.local — do not commit>
LUDWITT_API_KEY=<copy from .env.local — do not commit>
LUDWITT_API_BASE_URL=${process.env.LUDWITT_API_BASE_URL}
APP_PRODUCTION_URL=${productionUrl}
NEXT_PUBLIC_APP_VERSION=${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}

Launch URL for platform listing:
${productionUrl}/launch

After saving env vars → Redeploy → run: npm run smoke-test
`;

  writeFileSync(checklistPath, checklist.trim() + '\n', 'utf8');
  console.log('\nStep 2/3 — Wrote Vercel checklist (local only): vercel-env-checklist.txt');
  console.log('Step 3/3 — Open that file and paste values into Vercel dashboard.\n');
  console.log(`Registered app_id: ${appId}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
