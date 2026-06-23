/**
 * Seed demo cohort members + submissions for UI testing.
 *
 * Usage (from execution/marketing/site):
 *   node scripts/seed-demo-cohort.mjs [--count=45] [--dry-run]
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON.
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COHORT = process.env.COHORT_ID?.trim() || 'fall26';
const REPO = process.env.NEXT_PUBLIC_COHORT_REPO?.trim() || 'rogerSuperBuilderAlpha/hult-cohort-program';
const ORG = process.env.NEXT_PUBLIC_COHORT_ORG?.trim() || REPO.split('/')[0] || 'rogerSuperBuilderAlpha';

const PROJECTS = [
  { slug: 'onboarding', prTitle: (h) => `[Onboarding] Tooling checklist — ${h}`, ballot: false },
  { slug: 'phase-1-project-1', prTitle: (h) => `[Project 1] Submission — ${h}`, ballot: true },
  { slug: 'phase-1-project-2', prTitle: (h) => `[Project 2] Submission — ${h}`, ballot: true },
  { slug: 'phase-1-project-3', prTitle: (h) => `[Project 3] Submission — ${h}`, ballot: true },
  { slug: 'phase-2-learning-app', prTitle: (h) => `[P2-L1] Submission — ${h}`, ballot: false },
  { slug: 'phase-2-venture', prTitle: (h) => `[P2-Venture] Submission — ${h}`, ballot: false },
  { slug: 'phase-2-open-source', prTitle: (h) => `[P2-OSS] Tracking — ${h}`, ballot: false },
];

const CAMPUSES = ['boston', 'london', 'san-francisco', 'dubai', 'online'];
const FIRST = [
  'Alex', 'Jordan', 'Sam', 'Priya', 'Marcus', 'Taylor', 'Riley', 'Casey', 'Morgan', 'Quinn',
  'Avery', 'Blake', 'Cameron', 'Drew', 'Elliot', 'Finley', 'Gray', 'Harper', 'Indigo', 'Jamie',
  'Kai', 'Logan', 'Maya', 'Noah', 'Olivia', 'Parker', 'Reese', 'Sage', 'Tatum', 'Uma',
  'Violet', 'Wren', 'Xander', 'Yuki', 'Zoe', 'Ada', 'Ben', 'Cleo', 'Dana', 'Evan',
  'Faye', 'Gus', 'Hana', 'Ivan', 'Jules',
];
const LAST = [
  'Rivera', 'Lee', 'Chen', 'Patel', 'Johnson', 'Kim', 'Nguyen', 'Martinez', 'Brown', 'Wilson',
  'Garcia', 'Singh', 'Okafor', 'Ali', 'Santos', 'Murphy', 'Cohen', 'Park', 'Dubois', 'Ahmed',
  'Torres', 'Brooks', 'Foster', 'Hayes', 'Reed', 'Bennett', 'Gray', 'Howard', 'Long', 'Price',
  'Russell', 'Stewart', 'Ward', 'Young', 'Bell', 'Cole', 'Diaz', 'Evans', 'Fox', 'Green',
  'Hall', 'Ivy', 'James', 'King', 'Lopez',
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
  if (!getApps().length) {
    initializeApp({ credential: cert(loadServiceAccount()) });
  }
  return getFirestore();
}

function parseArgs() {
  const dryRun = process.argv.includes('--dry-run');
  const countArg = process.argv.find((a) => a.startsWith('--count='));
  const count = countArg ? Number(countArg.split('=')[1]) : 45;
  return { dryRun, count };
}

function buildStudents(count) {
  return Array.from({ length: count }, (_, i) => {
    const firstName = FIRST[i % FIRST.length];
    const lastName = LAST[i % LAST.length];
    const suffix = String(i + 1).padStart(2, '0');
    const handle = `demo-${firstName.toLowerCase()}-${lastName.toLowerCase()}-${suffix}`;
    return {
      handle,
      firstName,
      lastName,
      email: `${handle}@demo.hult-cohort.test`,
      campus: CAMPUSES[i % CAMPUSES.length],
      displayName: `${firstName} ${lastName}`,
    };
  });
}

function mergedAtForProject(projectIndex) {
  // Stagger merges by project week (Sep 2026 baseline)
  const base = new Date('2026-09-15T17:00:00Z');
  base.setDate(base.getDate() + projectIndex * 14);
  return Timestamp.fromDate(base);
}

async function commitBatches(db, ops) {
  const BATCH = 400;
  for (let i = 0; i < ops.length; i += BATCH) {
    const batch = db.batch();
    for (const op of ops.slice(i, i + BATCH)) {
      op(batch);
    }
    await batch.commit();
  }
}

async function main() {
  const { dryRun, count } = parseArgs();
  const students = buildStudents(count);
  const db = initDb();

  const existingSnap = await db.collection('roster').doc(COHORT).collection('members').get();
  const existingHandles = new Set(existingSnap.docs.map((d) => d.id));
  const toAdd = students.filter((s) => !existingHandles.has(s.handle));

  console.log(`Cohort: ${COHORT} · org: ${ORG}`);
  console.log(`Existing roster: ${existingHandles.size} · adding ${toAdd.length} demo students`);
  if (toAdd.length === 0) {
    console.log('Nothing to add — all demo handles already exist.');
    return;
  }

  const ops = [];

  for (const student of toAdd) {
    const appId = `demo-${student.handle}`;

    ops.push((batch) => {
      batch.set(db.collection('applications').doc(appId), {
        id: appId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        githubUrl: `https://github.com/${student.handle}`,
        githubHandle: student.handle,
        motivation: 'Demo seed student for cohort UI testing.',
        project1Idea: 'Demo PM platform concept.',
        timezone: 'America/New_York',
        campus: student.campus,
        referralSource: 'demo-seed',
        confirmations: {
          toolingAcknowledged: true,
          publicWork: true,
        },
        status: 'admitted',
        cohort: COHORT,
        submittedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        demoSeed: true,
      });
    });

    ops.push((batch) => {
      batch.set(db.collection('roster').doc(COHORT).collection('members').doc(student.handle), {
        githubHandle: student.handle,
        email: student.email,
        displayName: student.displayName,
        campus: student.campus,
        roles: ['participant'],
        active: true,
        enrolledAt: FieldValue.serverTimestamp(),
        demoSeed: true,
      });
    });

    PROJECTS.forEach((project, projectIndex) => {
      const prNumber = 100 + projectIndex * 10 + (toAdd.indexOf(student) % 10);
      const repo = REPO;
      const prUrl = `https://github.com/${repo}/pull/${prNumber}`;
      const deployUrl =
        project.slug === 'onboarding'
          ? undefined
          : `https://${student.handle}-${project.slug}.demo.hult-cohort.test`;
      const mergedAt = mergedAtForProject(projectIndex);

      ops.push((batch) => {
        batch.set(
          db
            .collection('submissions')
            .doc(COHORT)
            .collection('projects')
            .doc(project.slug)
            .collection('entries')
            .doc(student.handle),
          {
            githubHandle: student.handle,
            repo,
            prNumber,
            prUrl,
            prTitle: project.prTitle(student.handle),
            merged: true,
            mergedAt,
            deployUrl: deployUrl ?? null,
            source: 'reconcile',
            demoSeed: true,
          }
        );
      });
    });
  }

  console.log(`Prepared ${ops.length} Firestore writes (${toAdd.length} students × ${PROJECTS.length} submissions each).`);

  if (dryRun) {
    console.log('Dry run — no writes performed.');
    console.log('Sample handles:', toAdd.slice(0, 3).map((s) => s.handle).join(', '));
    return;
  }

  await commitBatches(db, ops);

  const finalSnap = await db.collection('roster').doc(COHORT).collection('members').get();
  const active = finalSnap.docs.filter((d) => d.data().active !== false).length;
  console.log(`Done. Roster now ${active} active members (${active - 1} peer reviews per Phase 1 project).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
