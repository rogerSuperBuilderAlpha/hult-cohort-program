import { getProject } from '@/content/program';
import { isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId, cohortSubmissionRepo, projectBranch } from '@/lib/cohort-config';
import type { CohortStats } from '@/lib/cohort-stats-types';
import { getEligiblePeerRows, mergePeerProgress } from '@/lib/eligible-peers-server';
import { formatScheduleDate, reviewWindowStatus } from '@/lib/program-schedule';
import type { ProjectProgress } from './project-progress-types';
import { cohortSubmissionBrowseUrl } from './project-progress-format';
import { githubRepoUrl } from '@/lib/github-urls';
import { getVoterRatingsMap } from './ratings-server';
import { resolveParticipantSubmission } from '@/lib/submissions-resolve-server';
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
  const repoUrl = githubRepoUrl(repo);

  const submissionData = await resolveParticipantSubmission(projectSlug, githubHandle, id);

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

    const windowStatus = reviewWindowStatus(project);
    const schedule = project.schedule;

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
      orgReposUrl: cohortSubmissionBrowseUrl(repo, projectSlug, id),
      voteWeek: project.voteWeek,
      githubVerification: Boolean(process.env.GITHUB_TOKEN?.trim()),
      reviewWindowStatus: windowStatus,
      reviewOpensFormatted: schedule.reviewOpens
        ? formatScheduleDate(schedule.reviewOpens)
        : undefined,
      reviewClosesFormatted: schedule.reviewCloses
        ? formatScheduleDate(schedule.reviewCloses)
        : undefined,
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
      baseBranch: projectBranch(id, projectSlug),
    },
    reviews,
  };
}
