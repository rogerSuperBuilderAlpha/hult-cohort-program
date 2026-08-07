/**
 * Export applications + roster to JSON for backup.
 * Usage: node scripts/backup-firestore.mjs [--out=backup-fall26.json]
 */

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COHORT = process.env.COHORT_ID?.trim() || 'fall26';

function loadServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) return JSON.parse(json);
  const accountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
    path.join(__dirname, '../secrets/firebase-service-account.json');
  return JSON.parse(readFileSync(accountPath, 'utf8'));
}

function initDb() {
  if (!getApps().length) initializeApp({ credential: cert(loadServiceAccount()) });
  return getFirestore();
}

function arg(name) {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
}

async function main() {
  const db = initDb();
  const outPath =
    arg('out') ||
    path.join(__dirname, `../backups/firestore-${COHORT}-${new Date().toISOString().slice(0, 10)}.json`);

  const [applications, roster] = await Promise.all([
    db.collection('applications').get(),
    db.collection('roster').doc(COHORT).collection('members').get(),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    cohort: COHORT,
    applications: applications.docs.map((d) => ({ id: d.id, ...d.data() })),
    roster: roster.docs.map((d) => ({ handle: d.id, ...d.data() })),
  };

  writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${applications.size} applications, ${roster.size} roster members → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
