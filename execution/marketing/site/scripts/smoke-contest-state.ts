import { ensureStaffFirebaseEnv } from '../lib/script-env';

ensureStaffFirebaseEnv(import.meta.url);

import { isAdminConfigured } from '../lib/firebase/admin';
import { listMergedProjectSubmissions } from '../lib/github-cohort-server';
import { buildContestState } from '../lib/contest-state-server';

async function main() {
  if (!isAdminConfigured()) {
    console.error(
      'Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or place secrets/firebase-service-account.json'
    );
    process.exit(1);
  }

  const rows = await listMergedProjectSubmissions('summer26', 'phase-1-project-1');
  console.log('submissions', rows.length, rows.map((r) => r.githubHandle).join(', '));
  const state = await buildContestState('phase-1-project-1');
  console.log('contest submissions', state.submissions.length);
  console.log('reviewer keys', Object.keys(state.reviews).length);
  console.log('reviewsFetchDegraded', state.reviewsFetchDegraded);
  if (state.submissions.length === 0 && rows.length > 0) {
    console.error(
      'Contest filtered all submissions — check roster activeHandles vs GitHub handles.'
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
