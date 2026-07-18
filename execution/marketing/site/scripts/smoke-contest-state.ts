import { listMergedProjectSubmissions } from '../lib/github-cohort-server';
import { buildContestState } from '../lib/contest-state-server';

async function main() {
  const rows = await listMergedProjectSubmissions('summer26', 'phase-1-project-1');
  console.log('submissions', rows.length, rows.map((r) => r.githubHandle).join(', '));
  const state = await buildContestState('phase-1-project-1');
  console.log('contest submissions', state.submissions.length);
  console.log('reviewer keys', Object.keys(state.reviews).length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
