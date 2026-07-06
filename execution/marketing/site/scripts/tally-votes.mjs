/**
 * Staff-only thumbs-up tally for Phase 1 review-week projects.
 *
 * Usage (from execution/marketing/site):
 *   node scripts/tally-votes.mjs --project=phase-1-project-1
 *   node scripts/tally-votes.mjs --all
 *   node scripts/tally-votes.mjs --all --json
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON.
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, cohortIdFromEnv } from './lib/firebase-admin.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VOTE_WEEK_PROJECTS = JSON.parse(
  readFileSync(path.join(__dirname, '../content/vote-week-projects.json'), 'utf8')
);

function parseArgs() {
  const projectArg = process.argv.find((a) => a.startsWith('--project='));
  const project = projectArg ? projectArg.split('=')[1] : null;
  const all = process.argv.includes('--all');
  const json = process.argv.includes('--json');

  if (!all && !project) {
    console.error('Usage: node scripts/tally-votes.mjs --project=<slug> | --all [--json]');
    process.exit(1);
  }

  const projects = all ? VOTE_WEEK_PROJECTS : [project];
  for (const slug of projects) {
    if (!VOTE_WEEK_PROJECTS.includes(slug)) {
      console.error(`Unknown or non-vote-week project: ${slug}`);
      console.error(`Vote-week slugs: ${VOTE_WEEK_PROJECTS.join(', ')}`);
      process.exit(1);
    }
  }

  return { projects, json };
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  return null;
}

function compareRows(a, b) {
  if (b.up !== a.up) return b.up - a.up;
  if (a.down !== b.down) return a.down - b.down;
  const aTime = a.mergedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const bTime = b.mergedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  if (aTime !== bTime) return aTime - bTime;
  return a.handle.localeCompare(b.handle);
}

async function tallyProject(db, cohortId, projectSlug) {
  const [rosterSnap, entriesSnap, votersSnap] = await Promise.all([
    db.collection('roster').doc(cohortId).collection('members').get(),
    db
      .collection('submissions')
      .doc(cohortId)
      .collection('projects')
      .doc(projectSlug)
      .collection('entries')
      .where('merged', '==', true)
      .get(),
    db
      .collection('peerRatings')
      .doc(cohortId)
      .collection('projects')
      .doc(projectSlug)
      .collection('voters')
      .get(),
  ]);

  const activeHandles = new Set(
    rosterSnap.docs.filter((d) => d.data().active !== false).map((d) => d.id)
  );

  const mergedAtByHandle = new Map();
  for (const doc of entriesSnap.docs) {
    if (!activeHandles.has(doc.id)) continue;
    mergedAtByHandle.set(doc.id, toDate(doc.data().mergedAt));
  }

  const upCounts = new Map();
  const downCounts = new Map();

  for (const voterDoc of votersSnap.docs) {
    if (!activeHandles.has(voterDoc.id)) continue;
    const ratings = voterDoc.data()?.ratings ?? {};
    for (const [revieweeHandle, value] of Object.entries(ratings)) {
      if (!mergedAtByHandle.has(revieweeHandle)) continue;
      if (value === 'up') {
        upCounts.set(revieweeHandle, (upCounts.get(revieweeHandle) ?? 0) + 1);
      } else if (value === 'down') {
        downCounts.set(revieweeHandle, (downCounts.get(revieweeHandle) ?? 0) + 1);
      }
    }
  }

  const rows = [...mergedAtByHandle.keys()]
    .map((handle) => ({
      handle,
      up: upCounts.get(handle) ?? 0,
      down: downCounts.get(handle) ?? 0,
      mergedAt: mergedAtByHandle.get(handle) ?? null,
    }))
    .sort(compareRows);

  const top = rows[0] ?? null;
  const tiedAtTop =
    top &&
    rows.filter((row) => row.up === top.up && row.down === top.down).map((row) => row.handle);

  return {
    projectSlug,
    cohortId,
    rows,
    winner: tiedAtTop && tiedAtTop.length === 1 ? tiedAtTop[0] : null,
    tiedHandles: tiedAtTop && tiedAtTop.length > 1 ? tiedAtTop : [],
  };
}

function printTable(result) {
  console.log(`\n${result.projectSlug} (cohort ${result.cohortId})`);
  console.log('─'.repeat(56));
  console.log(`${'Handle'.padEnd(32)} ${'👍'.padStart(4)} ${'👎'.padStart(4)}`);
  console.log('─'.repeat(56));
  for (const row of result.rows) {
    console.log(`${row.handle.padEnd(32)} ${String(row.up).padStart(4)} ${String(row.down).padStart(4)}`);
  }
  console.log('─'.repeat(56));
  if (result.winner) {
    const top = result.rows[0];
    console.log(`Winner: @${result.winner} (${top.up} up, ${top.down} down)`);
  } else if (result.tiedHandles?.length) {
    console.log(
      `TIE at ${result.rows[0].up} up / ${result.rows[0].down} down — resolve via rubric median per governance/winner-selection.md:`
    );
    for (const handle of result.tiedHandles) {
      console.log(`  @${handle}`);
    }
  } else {
    console.log('Winner: (no eligible merged submissions)');
  }
}

async function main() {
  const { projects, json } = parseArgs();
  const db = initDb();
  const cohortId = cohortIdFromEnv();

  const results = [];
  for (const slug of projects) {
    results.push(await tallyProject(db, cohortId, slug));
  }

  if (json) {
    console.log(
      JSON.stringify(
        results.map((r) => ({
          ...r,
          rows: r.rows.map((row) => ({
            ...row,
            mergedAt: row.mergedAt?.toISOString() ?? null,
          })),
        })),
        null,
        2
      )
    );
    return;
  }

  for (const result of results) {
    printTable(result);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
