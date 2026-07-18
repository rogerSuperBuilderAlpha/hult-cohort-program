import { getProject } from '@/content/program';
import { getProjectOutcome } from '@/lib/project-outcomes-server';
import { isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId, cohortSubmissionRepo, projectBranch } from '@/lib/cohort-config';
import type { CohortStats } from '@/lib/cohort-stats-types';
import { fetchContestState, reviewsForVoter } from '@/lib/contest-state-server';
import { mergePeerProgress, type EligiblePeerRow } from '@/lib/eligible-peers-server';
import { formatScheduleDate, reviewWindowStatus, submissionWindowStatus } from '@/lib/program-schedule';
import type { ProjectProgress } from './project-progress-types';
import { cohortSubmissionBrowseUrl } from './project-progress-format';
import { githubRepoUrl } from '@/lib/github-urls';
import { resolveParticipantSubmission } from '@/lib/submissions-resolve-server';

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
  const self = githubHandle.toLowerCase();

  const [submissionData, contest] = await Promise.all([
    resolveParticipantSubmission(projectSlug, githubHandle, id),
    project.reviews ? fetchContestState(projectSlug) : Promise.resolve(null),
  ]);

  let reviews: ProjectProgress['reviews'] = null;
  if (project.reviews && contest) {
    const peerRows: EligiblePeerRow[] = contest.submissions
      .filter((s) => s.handle !== self)
      .map((s) => ({
        handle: s.handle,
        repo: s.repo,
        prUrl: s.prUrl,
        deployUrl: s.deployUrl,
      }));

    const myReviews = reviewsForVoter(contest, self);
    const peers = mergePeerProgress(peerRows, myReviews);
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
      upvotesCompleted: peers.filter((p) => p.upvoted).length,
      dueNote: project.reviews.dueNote,
      dueAt: project.schedule.reviewCloses ?? project.schedule.submissionCloses,
      dueAtFormatted: formatScheduleDate(
        project.schedule.reviewCloses ?? project.schedule.submissionCloses
      ),
      peers,
      orgReposUrl: cohortSubmissionBrowseUrl(repo, projectSlug, id),
      voteWeek: project.voteWeek,
      reviewWindowStatus: windowStatus,
      reviewOpensFormatted: schedule.reviewOpens
        ? formatScheduleDate(schedule.reviewOpens)
        : undefined,
      reviewClosesFormatted: schedule.reviewCloses
        ? formatScheduleDate(schedule.reviewCloses)
        : undefined,
    };
  }

  const scheduleBlock = project.schedule
    ? {
        submissionWindowStatus: submissionWindowStatus(project),
        submissionOpensFormatted: formatScheduleDate(project.schedule.submissionOpens),
        submissionClosesFormatted: formatScheduleDate(project.schedule.submissionCloses),
        deadlineNote: project.submission.deadlineNote,
      }
    : null;

  const outcome = project.voteWeek ? await getProjectOutcome(projectSlug, id) : null;

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
    schedule: scheduleBlock,
    outcome,
    reviews,
  };
}
