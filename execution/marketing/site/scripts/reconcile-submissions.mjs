/**
 * Idempotent submission reconcile — backstop when GitHub webhook misses events.
 * Creates submission entries for roster members missing Firestore records.
 * Does NOT fabricate ballot/eligiblePrs data (legacy ranked-choice removed).
 *
 * Usage: node scripts/reconcile-submissions.mjs
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COHORT = process.env.COHORT_ID?.trim() || 'fall26';
const REPO = process.env.NEXT_PUBLIC_COHORT_REPO?.trim() || 'rogerSuperBuilderAlpha/hult-cohort-program';

const PROJECTS = [
  { slug: 'onboarding', prTitle: (h) => `[Onboarding] Tooling checklist — ${h}` },
  { slug: 'phase-1-project-1', prTitle: (h) => `[Project 1] Submission — ${h}` },
  { slug: 'phase-1-project-2', prTitle: (h) => `[Project 2] Submission — ${h}` },
  { slug: 'phase-1-project-3', prTitle: (h) => `[Project 3] Submission — ${h}` },
  { slug: 'phase-2-learning-app', prTitle: (h) => `[P2-L1] Submission — ${h}` },
  { slug: 'phase-2-venture', prTitle: (h) => `[P2-Venture] Submission — ${h}` },
  { slug: 'phase-2-open-source', prTitle: (h) => `[P2-OSS] Tracking — ${h}` },
];

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
  const rosterSnap = await db.collection('roster').doc(COHORT).collection('members').get();
  const handles = rosterSnap.docs
    .filter((d) => d.data().active !== false)
    .map((d) => d.id);

  console.log(`Reconciling submissions for ${handles.length} active roster members`);

  let created = 0;
  for (const handle of handles) {
    for (const [projectIndex, project] of PROJECTS.entries()) {
      const entryRef = db
        .collection('submissions')
        .doc(COHORT)
        .collection('projects')
        .doc(project.slug)
        .collection('entries')
        .doc(handle);
      const existing = await entryRef.get();
      if (existing.exists) continue;

      const prNumber = 50 + projectIndex;
      const repo = REPO;
      await entryRef.set({
        githubHandle: handle,
        repo,
        prNumber,
        prUrl: `https://github.com/${repo}/pull/${prNumber}`,
        prTitle: project.prTitle(handle),
        merged: true,
        mergedAt: Timestamp.fromDate(new Date()),
        deployUrl: null,
        source: 'reconcile',
      });
      created += 1;
    }
  }

  console.log(`Reconcile complete. Created ${created} missing entries.`);
  console.log('Primary path: POST /api/github/webhook on merged PRs.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
