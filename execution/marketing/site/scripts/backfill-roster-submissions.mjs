/**
 * Backfill submissions for roster members missing demo seed data.
 * Usage: node scripts/backfill-roster-submissions.mjs
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COHORT = 'fall26';
const ORG = process.env.NEXT_PUBLIC_COHORT_ORG?.trim() || 'hult-cohort-fall26-boston';

const PROJECTS = [
  { slug: 'onboarding', repo: (h) => `${ORG}/roster`, prTitle: (h) => `[Onboarding] Tooling checklist — ${h}`, ballot: false },
  { slug: 'phase-1-project-1', repo: (h) => `${ORG}/pm-${h}`, prTitle: (h) => `[Project 1] Submission — ${h}`, ballot: true },
  { slug: 'phase-1-project-2', repo: (h) => `${ORG}/comms-${h}`, prTitle: (h) => `[Project 2] Submission — ${h}`, ballot: true },
  { slug: 'phase-1-project-3', repo: (h) => `${ORG}/showcase-${h}`, prTitle: (h) => `[Project 3] Submission — ${h}`, ballot: true },
  { slug: 'phase-2-learning-app', repo: (h) => `${ORG}/learning-${h}`, prTitle: (h) => `[P2-L1] Submission — ${h}`, ballot: false },
  { slug: 'phase-2-venture', repo: (h) => `${ORG}/venture-${h}`, prTitle: (h) => `[P2-Venture] Submission — ${h}`, ballot: false },
  { slug: 'phase-2-open-source', repo: (h) => `${ORG}/oss-${h}`, prTitle: (h) => `[P2-OSS] Tracking — ${h}`, ballot: false },
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

function mergedAtForProject(projectIndex) {
  const base = new Date('2026-09-15T17:00:00Z');
  base.setDate(base.getDate() + projectIndex * 14);
  return Timestamp.fromDate(base);
}

async function main() {
  const db = initDb();
  const rosterSnap = await db.collection('roster').doc(COHORT).collection('members').get();
  const handles = rosterSnap.docs
    .filter((d) => d.data().active !== false && !d.data().demoSeed)
    .map((d) => d.id);

  console.log(`Backfilling submissions for ${handles.length} non-demo roster members:`, handles.join(', '));

  const ballotAdds = Object.fromEntries(
    PROJECTS.filter((p) => p.ballot).map((p) => [p.slug, []])
  );

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
      const repo = project.repo(handle);
      const prUrl = `https://github.com/${repo}/pull/${prNumber}`;
      const deployUrl =
        project.slug === 'onboarding'
          ? null
          : `https://${handle}-${project.slug}.demo.hult-cohort.test`;
      const mergedAt = mergedAtForProject(projectIndex);

      await entryRef.set({
        githubHandle: handle,
        repo,
        prNumber,
        prUrl,
        prTitle: project.prTitle(handle),
        merged: true,
        mergedAt,
        deployUrl,
        eligibleForBallot: project.ballot,
      });

      if (project.ballot) {
        ballotAdds[project.slug].push({
          githubHandle: handle,
          repo,
          prNumber,
          prUrl,
          mergedAt,
          deployUrl,
        });
      }
    }
  }

  for (const project of PROJECTS.filter((p) => p.ballot)) {
    if (ballotAdds[project.slug].length === 0) continue;
    const ballotRef = db.collection('ballots').doc(COHORT).collection('projects').doc(project.slug);
    const existing = await ballotRef.get();
    const prior = existing.exists ? existing.data()?.eligiblePrs ?? [] : [];
    await ballotRef.set(
      {
        eligiblePrs: [...prior, ...ballotAdds[project.slug]],
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  console.log('Backfill complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
