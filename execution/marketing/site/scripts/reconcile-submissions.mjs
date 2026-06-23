/**
 * GitHub-backed submission reconcile — compares Firestore cache to GitHub truth.
 * Usage: node scripts/reconcile-submissions.mjs [--write-cache]
 *
 * Without --write-cache: report-only diff.
 * With --write-cache: upsert Firestore submission entries from GitHub (cache only).
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WRITE_CACHE = process.argv.includes('--write-cache');

process.env.COHORT_ID = process.env.COHORT_ID?.trim() || 'fall26';
process.env.NEXT_PUBLIC_COHORT_REPO =
  process.env.NEXT_PUBLIC_COHORT_REPO?.trim() || 'rogerSuperBuilderAlpha/hult-cohort-program';
process.env.ALLOW_LEGACY_MAIN_SUBMISSIONS =
  process.env.ALLOW_LEGACY_MAIN_SUBMISSIONS?.trim() || 'true';

const COHORT = process.env.COHORT_ID;

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

async function loadGithubModule() {
  const modPath = path.join(__dirname, '../lib/github-cohort-server.ts');
  return import(pathToFileURL(modPath).href);
}

async function loadProgramModule() {
  const modPath = path.join(__dirname, '../content/program.ts');
  return import(pathToFileURL(modPath).href);
}

async function main() {
  const db = initDb();
  const { listMergedProjectSubmissions } = await loadGithubModule();
  const { programProjects } = await loadProgramModule();

  let githubCount = 0;
  let missingInFirestore = 0;
  let staleInFirestore = 0;
  let written = 0;

  for (const project of programProjects) {
    const githubRows = await listMergedProjectSubmissions(COHORT, project.slug);
    githubCount += githubRows.length;

    for (const row of githubRows) {
      const entryRef = db
        .collection('submissions')
        .doc(COHORT)
        .collection('projects')
        .doc(project.slug)
        .collection('entries')
        .doc(row.githubHandle);

      const existing = await entryRef.get();
      if (!existing.exists) {
        missingInFirestore += 1;
        console.log(`MISSING cache: ${row.githubHandle} ${project.slug} → ${row.prUrl}`);
        if (WRITE_CACHE) {
          await entryRef.set({
            githubHandle: row.githubHandle,
            repo: row.repo,
            prNumber: row.prNumber,
            prUrl: row.prUrl,
            prTitle: row.prTitle,
            merged: true,
            mergedAt: Timestamp.fromDate(new Date(row.mergedAt)),
            deployUrl: row.deployUrl,
            source: 'reconcile',
            baseRef: row.baseRef,
            updatedAt: new Date(),
          });
          written += 1;
        }
        continue;
      }

      const data = existing.data();
      if (data.prNumber !== row.prNumber || data.prUrl !== row.prUrl) {
        staleInFirestore += 1;
        console.log(`STALE cache: ${row.githubHandle} ${project.slug} firestore=${data.prUrl} github=${row.prUrl}`);
        if (WRITE_CACHE) {
          await entryRef.set(
            {
              prNumber: row.prNumber,
              prUrl: row.prUrl,
              prTitle: row.prTitle,
              merged: true,
              mergedAt: Timestamp.fromDate(new Date(row.mergedAt)),
              deployUrl: row.deployUrl,
              source: 'reconcile',
              baseRef: row.baseRef,
              updatedAt: new Date(),
            },
            { merge: true }
          );
          written += 1;
        }
      }
    }
  }

  console.log('\nReconcile summary');
  console.log(`  GitHub merged submissions: ${githubCount}`);
  console.log(`  Missing Firestore cache rows: ${missingInFirestore}`);
  console.log(`  Stale Firestore cache rows: ${staleInFirestore}`);
  if (WRITE_CACHE) console.log(`  Cache rows written: ${written}`);
  else console.log('  Run with --write-cache to upsert Firestore cache from GitHub.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
