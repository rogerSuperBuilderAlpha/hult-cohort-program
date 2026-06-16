import type { ProgramProject } from '@/content/program';
import { programProjects } from '@/content/program';

export type ProjectSchedule = {
  submissionOpens: string;
  submissionCloses: string;
  reviewOpens?: string;
  reviewCloses?: string;
};

export type ProgramPhase = 'onboarding' | 'phase-1' | 'phase-2';

export type ScheduleContext = {
  now: Date;
  activeProject: ProgramProject | null;
  activePhase: ProgramPhase | null;
  cohortWeek: number | null;
};

function parseIso(iso: string): Date {
  return new Date(iso);
}

export function getProjectSchedule(project: ProgramProject): ProjectSchedule | null {
  return project.schedule ?? null;
}

export function isSubmissionOpen(project: ProgramProject, now = new Date()): boolean {
  const schedule = getProjectSchedule(project);
  if (!schedule) return true;
  const t = now.getTime();
  return t >= parseIso(schedule.submissionOpens).getTime() && t <= parseIso(schedule.submissionCloses).getTime();
}

export function isReviewWindowOpen(project: ProgramProject, now = new Date()): boolean {
  const schedule = getProjectSchedule(project);
  if (!schedule?.reviewOpens || !schedule.reviewCloses) return true;
  const t = now.getTime();
  return t >= parseIso(schedule.reviewOpens).getTime() && t <= parseIso(schedule.reviewCloses).getTime();
}

export function reviewWindowStatus(
  project: ProgramProject,
  now = new Date()
): 'open' | 'not-yet' | 'closed' | 'none' {
  const schedule = getProjectSchedule(project);
  if (!schedule?.reviewOpens || !schedule.reviewCloses) return 'none';
  const t = now.getTime();
  if (t < parseIso(schedule.reviewOpens).getTime()) return 'not-yet';
  if (t > parseIso(schedule.reviewCloses).getTime()) return 'closed';
  return 'open';
}

/** Cohort kickoff Mon Sep 8, 2026 — week 1 */
const COHORT_START = parseIso('2026-09-08T12:00:00.000Z');

export function cohortWeekNumber(now = new Date()): number | null {
  if (now < COHORT_START) return null;
  const ms = now.getTime() - COHORT_START.getTime();
  return Math.floor(ms / (7 * 24 * 60 * 60 * 1000)) + 1;
}

export function resolveScheduleContext(now = new Date()): ScheduleContext {
  const week = cohortWeekNumber(now);

  for (const project of programProjects) {
    const schedule = getProjectSchedule(project);
    if (!schedule) continue;

    const opens = parseIso(schedule.submissionOpens).getTime();
    const closes = parseIso(schedule.submissionCloses).getTime();
    const reviewCloses = schedule.reviewCloses
      ? parseIso(schedule.reviewCloses).getTime()
      : closes;

    const t = now.getTime();
    if (t >= opens && t <= reviewCloses) {
      return {
        now,
        activeProject: project,
        activePhase: project.phase,
        cohortWeek: week,
      };
    }
  }

  return {
    now,
    activeProject: null,
    activePhase: null,
    cohortWeek: week,
  };
}

export function formatScheduleDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}
