/**
 * End-to-end test: signed pull_request opened webhook → take-home-submitted.
 *
 * Usage (from execution/marketing/site):
 *   GITHUB_WEBHOOK_SECRET=... node scripts/test-take-home-webhook.mjs --handle=preetishreddy
 *   Add --revert to set status back to submitted after the test.
 */

import { createHmac } from 'crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COHORT = process.env.COHORT_ID?.trim() || 'summer26';
const WEBHOOK_URL =
  process.env.WEBHOOK_TEST_URL?.trim() ||
  'https://cohorts.algorithmacy.org/api/github/webhook';
const TAKE_HOME_REPO = 'rogerSuperBuilderAlpha/admissions-task-board-fall26';

function arg(name) {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
}

const handle = arg('handle')?.trim().toLowerCase();
const revert = process.argv.includes('--revert');

if (!handle) {
  console.error('Usage: node scripts/test-take-home-webhook.mjs --handle=<githubHandle> [--revert]');
  process.exit(1);
}

const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();
if (!secret) {
  console.error('Set GITHUB_WEBHOOK_SECRET (must match production).');
  process.exit(1);
}

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

async function getApplicationStatus(db) {
  const snap = await db
    .collection('applications')
    .where('githubHandle', '==', handle)
    .limit(5)
    .get();
  const doc = snap.docs.find((d) => d.data().cohort === COHORT);
  if (!doc) return null;
  return { id: doc.id, ...doc.data() };
}

function signPayload(body) {
  const digest = createHmac('sha256', secret).update(body).digest('hex');
  return `sha256=${digest}`;
}

async function postWebhook(prNumber) {
  const payload = {
    action: 'opened',
    pull_request: {
      number: prNumber,
      html_url: `https://github.com/${TAKE_HOME_REPO}/pull/${prNumber}`,
      user: { login: handle },
    },
    repository: { full_name: TAKE_HOME_REPO },
  };
  const body = JSON.stringify(payload);
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': 'pull_request',
      'X-Hub-Signature-256': signPayload(body),
    },
    body,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function main() {
  const db = initDb();
  const before = await getApplicationStatus(db);
  if (!before) {
    console.error(`No application for @${handle} in cohort ${COHORT}`);
    process.exit(1);
  }

  console.log(`Before: status=${before.status} id=${before.id}`);

  const prNumber = 999001 + Math.floor(Math.random() * 9000);
  console.log(`POST ${WEBHOOK_URL} (simulated PR #${prNumber} by @${handle})`);

  const { status, json } = await postWebhook(prNumber);
  console.log(`HTTP ${status}`, JSON.stringify(json));

  if (status !== 200) {
    console.error('Webhook request failed.');
    process.exit(1);
  }
  if (!json.takeHome?.ingested) {
    console.error('Webhook did not ingest take-home PR:', json.takeHome?.reason ?? json);
    process.exit(1);
  }

  const after = await getApplicationStatus(db);
  console.log(`After:  status=${after.status} takeHomePrUrl=${after.takeHomePrUrl ?? '—'}`);

  if (after.status !== 'take-home-submitted') {
    console.error('Expected status take-home-submitted');
    process.exit(1);
  }

  console.log('PASS — take-home webhook ingestion works.');

  if (revert) {
    await db.collection('applications').doc(before.id).set(
      {
        status: 'submitted',
        updatedAt: new Date(),
        takeHomeSubmittedAt: null,
        takeHomePrUrl: null,
        takeHomePrNumber: null,
      },
      { merge: true }
    );
    console.log(`Reverted @${handle} to submitted (--revert).`);
  } else {
    console.log('Left status as take-home-submitted (pass --revert to undo).');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
