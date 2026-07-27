/**
 * Overall health indicator for initiatives.
 *
 * Executive Summary uses task due dates plus the initiative deadline
 * (furthest task due date) — see calculateDueDateHealthPercent.
 */

import { getLatestTaskDueDate, parseDueDate, startOfToday } from "@/lib/initiativeDeadlines";
import {
  calculateInitiativeTaskPercent,
  type InitiativeTasks,
  type TaskRow,
} from "@/lib/initiativeTasks";

export type HealthStatus = "red" | "orange" | "green";

export interface HealthColor {
  fill: string;
  ring: string;
}

export const HEALTH_LEGEND_DEFINITIONS: {
  status: HealthStatus;
  range: string;
  label: string;
}[] = [
  { status: "green", range: "≥80%", label: "On schedule" },
  { status: "orange", range: "≥40%", label: "At risk" },
  { status: "red", range: "<40%", label: "Overdue" },
];

export const healthColors: Record<HealthStatus, HealthColor> = {
  green: { fill: "#22C55E", ring: "#86EFAC" },
  orange: { fill: "#FB923C", ring: "#FED7AA" },
  red: { fill: "#991B1B", ring: "#FECACA" },
};

export const healthLabels: Record<HealthStatus, string> = {
  red: "Overdue",
  orange: "At risk",
  green: "On schedule",
};

/** Cap applied when the initiative deadline has passed and work remains open. */
export const INITIATIVE_DEADLINE_PENALTY_CAP = 39.9;

export function healthIndicatorStyle(status: HealthStatus): {
  backgroundColor: string;
  boxShadow: string;
} {
  const { fill, ring } = healthColors[status];
  return {
    backgroundColor: fill,
    boxShadow: `0 0 0 2px ${ring}`,
  };
}

export function getOverallHealth(percent: number): HealthStatus {
  if (percent >= 80) return "green";
  if (percent >= 40) return "orange";
  return "red";
}

function taskHasEvaluableContent(task: TaskRow): boolean {
  return (
    task.description.trim().length > 0 ||
    task.status.trim().length > 0 ||
    task.dateDue.trim().length > 0
  );
}

function hasOpenEvaluableTasks(tasks: InitiativeTasks): boolean {
  return tasks.some((task) => taskHasEvaluableContent(task) && task.status !== "Done");
}

function calculateTaskLevelDueDatePercent(tasks: InitiativeTasks): number {
  const today = startOfToday();
  let onSchedule = 0;
  let evaluated = 0;

  for (const task of tasks) {
    if (!taskHasEvaluableContent(task)) {
      continue;
    }

    if (task.status === "Done") {
      evaluated += 1;
      onSchedule += 1;
      continue;
    }

    const dueDate = parseDueDate(task.dateDue);
    if (!dueDate) {
      continue;
    }

    evaluated += 1;
    if (dueDate.getTime() >= today.getTime()) {
      onSchedule += 1;
    }
  }

  if (evaluated === 0) {
    return calculateInitiativeTaskPercent(tasks);
  }

  return Math.round((onSchedule / evaluated) * 1000) / 10;
}

/**
 * Due-date health score (0–100) for an initiative.
 *
 * **Task level:** Done = on schedule; open tasks with due dates must be today or later.
 *
 * **Initiative level:** The initiative deadline is the furthest task due date. When today
 * is past that date and incomplete work remains, the score is capped at
 * `INITIATIVE_DEADLINE_PENALTY_CAP` (forces Overdue unless all work is done).
 */
export function calculateDueDateHealthPercent(tasks: InitiativeTasks | undefined): number {
  if (!tasks || tasks.length === 0) {
    return 0;
  }

  const taskPercent = calculateTaskLevelDueDatePercent(tasks);
  const initiativeDeadline = getLatestTaskDueDate(tasks);

  if (!initiativeDeadline) {
    return taskPercent;
  }

  const deadlineDate = parseDueDate(initiativeDeadline);
  if (!deadlineDate) {
    return taskPercent;
  }

  const today = startOfToday();

  if (deadlineDate.getTime() >= today.getTime()) {
    return taskPercent;
  }

  if (!hasOpenEvaluableTasks(tasks)) {
    return 100;
  }

  return Math.min(taskPercent, INITIATIVE_DEADLINE_PENALTY_CAP);
}

export function getInitiativeHealthFromTasks(tasks: InitiativeTasks | undefined): HealthStatus {
  return getOverallHealth(calculateDueDateHealthPercent(tasks));
}
