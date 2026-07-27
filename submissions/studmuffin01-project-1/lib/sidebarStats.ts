/**
 * Aggregations for sidebar pages (Member Status, Action Items, leaderboards).
 */

import { getOverallHealth, type HealthStatus } from "@/lib/health";
import type { Initiative } from "@/lib/initiatives";
import {
  calculateInitiativeTaskPercent,
  getInitiativeTasks,
  TASK_STATUS_OPTIONS,
  type AllInitiativeTasks,
  type TaskRow,
} from "@/lib/initiativeTasks";

export interface FlatTask extends TaskRow {
  initiativeSlug: string;
  initiativeTitle: string;
}

export interface StatusBreakdown {
  status: string;
  count: number;
}

export interface InitiativeProgress {
  slug: string;
  title: string;
  taskPercent: number;
  health: HealthStatus;
  openTasks: number;
  doneTasks: number;
}

export interface MemberScore {
  name: string;
  count: number;
}

function taskHasContent(task: TaskRow): boolean {
  return (
    task.description.trim().length > 0 ||
    task.status.trim().length > 0 ||
    task.dateDue.trim().length > 0 ||
    task.responsibility.trim().length > 0 ||
    task.comments.trim().length > 0
  );
}

export function flattenTasks(
  initiatives: Initiative[],
  tasksByInitiative: AllInitiativeTasks
): FlatTask[] {
  const result: FlatTask[] = [];

  for (const initiative of initiatives) {
    const tasks = getInitiativeTasks(tasksByInitiative, initiative.slug);
    for (const task of tasks) {
      if (!taskHasContent(task)) {
        continue;
      }

      result.push({
        ...task,
        initiativeSlug: initiative.slug,
        initiativeTitle: initiative.title,
      });
    }
  }

  return result;
}

export function isActionableStatus(status: string): boolean {
  return status === "To Do" || status === "In Progress";
}

export function isTaskOverdue(task: TaskRow): boolean {
  if (!task.dateDue.trim() || task.status === "Done") {
    return false;
  }

  const parsed = Date.parse(task.dateDue.trim());
  if (Number.isNaN(parsed)) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed < today.getTime();
}

function compareDueDates(a: string, b: string): number {
  const aParsed = Date.parse(a.trim());
  const bParsed = Date.parse(b.trim());

  if (Number.isNaN(aParsed) && Number.isNaN(bParsed)) {
    return 0;
  }

  if (Number.isNaN(aParsed)) {
    return 1;
  }

  if (Number.isNaN(bParsed)) {
    return -1;
  }

  return aParsed - bParsed;
}

export function getActionItems(flatTasks: FlatTask[]): FlatTask[] {
  return flatTasks
    .filter(
      (task) =>
        isActionableStatus(task.status) ||
        (!task.status.trim() && task.description.trim().length > 0)
    )
    .sort((a, b) => {
      const aOverdue = isTaskOverdue(a);
      const bOverdue = isTaskOverdue(b);
      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1;
      }

      return compareDueDates(a.dateDue, b.dateDue);
    });
}

export function getTaskStatusBreakdown(flatTasks: FlatTask[]): StatusBreakdown[] {
  const counts = new Map<string, number>();

  for (const status of TASK_STATUS_OPTIONS) {
    counts.set(status, 0);
  }

  counts.set("Unset", 0);

  for (const task of flatTasks) {
    const key = (TASK_STATUS_OPTIONS as readonly string[]).includes(task.status)
      ? task.status
      : "Unset";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
}

export function getInitiativeProgressList(
  initiatives: Initiative[],
  tasksByInitiative: AllInitiativeTasks
): InitiativeProgress[] {
  return initiatives.map((initiative) => {
    const tasks = getInitiativeTasks(tasksByInitiative, initiative.slug);
    const activeTasks = tasks.filter(taskHasContent);
    const doneTasks = activeTasks.filter((task) => task.status === "Done").length;
    const openTasks = activeTasks.length - doneTasks;
    const taskPercent = calculateInitiativeTaskPercent(tasks);

    return {
      slug: initiative.slug,
      title: initiative.title,
      taskPercent,
      health: getOverallHealth(taskPercent),
      openTasks,
      doneTasks,
    };
  });
}

function sortScores(counts: Map<string, number>): MemberScore[] {
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 10);
}

export function getPerformerScores(flatTasks: FlatTask[]): MemberScore[] {
  const counts = new Map<string, number>();

  for (const task of flatTasks) {
    if (task.status === "Done" && task.responsibility.trim()) {
      const name = task.responsibility.trim();
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }

  return sortScores(counts);
}

export function getMemberOpenTasks(flatTasks: FlatTask[], memberName: string): FlatTask[] {
  const trimmedName = memberName.trim();
  if (!trimmedName) {
    return [];
  }

  return flatTasks.filter(
    (task) =>
      task.responsibility.trim() === trimmedName &&
      (isActionableStatus(task.status) || !task.status.trim())
  );
}

export function getMemberTasks(flatTasks: FlatTask[], memberName: string): FlatTask[] {
  const trimmedName = memberName.trim();
  if (!trimmedName) {
    return [];
  }

  return flatTasks.filter((task) => task.responsibility.trim() === trimmedName);
}

export interface MemberInitiativeTaskSummary {
  slug: string;
  title: string;
  total: number;
  done: number;
  inProgress: number;
  toDo: number;
}

export function getMemberInitiativeTaskSummaries(
  initiatives: Initiative[],
  memberTasks: FlatTask[]
): MemberInitiativeTaskSummary[] {
  return initiatives
    .map((initiative) => {
      const tasks = memberTasks.filter((task) => task.initiativeSlug === initiative.slug);
      if (tasks.length === 0) {
        return null;
      }

      return {
        slug: initiative.slug,
        title: initiative.title,
        total: tasks.length,
        done: tasks.filter((task) => task.status === "Done").length,
        inProgress: tasks.filter((task) => task.status === "In Progress").length,
        toDo: tasks.filter(
          (task) => task.status === "To Do" || (!task.status.trim() && task.description.trim())
        ).length,
      };
    })
    .filter((entry): entry is MemberInitiativeTaskSummary => entry !== null);
}
