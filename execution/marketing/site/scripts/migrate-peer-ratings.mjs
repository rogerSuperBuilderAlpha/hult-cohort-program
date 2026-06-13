/**
 * Migrate peerReviews → peerRatings (all migrated as thumbs up).
 * Usage: node scripts/migrate-peer-ratings.mjs
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

async function main() {
  const db = initDb();
  const legacySnap = await db
    .collection('peerReviews')
    .doc(COHORT)
    .collection('projects')
    .get();

  let migrated = 0;
  for (const projectDoc of legacySnap.docs) {
    const reviewersSnap = await projectDoc.ref.collection('reviewers').get();
    for (const reviewerDoc of reviewersSnap.docs) {
      const handles = reviewerDoc.data().revieweeHandles ?? [];
      const ratings = Object.fromEntries(handles.map((h) => [h, 'up']));
      await db
        .collection('peerRatings')
        .doc(COHORT)
        .collection('projects')
        .doc(projectDoc.id)
        .collection('voters')
        .doc(reviewerDoc.id)
        .set({ ratings, migratedFrom: 'peerReviews', updatedAt: new Date() }, { merge: true });
      migrated += 1;
      console.log(`Migrated @${reviewerDoc.id} on ${projectDoc.id} (${handles.length} ratings)`);
    }
  }
  console.log(`Done. ${migrated} voter docs migrated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
