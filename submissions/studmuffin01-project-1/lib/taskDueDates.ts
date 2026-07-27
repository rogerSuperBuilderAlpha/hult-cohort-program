/**
 * Sub-task due date roll-up (parent deadline extends to match latest child, Asana/Monday-style).
 */

import { formatDeadlineDisplay, parseDueDate, toIsoDateString } from "@/lib/initiativeDeadlines";
import type { InitiativeTasks, TaskRow } from "@/lib/initiativeTasks";
import { getTaskNumberDepth } from "@/lib/initiativeTasks";

export interface DueDateRollupAdjustment {
  parentTaskNumber: string;
  previousDueDate: string | null;
  newDueDate: string;
}

export interface DueDateRollupResult {
  rows: InitiativeTasks;
  adjustments: DueDateRollupAdjustment[];
  /** True when a sub-task due date exceeds its immediate parent. */
  hasConflict: boolean;
}

export function getParentTaskNumber(taskNumber: string): string | null {
  const parts = taskNumber.split(".");
  if (parts.length <= 1) {
    return null;
  }

  return parts.slice(0, -1).join(".");
}

function getDescendantRows(rows: InitiativeTasks, rootTaskNumber: string): TaskRow[] {
  const prefix = `${rootTaskNumber}.`;
  return rows.filter((row) => row.taskNumber.startsWith(prefix));
}

function getLatestDueDateInRows(rows: TaskRow[]): string | null {
  let latestIso: string | null = null;
  let latestTime = Number.NEGATIVE_INFINITY;

  for (const row of rows) {
    const iso = toIsoDateString(row.dateDue);
    if (!iso) {
      continue;
    }

    const date = parseDueDate(iso);
    if (!date) {
      continue;
    }

    const time = date.getTime();
    if (time > latestTime) {
      latestTime = time;
      latestIso = iso;
    }
  }

  return latestIso;
}

function formatDueDateLabel(isoDate: string | null): string {
  if (!isoDate) {
    return "no due date";
  }

  return formatDeadlineDisplay(isoDate);
}

/** Compact copy for the inline due-date warning popover. */
export function buildDueDateConfirmMessage(
  subTaskNumber: string,
  parentTaskNumber: string,
  subTaskDueDate: string,
  parentDueDate: string | null,
  adjustments: DueDateRollupAdjustment[]
): string {
  const subLabel = formatDueDateLabel(toIsoDateString(subTaskDueDate));
  const parentLabel = formatDueDateLabel(parentDueDate);
  const immediateAdjustment = adjustments.find(
    (adjustment) => adjustment.parentTaskNumber === parentTaskNumber
  );
  const newParentLabel = immediateAdjustment
    ? formatDueDateLabel(immediateAdjustment.newDueDate)
    : subLabel;

  const ancestorNote =
    adjustments.length > 1 ? " Ancestor dates will also extend." : "";

  return `Task ${subTaskNumber} is due ${subLabel}, after parent ${parentTaskNumber} (${parentLabel}). Keeping it adjusts the parent to ${newParentLabel}.${ancestorNote}`;
}

/**
 * When a task due date changes, walk up the hierarchy and extend any parent whose
 * due date is earlier than the latest descendant due date.
 */
export function applyDueDateRollup(
  rows: InitiativeTasks,
  changedTaskNumber: string
): DueDateRollupResult {
  const changedIso = toIsoDateString(
    rows.find((row) => row.taskNumber === changedTaskNumber)?.dateDue ?? ""
  );

  if (!changedIso || getTaskNumberDepth(changedTaskNumber) === 0) {
    return { rows, adjustments: [], hasConflict: false };
  }

  const immediateParentNumber = getParentTaskNumber(changedTaskNumber);
  if (!immediateParentNumber) {
    return { rows, adjustments: [], hasConflict: false };
  }

  const immediateParentRow = rows.find((row) => row.taskNumber === immediateParentNumber);
  const immediateParentPreviousDue = immediateParentRow
    ? toIsoDateString(immediateParentRow.dateDue)
    : null;
  const immediateParentDate = immediateParentPreviousDue
    ? parseDueDate(immediateParentPreviousDue)
    : null;
  const changedDate = parseDueDate(changedIso);

  if (
    !changedDate ||
    (immediateParentDate && changedDate.getTime() <= immediateParentDate.getTime())
  ) {
    return { rows, adjustments: [], hasConflict: false };
  }

  let nextRows = [...rows];
  const adjustments: DueDateRollupAdjustment[] = [];
  let parentNumber: string | null = immediateParentNumber;

  while (parentNumber) {
    const parentIndex = nextRows.findIndex((row) => row.taskNumber === parentNumber);
    if (parentIndex === -1) {
      break;
    }

    const descendants = getDescendantRows(nextRows, parentNumber);
    const latestDescendantDue = getLatestDueDateInRows(descendants);
    if (!latestDescendantDue) {
      break;
    }

    const parentRow = nextRows[parentIndex];
    const parentDueIso = toIsoDateString(parentRow.dateDue);
    const parentDueDate = parentDueIso ? parseDueDate(parentDueIso) : null;
    const latestDate = parseDueDate(latestDescendantDue);

    if (latestDate && (!parentDueDate || latestDate.getTime() > parentDueDate.getTime())) {
      adjustments.push({
        parentTaskNumber: parentNumber,
        previousDueDate: parentDueIso,
        newDueDate: latestDescendantDue,
      });

      nextRows[parentIndex] = {
        ...parentRow,
        dateDue: latestDescendantDue,
      };
    }

    parentNumber = getParentTaskNumber(parentNumber);
  }

  return {
    rows: nextRows,
    adjustments,
    hasConflict: adjustments.length > 0,
  };
}
