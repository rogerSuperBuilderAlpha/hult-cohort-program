/**
 * Staff admissions CLI — list applications, inspect auth orphans, delete user reset.
 *
 * Usage:
 *   node scripts/admissions.mjs list [--status=submitted]
 *   node scripts/admissions.mjs audit-signins
 *   node scripts/admissions.mjs delete-user --handle=<h> [--uid=<u>] [--confirm]
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

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

function init() {
  if (!getApps().length) initializeApp({ credential: cert(loadServiceAccount()) });
  return { db: getFirestore(), auth: getAuth() };
}

function arg(name) {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
}

async function cmdList(db) {
  const statusFilter = arg('status');
  const snap = await db.collection('applications').get();
  const rows = snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((row) => row.cohort === COHORT)
    .filter((row) => !statusFilter || row.status === statusFilter)
    .sort((a, b) => String(b.submittedAt?.toDate?.() ?? '').localeCompare(String(a.submittedAt?.toDate?.() ?? '')));

  console.log(`Applications (${COHORT}): ${rows.length}`);
  for (const row of rows) {
    console.log(
      `  ${row.status?.padEnd(18)} @${row.githubHandle} ${row.firstName} ${row.lastName} <${row.email}> id=${row.id}`
    );
  }
}

async function cmdAuditSignins(db, auth) {
  const appsSnap = await db.collection('applications').get();
  const appByUid = new Map();
  for (const doc of appsSnap.docs) {
    const d = doc.data();
    if (d.firebaseUid) appByUid.set(d.firebaseUid, d);
  }

  const users = [];
  let nextPageToken;
  do {
    const res = await auth.listUsers(1000, nextPageToken);
    users.push(...res.users);
    nextPageToken = res.pageToken;
  } while (nextPageToken);

  const orphans = users.filter((u) => !appByUid.has(u.uid));
  console.log(`Auth users: ${users.length}, applications: ${appsSnap.size}, orphans: ${orphans.length}`);
  for (const u of orphans) {
    console.log(`  ORPHAN uid=${u.uid} email=${u.email ?? ''} lastSignIn=${u.metadata.lastSignInTime}`);
  }
}

async function cmdDeleteUser(db, auth) {
  const handle = arg('handle');
  const uid = arg('uid');
  const confirm = process.argv.includes('--confirm');
  if (!handle) throw new Error('Pass --handle=<githubHandle>');

  console.log(`delete-user handle=${handle} uid=${uid ?? '(none)'} mode=${confirm ? 'DELETE' : 'DRY RUN'}`);
  await import('./delete-user.mjs');
  // delete-user.mjs is standalone; re-exec for safety
  const { spawnSync } = await import('child_process');
  const args = ['scripts/delete-user.mjs', `--handle=${handle}`];
  if (uid) args.push(`--uid=${uid}`);
  if (confirm) args.push('--confirm');
  const result = spawnSync('node', args, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  process.exit(result.status ?? 1);
}

async function main() {
  const command = process.argv[2];
  const { db, auth } = init();

  switch (command) {
    case 'list':
      await cmdList(db);
      break;
    case 'audit-signins':
      await cmdAuditSignins(db, auth);
      break;
    case 'delete-user':
      await cmdDeleteUser(db, auth);
      break;
    default:
      console.error('Usage: admissions.mjs list|audit-signins|delete-user');
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
