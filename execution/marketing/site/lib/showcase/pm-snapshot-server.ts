import { programProjects } from '@/content/program';
import { cohortId } from '@/lib/cohort-config';
import { getCohortStats } from '@/lib/cohort-stats-server';
import { fetchContestState } from '@/lib/contest-state-server';
import type { PmSnapshot } from '@/lib/showcase/types';

const PHASE1_SLUGS = ['phase-1-project-1', 'phase-1-project-2', 'phase-1-project-3'] as const;

export async function getPmSnapshot(): Promise<PmSnapshot> {
  const id = cohortId();
  const stats = await getCohortStats(id);
  const enrolled = stats.enrolledCount;

  const projects = await Promise.all(
    programProjects
      .filter((p) => PHASE1_SLUGS.includes(p.slug as (typeof PHASE1_SLUGS)[number]))
      .map(async (project) => {
        let mergedCount = 0;
        if (stats.available) {
          try {
            const contest = await fetchContestState(project.slug);
            mergedCount = contest.submissions.length;
          } catch {
            mergedCount = 0;
          }
        }
        return {
          slug: project.slug,
          title: project.title,
          phaseLabel: project.phaseLabel,
          mergedCount,
          totalEnrolled: enrolled,
        };
      })
  );

  return {
    cohortId: id,
    enrolledCount: enrolled,
    available: stats.available,
    updatedAt: new Date().toISOString(),
    projects,
  };
}
