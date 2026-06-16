import { getProject } from '@/content/program';
import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId, cohortSubmissionRepo } from '@/lib/cohort-config';
import type { CohortStats } from '@/lib/cohort-stats-types';
import { getEligiblePeerRows, mergePeerProgress } from '@/lib/eligible-peers-server';
import { formatScheduleDate } from '@/lib/program-schedule';
import type { ProjectProgress } from './project-progress-types';
import { githubRepoUrl, cohortSubmissionBrowseUrl } from './project-progress-format';
import { getVoterRatingsMap } from './ratings-server';
import { getWrittenReviewsMap } from './written-reviews-server';

export async function getProjectProgress(
  githubHandle: string,
  projectSlug: string,
  cohortStats: CohortStats
): Promise<ProjectProgress | null> {
  if (!isAdminConfigured()) return null;

  const project = getProject(projectSlug);
  if (!project) return null;

  const id = cohortId();
  const repo = cohortSubmissionRepo();
  const db = getAdminDb();
  const repoUrl = githubRepoUrl(repo);

  const submissionDoc = await db
    .collection('submissions')
    .doc(id)
    .collection('projects')
    .doc(projectSlug)
    .collection('entries')
    .doc(githubHandle)
    .get();

  const submissionData = submissionDoc.exists ? submissionDoc.data()! : null;

  let reviews: ProjectProgress['reviews'] = null;
  if (project.reviews) {
    const [myRatings, writtenReviews, peerRows] = await Promise.all([
      getVoterRatingsMap(projectSlug, githubHandle),
      getWrittenReviewsMap(projectSlug, githubHandle),
      getEligiblePeerRows(projectSlug, githubHandle),
    ]);

    const peers = mergePeerProgress(peerRows, writtenReviews, myRatings);
    const required = peers.length;
    const rosterPeerCount = Math.max(0, cohortStats.peerReviewCount);
    const awaitingMerge = Math.max(0, rosterPeerCount - required);

    reviews = {
      required,
      rosterPeerCount,
      awaitingMerge,
      writtenCompleted: peers.filter((p) => p.reviewFiled).length,
      ratingsCompleted: peers.filter((p) => p.reviewFiled && p.rated).length,
      dueNote: project.reviews.dueNote,
      dueAt: project.schedule.reviewCloses ?? project.schedule.submissionCloses,
      dueAtFormatted: formatScheduleDate(
        project.schedule.reviewCloses ?? project.schedule.submissionCloses
      ),
      peers,
      orgReposUrl: cohortSubmissionBrowseUrl(repo, projectSlug),
      voteWeek: project.voteWeek,
      githubVerification: Boolean(process.env.GITHUB_TOKEN?.trim()),
    };
  }

  return {
    projectSlug,
    submission: {
      merged: submissionData?.merged === true,
      prUrl: submissionData?.prUrl,
      deployUrl: submissionData?.deployUrl ?? null,
      repo,
      repoUrl,
    },
    reviews,
  };
}
