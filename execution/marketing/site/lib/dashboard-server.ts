import { programProjects } from '@/content/program';
import { getCohortStats } from '@/lib/cohort-stats-server';
import { getExpectationsAcknowledgment } from '@/lib/expectations-ack-server';
import { getPhase1Outcomes } from '@/lib/project-outcomes-server';
import type { ProjectOutcome } from '@/lib/project-outcomes-types';
import { getProjectProgress } from '@/lib/project-progress-server';
import { resolveScheduleContext } from '@/lib/program-schedule';

export type DashboardProjectSummary = {
  slug: string;
  phaseLabel: string;
  title: string;
  submissionMerged: boolean;
  reviewsRequired: number | null;
  reviewsWritten: number | null;
  votesCast: number | null;
  awaitingMerge: number | null;
  outcome: ProjectOutcome | null;
};

export type DashboardSummary = {
  schedule: ReturnType<typeof resolveScheduleContext>;
  projects: DashboardProjectSummary[];
  expectationsAcknowledgmentSigned: boolean;
  phase1Outcomes: ProjectOutcome[];
};

export async function getDashboardSummary(githubHandle: string): Promise<DashboardSummary> {
  const cohortStats = await getCohortStats();
  const schedule = resolveScheduleContext();

  const [projects, expectationsAck, phase1Outcomes] = await Promise.all([
    Promise.all(
      programProjects.map(async (project) => {
        const progress = await getProjectProgress(githubHandle, project.slug, cohortStats);
        return {
          slug: project.slug,
          phaseLabel: project.phaseLabel,
          title: project.title,
          submissionMerged: progress?.submission.merged ?? false,
          reviewsRequired: progress?.reviews?.required ?? null,
          reviewsWritten: progress?.reviews?.writtenCompleted ?? null,
          votesCast: progress?.reviews?.ratingsCompleted ?? null,
          awaitingMerge: progress?.reviews?.awaitingMerge ?? null,
          outcome: progress?.outcome ?? null,
        };
      })
    ),
    getExpectationsAcknowledgment(githubHandle),
    getPhase1Outcomes(),
  ]);

  return {
    schedule,
    projects,
    expectationsAcknowledgmentSigned: Boolean(expectationsAck),
    phase1Outcomes,
  };
}
