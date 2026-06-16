/**
 * One-off staff op: fully delete a participant's platform data + Firebase Auth user
 * so they can re-apply from scratch. Mirrors lib/account-server.ts deletion scope.
 *
 * Usage:
 *   node scripts/delete-user.mjs --handle=rogersuperbuilderalpha --uid=28ttWJSeN5QJJgnhlaCoylFB5gS2
 *   node scripts/delete-user.mjs --handle=<h> --uid=<u> --confirm   (actually deletes)
 *
 * Without --confirm it runs a dry run (prints what would be deleted).
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COHORT = 'fall26';

// Mirrors programProjects slugs in content/program.ts
const PROJECT_SLUGS = [
  'onboarding',
  'phase-1-project-1',
  'phase-1-project-2',
  'phase-1-project-3',
  'phase-1-unification',
  'phase-2-learning-app',
  'phase-2-venture',
  'phase-2-open-source',
];

function loadServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) return JSON.parse(json);
  const accountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
    path.join(__dirname, '../secrets/firebase-service-account.json');
  const resolved = path.isAbsolute(accountPath)
    ? accountPath
    : path.join(__dirname, '..', accountPath);
  return JSON.parse(readFileSync(resolved, 'utf8'));
}

function init() {
  if (!getApps().length) initializeApp({ credential: cert(loadServiceAccount()) });
  return { db: getFirestore(), auth: getAuth() };
}

function arg(name) {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
}

async function main() {
  const handle = arg('handle');
  const uid = arg('uid');
  const confirm = process.argv.includes('--confirm');
  if (!handle) throw new Error('Pass --handle=<githubHandle>');

  const { db, auth } = init();

  console.log(`\n=== Target ===`);
  console.log(`  handle=${handle}`);
  console.log(`  uid=${uid ?? '(none)'}`);
  console.log(`  mode=${confirm ? 'DELETE' : 'DRY RUN'}`);

  // Print matched application(s) for confirmation
  const appSnap = await db.collection('applications').where('githubHandle', '==', handle).get();
  console.log(`\n=== applications (githubHandle == ${handle}): ${appSnap.size} ===`);
  for (const doc of appSnap.docs) {
    const d = doc.data();
    console.log(`  docId=${doc.id} name=${d.firstName} ${d.lastName} email=${d.email} status=${d.status} firebaseUid=${d.firebaseUid}`);
  }

  const result = {
    applicationsDeleted: 0,
    rosterRemoved: false,
    submissionsDeleted: 0,
    writtenReviewsDeleted: 0,
    ratingsDeleted: 0,
    authUserDeleted: false,
  };

  if (confirm) await Promise.all(appSnap.docs.map((doc) => doc.ref.delete()));
  result.applicationsDeleted = appSnap.size;

  // roster
  const rosterRef = db.collection('roster').doc(COHORT).collection('members').doc(handle);
  const rosterDoc = await rosterRef.get();
  if (rosterDoc.exists) {
    console.log(`\n=== roster member exists: ${JSON.stringify(rosterDoc.data())} ===`);
    if (confirm) await rosterRef.delete();
    result.rosterRemoved = true;
  }

  // per-project: submissions, written reviews, ratings
  for (const slug of PROJECT_SLUGS) {
    const submissionRef = db
      .collection('submissions').doc(COHORT)
      .collection('projects').doc(slug)
      .collection('entries').doc(handle);
    const submissionDoc = await submissionRef.get();
    if (submissionDoc.exists) {
      console.log(`  submission entry: ${slug}`);
      if (confirm) await submissionRef.delete();
      result.submissionsDeleted += 1;
    }

    const writtenVoterRef = db
      .collection('peerWrittenReviews').doc(COHORT)
      .collection('projects').doc(slug)
      .collection('voters').doc(handle);
    const writtenEntries = await writtenVoterRef.collection('entries').get();
    if (!writtenEntries.empty) {
      console.log(`  written review entries: ${slug} (${writtenEntries.size})`);
      if (confirm) await Promise.all(writtenEntries.docs.map((d) => d.ref.delete()));
      result.writtenReviewsDeleted += writtenEntries.size;
    }
    const writtenVoterDoc = await writtenVoterRef.get();
    if (writtenVoterDoc.exists && confirm) await writtenVoterRef.delete();

    const ratingsRef = db
      .collection('peerRatings').doc(COHORT)
      .collection('projects').doc(slug)
      .collection('voters').doc(handle);
    const ratingsDoc = await ratingsRef.get();
    if (ratingsDoc.exists) {
      const ratings = ratingsDoc.data()?.ratings ?? {};
      console.log(`  ratings authored: ${slug} (${Object.keys(ratings).length})`);
      result.ratingsDeleted += Object.keys(ratings).length;
      if (confirm) await ratingsRef.delete();
    }
  }

  // auth user
  if (uid) {
    try {
      const u = await auth.getUser(uid);
      console.log(`\n=== auth user: uid=${u.uid} displayName=${u.displayName} email=${u.email} ===`);
      if (confirm) {
        await auth.deleteUser(uid);
        result.authUserDeleted = true;
      }
    } catch (err) {
      const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
      if (code === 'auth/user-not-found') console.log(`  auth user ${uid} not found (already gone)`);
      else throw err;
    }
  }

  console.log(`\n=== ${confirm ? 'DELETED' : 'WOULD DELETE'} ===`);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
