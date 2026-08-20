/**
 * Merge metrics snapshot into SUBMISSION_PR.md for GitHub PR body.
 * Usage: npm run generate-pr-body
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function latestSnapshot(): string | null {
  const dir = path.join(root, 'evidence');
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir)
    .filter((f) => f.startsWith('metrics-snapshot-') && f.endsWith('.json'))
    .sort();
  return files.length ? path.join(dir, files[files.length - 1]!) : null;
}

function main() {
  const snapPath = latestSnapshot();
  if (!snapPath) throw new Error('No evidence/metrics-snapshot-*.json — run npm run export-metrics first');

  const snap = JSON.parse(readFileSync(snapPath, 'utf8')) as {
    snapshot_timestamp: string;
    metrics_source: string;
    application_id: string;
    application_version: string;
    qualification_rule: string;
    aggregate_qualified_user_count: number;
    production_url?: string;
  };

  const prPath = path.join(root, 'SUBMISSION_PR.md');
  let body = readFileSync(prPath, 'utf8');

  body = body.replace(
    /- Snapshot date: .*/,
    `- Snapshot date: ${snap.snapshot_timestamp}`
  );
  body = body.replace(
    /- Qualified external users: .*/,
    `- Qualified external users: ${snap.aggregate_qualified_user_count}`
  );
  body = body.replace(
    /- Evidence path: .*/,
    `- Evidence path: \`participants/summer26/phase-2-venture/ryanroper79-alt/evidence/${path.basename(snapPath)}\``
  );
  body = body.replace(
    /_New venture registration — set after .*/,
    snap.application_id
  );
  body = body.replace(
    /- Production URL: .*/,
    `- Production URL: ${snap.production_url || 'https://caribbeanenergyauditor.vercel.app'}`
  );
  body = body.replace(
    /- Metrics source: .*/,
    `- Metrics source: ${snap.metrics_source}`
  );

  writeFileSync(prPath, body, 'utf8');
  console.log(JSON.stringify({ updated: prPath, snapshot: path.basename(snapPath), qualified_users: snap.aggregate_qualified_user_count }, null, 2));
}

main();
