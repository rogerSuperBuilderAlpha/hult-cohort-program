import { programProjects } from '@/content/program';
import { getCohortStats } from '@/lib/cohort-stats-server';
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
};

export type DashboardSummary = {
  schedule: ReturnType<typeof resolveScheduleContext>;
  projects: DashboardProjectSummary[];
};

export async function getDashboardSummary(githubHandle: string): Promise<DashboardSummary> {
  const cohortStats = await getCohortStats();
  const schedule = resolveScheduleContext();

  const projects: DashboardProjectSummary[] = await Promise.all(
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
      };
    })
  );

  return { schedule, projects };
}
