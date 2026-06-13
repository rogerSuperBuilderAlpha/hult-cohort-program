/**
 * Seed peer review progress for demo / testing.
 *
 * Usage:
 *   node scripts/seed-peer-reviews.mjs --reviewer=rogersuperbuilderalpha --project=phase-1-project-1 --count=12
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COHORT = 'fall26';

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

function parseArgs() {
  const reviewer = process.argv.find((a) => a.startsWith('--reviewer='))?.split('=')[1];
  const project = process.argv.find((a) => a.startsWith('--project='))?.split('=')[1] ?? 'phase-1-project-1';
  const count = Number(process.argv.find((a) => a.startsWith('--count='))?.split('=')[1] ?? 12);
  if (!reviewer) throw new Error('Pass --reviewer=handle');
  return { reviewer, project, count };
}

async function main() {
  const { reviewer, project, count } = parseArgs();
  const db = initDb();

  const entriesSnap = await db
    .collection('submissions')
    .doc(COHORT)
    .collection('projects')
    .doc(project)
    .collection('entries')
    .where('merged', '==', true)
    .get();

  const peers = entriesSnap.docs
    .map((d) => d.id)
    .filter((h) => h !== reviewer)
    .sort()
    .slice(0, count);

  await db
    .collection('peerReviews')
    .doc(COHORT)
    .collection('projects')
    .doc(project)
    .collection('reviewers')
    .doc(reviewer)
    .set({
      revieweeHandles: peers,
      updatedAt: FieldValue.serverTimestamp(),
      demoSeed: true,
    });

  console.log(`Set ${peers.length} peer reviews for @${reviewer} on ${project}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
