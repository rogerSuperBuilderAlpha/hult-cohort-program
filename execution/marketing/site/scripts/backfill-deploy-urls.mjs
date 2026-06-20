/**
 * Backfill deployUrl on submission entries from GitHub PR bodies or manual override.
 *
 * Usage (from execution/marketing/site):
 *   node scripts/backfill-deploy-urls.mjs --from-github [--dry-run]
 *   node scripts/backfill-deploy-urls.mjs --handle=demo-alex-rivera-01 --project=phase-1-project-1 --deploy-url=https://example.vercel.app
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_* and GITHUB_TOKEN (for --from-github).
 */

import { initDb, cohortIdFromEnv } from './lib/firebase-admin.mjs';
import { PROJECT_SLUGS } from './lib/projects.mjs';

function extractFirstHttpsUrl(text) {
  const match = text.match(/https:\/\/[^\s<>\]"')]+/i);
  if (!match) return null;
  return match[0].replace(/[.,;]+$/, '');
}

function extractDeployUrl(prBody) {
  if (!prBody?.trim()) return null;

  const lines = prBody.split(/\r?\n/);
  const labelPattern =
    /^\s*(?:\*\*)?(?:production\s+url|deploy(?:ment)?\s+url)(?:\*\*)?\s*:?\s*(.*)$/i;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(labelPattern);
    if (!match) continue;

    const inline = extractFirstHttpsUrl(match[1] ?? '');
    if (inline) return inline;

    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
      const line = lines[j].trim();
      if (!line) continue;
      const url = extractFirstHttpsUrl(line);
      if (url) return url;
      if (!line.match(/^[\s\-*]/)) break;
    }
  }

  return null;
}

function parseArgs() {
  const dryRun = process.argv.includes('--dry-run');
  const fromGithub = process.argv.includes('--from-github');
  const handleArg = process.argv.find((a) => a.startsWith('--handle='));
  const projectArg = process.argv.find((a) => a.startsWith('--project='));
  const deployUrlArg = process.argv.find((a) => a.startsWith('--deploy-url='));

  const handle = handleArg ? handleArg.split('=')[1] : null;
  const project = projectArg ? projectArg.split('=')[1] : null;
  const deployUrl = deployUrlArg ? deployUrlArg.split('=')[1] : null;

  if (handle && project && deployUrl) {
    return { mode: 'manual', dryRun, handle, project, deployUrl };
  }
  if (fromGithub) {
    return { mode: 'github', dryRun };
  }

  console.error(
    'Usage:\n' +
      '  node scripts/backfill-deploy-urls.mjs --from-github [--dry-run]\n' +
      '  node scripts/backfill-deploy-urls.mjs --handle=<handle> --project=<slug> --deploy-url=<url> [--dry-run]'
  );
  process.exit(1);
}

async function fetchPrBody(token, repo, prNumber) {
  const res = await fetch(`https://api.github.com/repos/${repo}/pulls/${prNumber}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'hult-cohort-platform',
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.body ?? null;
}

async function backfillFromGithub(db, cohortId, dryRun) {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    console.error('GITHUB_TOKEN required for --from-github');
    process.exit(1);
  }

  let updated = 0;
  let skipped = 0;

  for (const slug of PROJECT_SLUGS) {
    const snap = await db
      .collection('submissions')
      .doc(cohortId)
      .collection('projects')
      .doc(slug)
      .collection('entries')
      .where('merged', '==', true)
      .get();

    for (const doc of snap.docs) {
      const data = doc.data();
      if (data.deployUrl) {
        skipped += 1;
        continue;
      }

      const body = await fetchPrBody(token, data.repo, data.prNumber);
      const deployUrl = extractDeployUrl(body);
      if (!deployUrl) {
        skipped += 1;
        continue;
      }

      console.log(`${slug}/${doc.id} → ${deployUrl}`);
      if (!dryRun) {
        await doc.ref.set({ deployUrl, updatedAt: new Date() }, { merge: true });
      }
      updated += 1;
    }
  }

  console.log(`Done. Updated ${updated}, skipped ${skipped}${dryRun ? ' (dry run)' : ''}.`);
}

async function manualSet(db, cohortId, handle, project, deployUrl, dryRun) {
  if (!PROJECT_SLUGS.includes(project)) {
    console.error(`Unknown project slug: ${project}`);
    process.exit(1);
  }

  const ref = db
    .collection('submissions')
    .doc(cohortId)
    .collection('projects')
    .doc(project)
    .collection('entries')
    .doc(handle);

  const existing = await ref.get();
  if (!existing.exists) {
    console.error(`No submission entry for ${handle} on ${project}`);
    process.exit(1);
  }

  console.log(`Set ${project}/${handle} deployUrl → ${deployUrl}`);
  if (!dryRun) {
    await ref.set({ deployUrl, updatedAt: new Date() }, { merge: true });
  }
}

async function main() {
  const args = parseArgs();
  const db = initDb();
  const cohortId = cohortIdFromEnv();

  if (args.mode === 'manual') {
    await manualSet(db, cohortId, args.handle, args.project, args.deployUrl, args.dryRun);
    return;
  }

  await backfillFromGithub(db, cohortId, args.dryRun);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
