/**
 * Staff admissions CLI — list, status updates, roster management.
 *
 * Usage:
 *   node scripts/admissions.mjs list [--status=submitted]
 *   node scripts/admissions.mjs set-status --handle=<h>|--email=<e> --status=<s> [--confirm]
 *   node scripts/admissions.mjs admit --handle=<h>|--email=<e> [--display-name=...] [--campus=...] [--confirm]
 *   node scripts/admissions.mjs deactivate --handle=<h> [--confirm]
 *   node scripts/admissions.mjs delete-user --handle=<h> [--uid=<u>] [--confirm]
 *
 * Sign-in audit: use scripts/audit-signins.mjs (richer than legacy subcommand).
 *
 * Writes require --confirm (dry-run by default).
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COHORT = process.env.COHORT_ID?.trim() || 'fall26';

const VALID_STATUSES = [
  'submitted',
  'take-home-sent',
  'take-home-submitted',
  'admitted',
  'waitlisted',
  'rejected',
];

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

function confirmFlag() {
  return process.argv.includes('--confirm');
}

function normalizeHandle(value) {
  return value?.trim().toLowerCase() ?? '';
}

async function findApplicationDoc(db, { handle, email }) {
  if (handle) {
    const h = normalizeHandle(handle);
    const snap = await db.collection('applications').where('githubHandle', '==', h).limit(10).get();
    const doc = snap.docs.find((d) => d.data().cohort === COHORT);
    if (doc) return doc;
  }
  if (email) {
    const e = email.trim().toLowerCase();
    const snap = await db.collection('applications').where('email', '==', e).limit(10).get();
    const doc = snap.docs.find((d) => d.data().cohort === COHORT);
    if (doc) return doc;
  }
  return null;
}

async function cmdList(db) {
  const statusFilter = arg('status');
  const snap = await db.collection('applications').get();
  const rows = snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((row) => row.cohort === COHORT)
    .filter((row) => !statusFilter || row.status === statusFilter)
    .sort((a, b) =>
      String(b.submittedAt?.toDate?.() ?? '').localeCompare(String(a.submittedAt?.toDate?.() ?? ''))
    );

  console.log(`Applications (${COHORT}): ${rows.length}`);
  for (const row of rows) {
    console.log(
      `  ${row.status?.padEnd(18)} @${row.githubHandle} ${row.firstName} ${row.lastName} <${row.email}> id=${row.id}`
    );
  }
}

async function cmdSetStatus(db) {
  const handle = arg('handle');
  const email = arg('email');
  const status = arg('status');
  const confirm = confirmFlag();

  if (!handle && !email) throw new Error('Pass --handle=<githubHandle> or --email=<email>');
  if (!status || !VALID_STATUSES.includes(status)) {
    throw new Error(`Pass --status= one of: ${VALID_STATUSES.join(', ')}`);
  }

  const doc = await findApplicationDoc(db, { handle, email });
  if (!doc) {
    throw new Error(`No application found for cohort ${COHORT} (${handle ? `@${handle}` : email})`);
  }

  const data = doc.data();
  console.log(`set-status mode=${confirm ? 'WRITE' : 'DRY RUN'}`);
  console.log(`  application id=${doc.id}`);
  console.log(`  @${data.githubHandle} <${data.email}>`);
  console.log(`  status: ${data.status} → ${status}`);

  if (!confirm) {
    console.log('\nRe-run with --confirm to apply.');
    return;
  }

  await doc.ref.update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('\nApplication status updated.');
}

async function cmdAdmit(db) {
  const handle = arg('handle');
  const email = arg('email');
  const displayName = arg('display-name');
  const campusOverride = arg('campus');
  const confirm = confirmFlag();

  if (!handle && !email) throw new Error('Pass --handle=<githubHandle> or --email=<email>');

  const doc = await findApplicationDoc(db, { handle, email });
  if (!doc) {
    throw new Error(`No application found for cohort ${COHORT} (${handle ? `@${handle}` : email})`);
  }

  const data = doc.data();
  const githubHandle = normalizeHandle(data.githubHandle);
  const rosterRef = db.collection('roster').doc(COHORT).collection('members').doc(githubHandle);
  const rosterDoc = await rosterRef.get();
  const resolvedDisplayName =
    displayName?.trim() || `${data.firstName} ${data.lastName}`.trim();
  const resolvedCampus = campusOverride?.trim() || data.campus || 'online';

  console.log(`admit mode=${confirm ? 'WRITE' : 'DRY RUN'}`);
  console.log(`  application id=${doc.id}`);
  console.log(`  @${githubHandle} <${data.email}>`);
  console.log(`  application status: ${data.status} → admitted`);
  console.log(`  roster: ${rosterDoc.exists ? 'update existing member' : 'create new member'}`);
  console.log(`  displayName=${resolvedDisplayName}`);
  console.log(`  campus=${resolvedCampus}`);
  console.log(`  active=true`);

  if (!confirm) {
    console.log('\nRe-run with --confirm to apply.');
    return;
  }

  await doc.ref.update({
    status: 'admitted',
    updatedAt: FieldValue.serverTimestamp(),
  });

  await rosterRef.set(
    {
      githubHandle,
      email: data.email,
      displayName: resolvedDisplayName,
      campus: resolvedCampus,
      roles: ['participant'],
      active: true,
      enrolledAt: rosterDoc.exists ? rosterDoc.data()?.enrolledAt ?? FieldValue.serverTimestamp() : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log('\nApplicant admitted and roster member active.');
}

async function cmdDeactivate(db) {
  const handle = arg('handle');
  const confirm = confirmFlag();

  if (!handle) throw new Error('Pass --handle=<githubHandle>');

  const githubHandle = normalizeHandle(handle);
  const rosterRef = db.collection('roster').doc(COHORT).collection('members').doc(githubHandle);
  const rosterDoc = await rosterRef.get();

  if (!rosterDoc.exists) {
    throw new Error(`No roster member @${githubHandle} in cohort ${COHORT}`);
  }

  console.log(`deactivate mode=${confirm ? 'WRITE' : 'DRY RUN'}`);
  console.log(`  @${githubHandle}`);
  console.log(`  active: ${rosterDoc.data()?.active !== false} → false`);

  if (!confirm) {
    console.log('\nRe-run with --confirm to apply.');
    return;
  }

  await rosterRef.set(
    {
      active: false,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log('\nRoster member deactivated.');
}

async function cmdDeleteUser() {
  const handle = arg('handle');
  const uid = arg('uid');
  const confirm = confirmFlag();
  if (!handle) throw new Error('Pass --handle=<githubHandle>');

  console.log(`delete-user handle=${handle} uid=${uid ?? '(none)'} mode=${confirm ? 'DELETE' : 'DRY RUN'}`);
  const { spawnSync } = await import('child_process');
  const args = ['scripts/delete-user.mjs', `--handle=${handle}`];
  if (uid) args.push(`--uid=${uid}`);
  if (confirm) args.push('--confirm');
  const result = spawnSync('node', args, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  process.exit(result.status ?? 1);
}

async function main() {
  const command = process.argv[2];
  const { db } = init();

  switch (command) {
    case 'list':
      await cmdList(db);
      break;
    case 'set-status':
      await cmdSetStatus(db);
      break;
    case 'admit':
      await cmdAdmit(db);
      break;
    case 'deactivate':
      await cmdDeactivate(db);
      break;
    case 'delete-user':
      await cmdDeleteUser();
      break;
    default:
      console.error('Usage: admissions.mjs list|set-status|admit|deactivate|delete-user');
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
