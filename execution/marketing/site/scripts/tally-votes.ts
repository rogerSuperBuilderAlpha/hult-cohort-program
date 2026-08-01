/**
 * Staff-only upvote tally from GitHub contest state.
 *
 * Usage (from execution/marketing/site):
 *   npx tsx scripts/tally-votes.ts --project=phase-1-project-1
 *   npx tsx scripts/tally-votes.ts --all
 *   npx tsx scripts/tally-votes.ts --all --json
 *   npx tsx scripts/tally-votes.ts --project=phase-1-project-1 --publish --confirm
 *
 * Requires GITHUB_TOKEN + Firebase Admin (for outcome publish / roster gate inside contest state).
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureStaffFirebaseEnv } from '../lib/script-env';

ensureStaffFirebaseEnv(import.meta.url);

import { isAdminConfigured, getAdminDb } from '../lib/firebase/admin';
import { cohortId } from '../lib/cohort-config';
import { publishProjectOutcome } from '../lib/project-outcomes-server';
import { tallyThumbsUp, type TallyResult } from '../lib/tally-server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VOTE_WEEK_PROJECTS = JSON.parse(
  readFileSync(path.join(__dirname, '../content/vote-week-projects.json'), 'utf8')
) as string[];

function parseArgs() {
  const projectArg = process.argv.find((a) => a.startsWith('--project='));
  const project = projectArg ? projectArg.split('=')[1] : null;
  const all = process.argv.includes('--all');
  const json = process.argv.includes('--json');
  const publish = process.argv.includes('--publish');
  const confirm = process.argv.includes('--confirm');

  if (!all && !project) {
    console.error(
      'Usage: npx tsx scripts/tally-votes.ts --project=<slug> | --all [--json] [--publish --confirm]'
    );
    process.exit(1);
  }

  if (publish && !confirm) {
    console.error('Publishing outcomes requires --confirm (dry-run by default).');
    process.exit(1);
  }

  const projects = all ? VOTE_WEEK_PROJECTS : [project!];
  for (const slug of projects) {
    if (!VOTE_WEEK_PROJECTS.includes(slug)) {
      console.error(`Unknown or non-vote-week project: ${slug}`);
      console.error(`Vote-week slugs: ${VOTE_WEEK_PROJECTS.join(', ')}`);
      process.exit(1);
    }
  }

  return { projects, json, publish };
}

function printTable(result: TallyResult) {
  console.log(`\n${result.projectSlug} (cohort ${result.cohortId})`);
  if (result.reviewsFetchDegraded) {
    console.log('⚠ Review issue fetch was degraded — counts are INCOMPLETE. Re-run before using.');
  }
  console.log('─'.repeat(48));
  console.log(`${'Handle'.padEnd(32)} ${'Up'.padStart(6)}`);
  console.log('─'.repeat(48));
  for (const row of result.rows) {
    console.log(`${row.handle.padEnd(32)} ${String(row.up).padStart(6)}`);
  }
  console.log('─'.repeat(48));
  const top = result.rows[0];
  if (result.winner && top) {
    const sameUp = result.rows.filter((row) => row.up === top.up);
    if (sameUp.length > 1) {
      console.log(
        `Winner (tie-break mergedAt/handle): @${result.winner} (${top.up} upvotes; ${sameUp.length} tied on count)`
      );
    } else {
      console.log(`Winner: @${result.winner} (${top.up} upvotes)`);
    }
  } else {
    console.log('Winner: (no eligible merged submissions)');
  }
}

async function main() {
  if (!isAdminConfigured()) {
    console.error(
      'Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON\n' +
        '(default path: secrets/firebase-service-account.json).'
    );
    process.exit(1);
  }

  const { projects, json, publish } = parseArgs();
  const id = cohortId();
  const results: Array<TallyResult & { tiedHandles: string[] }> = [];

  for (const slug of projects) {
    const result = await tallyThumbsUp(slug);
    const top = result.rows[0];
    const sameUp =
      top && result.rows.filter((r) => r.up === top.up).map((r) => r.handle);
    results.push({
      ...result,
      tiedHandles: sameUp && sameUp.length > 1 ? sameUp : [],
    });
  }

  const degraded = results.filter((r) => r.reviewsFetchDegraded);
  if (degraded.length > 0) {
    console.error(
      `\nERROR: review issue fetch was degraded for: ${degraded.map((r) => r.projectSlug).join(', ')}`
    );
    console.error('Review/upvote counts may be incomplete. Re-run after GitHub recovers.');
    if (publish) {
      console.error('Refusing --publish on degraded tally data.');
      process.exit(1);
    }
  }

  if (publish) {
    const db = getAdminDb();
    for (const result of results) {
      await publishProjectOutcome(db, id, result.projectSlug, {
        winnerHandle: result.winner,
        up: result.rows[0]?.up ?? 0,
        down: 0,
        tiedHandles: [],
      });
      console.log(
        `Published outcome for ${result.projectSlug} → ${result.winner ? `@${result.winner}` : 'none'}`
      );
    }
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

  if (degraded.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
