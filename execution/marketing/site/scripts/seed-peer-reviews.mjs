/**
 * Seed demo peer written reviews + private votes for UI/tally testing.
 *
 * Requires demo roster from seed-demo-cohort.mjs (demoSeed: true handles).
 *
 * Usage (from execution/marketing/site):
 *   node scripts/seed-peer-reviews.mjs [--dry-run] [--project=phase-1-project-1]
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON.
 */

import { initDb, cohortIdFromEnv, cohortRepoFromEnv } from './lib/firebase-admin.mjs';

const VOTE_WEEK_PROJECTS = [
  'phase-1-project-1',
  'phase-1-project-2',
  'phase-1-project-3',
];

function parseArgs() {
  const dryRun = process.argv.includes('--dry-run');
  const projectArg = process.argv.find((a) => a.startsWith('--project='));
  const project = projectArg ? projectArg.split('=')[1] : null;
  const projects = project ? [project] : VOTE_WEEK_PROJECTS;

  for (const slug of projects) {
    if (!VOTE_WEEK_PROJECTS.includes(slug)) {
      console.error(`Unknown or non-vote-week project: ${slug}`);
      process.exit(1);
    }
  }

  return { dryRun, projects };
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function ratingFor(voter, reviewee, projectSlug) {
  const n = hashCode(`${voter}:${reviewee}:${projectSlug}`) % 10;
  return n <= 6 ? 'up' : 'down';
}

async function getEligibleHandles(db, cohortId, projectSlug) {
  const [rosterSnap, entriesSnap] = await Promise.all([
    db.collection('roster').doc(cohortId).collection('members').get(),
    db
      .collection('submissions')
      .doc(cohortId)
      .collection('projects')
      .doc(projectSlug)
      .collection('entries')
      .where('merged', '==', true)
      .get(),
  ]);

  const active = new Set(
    rosterSnap.docs.filter((d) => d.data().active !== false).map((d) => d.id)
  );

  return entriesSnap.docs
    .filter((d) => active.has(d.id) && d.data().demoSeed === true)
    .map((d) => d.id)
    .sort();
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

async function seedProject(db, cohortId, repo, projectSlug, dryRun) {
  const handles = await getEligibleHandles(db, cohortId, projectSlug);
  if (handles.length < 2) {
    console.log(`${projectSlug}: need at least 2 demo merged submissions — run seed-demo-cohort.mjs first`);
    return { reviews: 0, ratings: 0 };
  }

  const ops = [];
  let reviewCount = 0;
  let ratingCount = 0;

  for (const voter of handles) {
    const ratings = {};
    const peers = handles.filter((h) => h !== voter);

    for (const reviewee of peers) {
      const issueNumber = 1000 + (hashCode(`${voter}-${reviewee}-${projectSlug}`) % 9000);
      const issueUrl = `https://github.com/${repo}/issues/${issueNumber}`;
      const rating = ratingFor(voter, reviewee, projectSlug);

      ops.push((batch) => {
        batch.set(
          db
            .collection('peerWrittenReviews')
            .doc(cohortId)
            .collection('projects')
            .doc(projectSlug)
            .collection('voters')
            .doc(voter)
            .collection('entries')
            .doc(reviewee),
          {
            issueUrl,
            voterHandle: voter,
            revieweeHandle: reviewee,
            updatedAt: new Date(),
            demoSeed: true,
          }
        );
      });
      reviewCount += 1;

      ratings[reviewee] = rating;
      ratingCount += 1;
    }

    ops.push((batch) => {
      batch.set(
        db
          .collection('peerRatings')
          .doc(cohortId)
          .collection('projects')
          .doc(projectSlug)
          .collection('voters')
          .doc(voter),
        {
          ratings,
          updatedAt: new Date(),
          demoSeed: true,
        }
      );
    });
  }

  console.log(
    `${projectSlug}: ${handles.length} demo peers → ${reviewCount} written reviews, ${ratingCount} votes`
  );

  if (!dryRun) {
    await commitBatches(db, ops);
  }

  return { reviews: reviewCount, ratings: ratingCount };
}

async function main() {
  const { dryRun, projects } = parseArgs();
  const db = initDb();
  const cohortId = cohortIdFromEnv();
  const repo = cohortRepoFromEnv();

  console.log(`Cohort: ${cohortId} · repo: ${repo}${dryRun ? ' (dry run)' : ''}`);

  let totalReviews = 0;
  let totalRatings = 0;

  for (const slug of projects) {
    const { reviews, ratings } = await seedProject(db, cohortId, repo, slug, dryRun);
    totalReviews += reviews;
    totalRatings += ratings;
  }

  console.log(`Done. ${totalReviews} written reviews, ${totalRatings} votes${dryRun ? ' (no writes)' : ''}.`);
  if (!dryRun && totalReviews > 0) {
    console.log('Run: node scripts/tally-votes.mjs --all');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
