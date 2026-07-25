/**
 * Executive Summary roll-ups from Initiative Summary task tables.
 */

import { parseDueDate, startOfToday } from "@/lib/initiativeDeadlines";
import type { InitiativeTasks, TaskRow } from "@/lib/initiativeTasks";

export interface InitiativeTaskMetrics {
  /** Tasks with at least one field filled in. */
  activeTaskCount: number;
  doneCount: number;
  openCount: number;
  overdueCount: number;
  /** Share of active tasks marked Done (one decimal place). */
  donePercent: number;
}

export function taskRowHasContent(row: TaskRow): boolean {
  return (
    row.description.trim().length > 0 ||
    row.status.trim().length > 0 ||
    row.dateDue.trim().length > 0 ||
    row.responsibility.trim().length > 0 ||
    row.comments.trim().length > 0
  );
}

export function isOpenTask(row: TaskRow): boolean {
  return taskRowHasContent(row) && row.status !== "Done";
}

export function isOverdueOpenTask(row: TaskRow): boolean {
  if (!isOpenTask(row) || !row.dateDue.trim()) {
    return false;
  }

  const dueDate = parseDueDate(row.dateDue);
  if (!dueDate) {
    return false;
  }

  return dueDate.getTime() < startOfToday().getTime();
}

export function getInitiativeTaskMetrics(tasks: InitiativeTasks | undefined): InitiativeTaskMetrics {
  const activeTasks = (tasks ?? []).filter(taskRowHasContent);
  const doneCount = activeTasks.filter((task) => task.status === "Done").length;
  const openCount = activeTasks.length - doneCount;
  const overdueCount = activeTasks.filter(isOverdueOpenTask).length;
  const donePercent =
    activeTasks.length > 0 ? Math.round((doneCount / activeTasks.length) * 1000) / 10 : 0;

  return {
    activeTaskCount: activeTasks.length,
    doneCount,
    openCount,
    overdueCount,
    donePercent,
  };
}

export interface InitiativeOwnerDisplay {
  label: string;
  /** Full assignee list for tooltips when label is abbreviated. */
  detail?: string;
  isUnassigned: boolean;
  isMultiple: boolean;
}

/** Distinct assignees on open tasks, or on all active tasks when none are open. */
export function getInitiativeOwnerDisplay(
  tasks: InitiativeTasks | undefined
): InitiativeOwnerDisplay {
  const openTasks = (tasks ?? []).filter(isOpenTask);
  const pool = openTasks.length > 0 ? openTasks : (tasks ?? []).filter(taskRowHasContent);
  const counts = new Map<string, number>();

  for (const task of pool) {
    const name = task.responsibility.trim();
    if (!name) {
      continue;
    }

    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  if (counts.size === 0) {
    return { label: "Unassigned", isUnassigned: true, isMultiple: false };
  }

  const ranked = [...counts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }

    return a[0].localeCompare(b[0]);
  });

  const formatEntry = ([name, count]: [string, number]) => `${name} (${count})`;

  if (ranked.length === 1) {
    const [name, count] = ranked[0];
    return {
      label: name,
      detail: formatEntry([name, count]),
      isUnassigned: false,
      isMultiple: false,
    };
  }

  return {
    label: "Multiple",
    detail: ranked.map(formatEntry).join(", "),
    isUnassigned: false,
    isMultiple: true,
  };
}
