/**
 * Register this learning app with the Ludwitt/Hult developer API.
 * Usage: npm run register-app
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
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
  const baseUrl = (process.env.LUDWITT_API_BASE_URL || 'http://localhost:4000/v1').replace(/\/$/, '');
  const devKey = process.env.LUDWITT_DEVELOPER_KEY || 'prod_key_demo';
  const productionUrl = (process.env.APP_PRODUCTION_URL || 'http://localhost:3000').replace(/\/$/, '');

  const description =
    'cEAL Green RFP Learner reviews won and lost Request for Proposals, extracts strategic win/loss patterns, and trains agents to draft stronger proposals targeting a 10% portfolio win rate.';

  const res = await fetch(`${baseUrl}/developer/apps`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${devKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'cEAL Green RFP Learner',
      description,
      topic: 'RFP strategy / sustainability consulting',
      launch_url: `${productionUrl}/launch`,
      repo_url:
        'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/tree/participants/summer26/phase-2-learning-app/ryanroper79-alt',
      icon_url: `${productionUrl}/icon.png`,
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Registration failed (${res.status}): ${JSON.stringify(body)}`);
  }

  upsertEnv('LUDWITT_APP_ID', body.app_id);
  upsertEnv('LUDWITT_API_KEY', body.api_key);
  upsertEnv('LUDWITT_JWT_SECRET', body.jwt_secret);

  console.log(JSON.stringify({ app_id: body.app_id, launch_url: `${productionUrl}/launch` }, null, 2));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
