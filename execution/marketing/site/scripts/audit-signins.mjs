/**
 * One-off audit: find Firebase Auth users who signed in but have no saved
 * application (the fingerprint of a failed sign-up / apply attempt).
 * Cross-references Auth users <-> applications <-> roster.
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
  const { db, auth } = init();

  const appsSnap = await db.collection('applications').get();
  const appByUid = new Map();
  for (const doc of appsSnap.docs) {
    const d = doc.data();
    if (d.firebaseUid) appByUid.set(d.firebaseUid, d);
  }

  const rosterSnap = await db.collection('roster').doc(COHORT).collection('members').get();

  const users = [];
  let nextPageToken;
  do {
    const res = await auth.listUsers(1000, nextPageToken);
    users.push(...res.users);
    nextPageToken = res.pageToken;
  } while (nextPageToken);

  console.log(`\n=== Totals ===`);
  console.log(`  auth users:    ${users.length}`);
  console.log(`  applications:  ${appsSnap.size}`);
  console.log(`  roster:        ${rosterSnap.size}`);

  console.log(`\n=== All Auth users (newest sign-in first) ===`);
  const rows = users
    .map((u) => {
      const gh = u.providerData.find((p) => p.providerId === 'github.com');
      return {
        uid: u.uid,
        displayName: u.displayName ?? gh?.displayName ?? '',
        email: u.email ?? gh?.email ?? '',
        created: u.metadata.creationTime,
        lastSignIn: u.metadata.lastSignInTime,
        ghUid: gh?.uid ?? '',
        hasApp: appByUid.has(u.uid),
      };
    })
    .sort((a, b) => new Date(b.lastSignIn) - new Date(a.lastSignIn));

  for (const r of rows) {
    console.log(
      `  ${r.hasApp ? 'APP ' : 'NONE'} uid=${r.uid} name="${r.displayName}" email=${r.email} ghUid=${r.ghUid} lastSignIn=${r.lastSignIn}`
    );
  }

  const orphans = rows.filter((r) => !r.hasApp);
  console.log(`\n=== Auth users WITHOUT an application: ${orphans.length} ===`);
  for (const r of orphans) {
    console.log(`  uid=${r.uid} name="${r.displayName}" email=${r.email} created=${r.created} lastSignIn=${r.lastSignIn}`);
  }

  console.log(`\n=== Applications by status ===`);
  const byStatus = {};
  for (const doc of appsSnap.docs) {
    const s = doc.data().status ?? 'unknown';
    byStatus[s] = (byStatus[s] ?? 0) + 1;
  }
  console.log(`  ${JSON.stringify(byStatus)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
