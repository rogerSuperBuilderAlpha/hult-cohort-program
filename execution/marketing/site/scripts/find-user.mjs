/**
 * One-off discovery: locate a user across applications, roster, and Firebase Auth.
 *
 * Usage:
 *   node scripts/find-user.mjs "Roger Hunt"
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COHORT = 'fall26';

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

async function main() {
  const needle = (process.argv[2] || 'Roger Hunt').toLowerCase();
  const { db, auth } = init();

  console.log(`\n=== applications (matching "${needle}") ===`);
  const appsSnap = await db.collection('applications').get();
  console.log(`total applications: ${appsSnap.size}`);
  for (const doc of appsSnap.docs) {
    const d = doc.data();
    const full = `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim().toLowerCase();
    const hay = `${full} ${d.githubHandle ?? ''} ${d.email ?? ''}`.toLowerCase();
    if (hay.includes(needle) || needle.split(' ').every((p) => hay.includes(p))) {
      console.log(`  docId=${doc.id}`);
      console.log(`    firstName=${d.firstName} lastName=${d.lastName}`);
      console.log(`    githubHandle=${d.githubHandle} email=${d.email} status=${d.status}`);
      console.log(`    firebaseUid=${d.firebaseUid} githubOAuthUid=${d.githubOAuthUid}`);
    }
  }

  console.log(`\n=== roster/${COHORT}/members ===`);
  const rosterSnap = await db.collection('roster').doc(COHORT).collection('members').get();
  console.log(`total roster members: ${rosterSnap.size}`);
  for (const doc of rosterSnap.docs) {
    const d = doc.data();
    const hay = `${doc.id} ${d.firstName ?? ''} ${d.lastName ?? ''} ${d.name ?? ''} ${d.email ?? ''}`.toLowerCase();
    if (hay.includes(needle) || needle.split(' ').every((p) => hay.includes(p))) {
      console.log(`  memberId=${doc.id} data=${JSON.stringify(d)}`);
    }
  }

  console.log(`\n=== Firebase Auth users (matching "${needle}") ===`);
  let nextPageToken;
  let total = 0;
  do {
    const res = await auth.listUsers(1000, nextPageToken);
    total += res.users.length;
    for (const u of res.users) {
      const providerNames = u.providerData.map((p) => `${p.providerId}:${p.displayName ?? ''}:${p.email ?? ''}`).join(' | ');
      const hay = `${u.displayName ?? ''} ${u.email ?? ''} ${providerNames}`.toLowerCase();
      if (hay.includes(needle) || needle.split(' ').every((p) => hay.includes(p))) {
        console.log(`  uid=${u.uid} displayName=${u.displayName} email=${u.email}`);
        console.log(`    providers=${providerNames}`);
      }
    }
    nextPageToken = res.pageToken;
  } while (nextPageToken);
  console.log(`total auth users: ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
