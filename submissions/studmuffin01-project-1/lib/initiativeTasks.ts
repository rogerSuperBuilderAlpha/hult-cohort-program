/**
 * Per-initiative task table types, defaults, and localStorage helpers.
 */

import { getAllInitiativeSlugs } from "@/lib/initiatives";

export const INITIAL_TASK_ROW_COUNT = 3;
export const INITIATIVE_TASKS_STORAGE_KEY = "initiara-initiative-tasks";
export const MAX_INITIATIVE_TASKS_STORAGE_BYTES = 1_000_000;

export const TASK_STATUS_OPTIONS = ["To Do", "In Progress", "Done"] as const;
export type TaskStatus = (typeof TASK_STATUS_OPTIONS)[number];

export const TASK_FIELD_MAX_LENGTH = {
  description: 500,
  status: 120,
  dateDue: 32,
  /** Stored as `responsibility`; shown in UI as Assignee until member picker (Phase B). */
  responsibility: 120,
  comments: 500,
} as const;

export type TaskField = keyof typeof TASK_FIELD_MAX_LENGTH;

export interface TaskRow {
  id: string;
  taskNumber: string;
  description: string;
  status: string;
  dateDue: string;
  responsibility: string;
  comments: string;
}

export type InitiativeTasks = TaskRow[];
export type AllInitiativeTasks = Record<string, InitiativeTasks>;

function createTaskRowId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createTaskRow(taskNumber: string): TaskRow {
  return {
    id: createTaskRowId(),
    taskNumber,
    description: "",
    status: "",
    dateDue: "",
    responsibility: "",
    comments: "",
  };
}

export function createDefaultTaskRows(count = INITIAL_TASK_ROW_COUNT): InitiativeTasks {
  return Array.from({ length: count }, (_, index) => createTaskRow(String(index + 1)));
}

/** Zero-based depth from the task number hierarchy (e.g. "2.3.1" -> 2). */
export function getTaskNumberDepth(taskNumber: string): number {
  return taskNumber.split(".").length - 1;
}

export function compareTaskNumbers(a: string, b: string): number {
  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);
  const length = Math.max(aParts.length, bParts.length);

  for (let index = 0; index < length; index++) {
    const aPart = aParts[index] ?? 0;
    const bPart = bParts[index] ?? 0;
    if (aPart !== bPart) {
      return aPart - bPart;
    }
  }

  return 0;
}

export function getDirectChildren(parentTaskNumber: string, rows: InitiativeTasks): TaskRow[] {
  const prefix = `${parentTaskNumber}.`;

  return rows.filter((row) => {
    if (!row.taskNumber.startsWith(prefix)) {
      return false;
    }

    const suffix = row.taskNumber.slice(prefix.length);
    return /^\d+$/.test(suffix);
  });
}

export function renumberTasks(rows: InitiativeTasks): InitiativeTasks {
  let topLevelCounter = 0;
  const childCounters = new Map<string, number>();
  const numberAtDepth = new Map<number, string>();

  return rows.map((row) => {
    const depth = getTaskNumberDepth(row.taskNumber);

    if (depth === 0) {
      topLevelCounter += 1;
      const newNumber = String(topLevelCounter);
      numberAtDepth.clear();
      childCounters.clear();
      numberAtDepth.set(0, newNumber);
      return { ...row, taskNumber: newNumber };
    }

    const parentNumber = numberAtDepth.get(depth - 1);
    if (!parentNumber) {
      topLevelCounter += 1;
      const newNumber = String(topLevelCounter);
      numberAtDepth.clear();
      childCounters.clear();
      numberAtDepth.set(0, newNumber);
      return { ...row, taskNumber: newNumber };
    }

    const nextChild = (childCounters.get(parentNumber) ?? 0) + 1;
    childCounters.set(parentNumber, nextChild);
    const newNumber = `${parentNumber}.${nextChild}`;

    for (const depthKey of [...numberAtDepth.keys()]) {
      if (depthKey >= depth) {
        numberAtDepth.delete(depthKey);
      }
    }
    numberAtDepth.set(depth, newNumber);

    return { ...row, taskNumber: newNumber };
  });
}

export function getNextSubTaskNumber(parentTaskNumber: string, rows: InitiativeTasks): string {
  const directChildren = getDirectChildren(parentTaskNumber, rows);

  if (directChildren.length === 0) {
    return `${parentTaskNumber}.1`;
  }

  const maxSuffix = Math.max(
    ...directChildren.map((row) => Number(row.taskNumber.slice(parentTaskNumber.length + 1)))
  );

  return `${parentTaskNumber}.${maxSuffix + 1}`;
}

export function findLastIndexInSubtree(rootTaskNumber: string, rows: InitiativeTasks): number {
  let lastIndex = -1;

  for (let index = 0; index < rows.length; index++) {
    const taskNumber = rows[index].taskNumber;
    if (taskNumber === rootTaskNumber || taskNumber.startsWith(`${rootTaskNumber}.`)) {
      lastIndex = index;
    }
  }

  return lastIndex;
}

export function findInsertIndexForSubTask(parentTaskNumber: string, rows: InitiativeTasks): number {
  const parentIndex = rows.findIndex((row) => row.taskNumber === parentTaskNumber);
  if (parentIndex === -1) {
    return rows.length - 1;
  }

  const directChildren = getDirectChildren(parentTaskNumber, rows);
  if (directChildren.length === 0) {
    return parentIndex;
  }

  const lastDirectChild = [...directChildren].sort((a, b) => compareTaskNumbers(a.taskNumber, b.taskNumber)).at(-1)!;
  return findLastIndexInSubtree(lastDirectChild.taskNumber, rows);
}

export function getNextTopLevelTaskNumber(rows: InitiativeTasks): string {
  const topLevelRows = rows.filter((row) => !row.taskNumber.includes("."));

  if (topLevelRows.length === 0) {
    return "1";
  }

  const maxTopLevel = Math.max(...topLevelRows.map((row) => Number(row.taskNumber)));
  return String(maxTopLevel + 1);
}

export function taskNumberExists(rows: InitiativeTasks, taskNumber: string): boolean {
  return rows.some((row) => row.taskNumber === taskNumber);
}

export function insertSubTask(rows: InitiativeTasks, parentTaskNumber: string): InitiativeTasks {
  const insertIndex = findInsertIndexForSubTask(parentTaskNumber, rows) + 1;
  const newRow = createTaskRow(getNextSubTaskNumber(parentTaskNumber, rows));
  const nextRows = [...rows];
  nextRows.splice(insertIndex, 0, newRow);
  return nextRows;
}

export function appendTopLevelTask(rows: InitiativeTasks): InitiativeTasks {
  return [...rows, createTaskRow(getNextTopLevelTaskNumber(rows))];
}

export function deleteTaskByNumber(rows: InitiativeTasks, taskNumber: string): InitiativeTasks | null {
  if (!taskNumberExists(rows, taskNumber)) {
    return null;
  }

  const filteredRows = rows.filter(
    (row) => row.taskNumber !== taskNumber && !row.taskNumber.startsWith(`${taskNumber}.`)
  );

  if (filteredRows.length === 0 || filteredRows.length === rows.length) {
    return null;
  }

  return renumberTasks(filteredRows);
}

function normalizeTaskNumbers(rows: InitiativeTasks): InitiativeTasks {
  return renumberTasks(
    rows.map((row, index) => ({
      ...row,
      taskNumber: row.taskNumber?.trim() || String(index + 1),
    }))
  );
}

export function sanitizeTaskStatus(value: string): TaskStatus | "" {
  return TASK_STATUS_OPTIONS.includes(value as TaskStatus) ? (value as TaskStatus) : "";
}

export function sanitizeTaskField(field: TaskField, value: string): string {
  if (field === "status") {
    return sanitizeTaskStatus(value);
  }

  return value.slice(0, TASK_FIELD_MAX_LENGTH[field]);
}

function rowHasContent(row: TaskRow): boolean {
  return (
    row.description.trim().length > 0 ||
    row.status.trim().length > 0 ||
    row.dateDue.trim().length > 0 ||
    row.responsibility.trim().length > 0 ||
    row.comments.trim().length > 0
  );
}

/** Share of task rows with at least one filled field (one decimal place). */
export function calculateInitiativeTaskPercent(tasks: InitiativeTasks | undefined): number {
  if (!tasks || tasks.length === 0) {
    return 0;
  }

  const filledRows = tasks.filter(rowHasContent).length;
  return Math.round((filledRows / tasks.length) * 1000) / 10;
}

function parseTaskRow(value: unknown, fallbackTaskNumber: string): TaskRow | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const row = value as Record<string, unknown>;
  const id = typeof row.id === "string" && row.id.trim().length > 0 ? row.id.trim() : createTaskRowId();
  const taskNumber =
    typeof row.taskNumber === "string" && row.taskNumber.trim().length > 0
      ? row.taskNumber.trim()
      : fallbackTaskNumber;

  return {
    id,
    taskNumber,
    description:
      typeof row.description === "string"
        ? sanitizeTaskField("description", row.description)
        : "",
    status: typeof row.status === "string" ? sanitizeTaskStatus(row.status) : "",
    dateDue: typeof row.dateDue === "string" ? sanitizeTaskField("dateDue", row.dateDue) : "",
    responsibility:
      typeof row.responsibility === "string"
        ? sanitizeTaskField("responsibility", row.responsibility)
        : "",
    comments: typeof row.comments === "string" ? sanitizeTaskField("comments", row.comments) : "",
  };
}

export function parseInitiativeTasks(raw: unknown): AllInitiativeTasks {
  if (typeof raw !== "object" || raw === null) {
    return {};
  }

  const validSlugs = getAllInitiativeSlugs();
  const parsed: AllInitiativeTasks = {};

  for (const [slug, taskRows] of Object.entries(raw)) {
    if (!validSlugs.has(slug) || !Array.isArray(taskRows)) {
      continue;
    }

    const rows: InitiativeTasks = [];

    taskRows.forEach((rowValue, index) => {
      const row = parseTaskRow(rowValue, String(index + 1));
      if (row) {
        rows.push(row);
      }
    });

    if (rows.length > 0) {
      parsed[slug] = normalizeTaskNumbers(rows);
    }
  }

  return parsed;
}

export function loadInitiativeTasks(): AllInitiativeTasks {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(INITIATIVE_TASKS_STORAGE_KEY);
    if (!raw) return {};
    if (raw.length > MAX_INITIATIVE_TASKS_STORAGE_BYTES) return {};
    return parseInitiativeTasks(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function saveInitiativeTasks(tasks: AllInitiativeTasks): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const serialized = JSON.stringify(tasks);
    if (serialized.length > MAX_INITIATIVE_TASKS_STORAGE_BYTES) return;
    localStorage.setItem(INITIATIVE_TASKS_STORAGE_KEY, serialized);
  } catch {
    // Ignore quota or serialization errors.
  }
}

export function getInitiativeTasks(
  allTasks: AllInitiativeTasks,
  initiativeSlug: string
): InitiativeTasks {
  return allTasks[initiativeSlug] ?? createDefaultTaskRows();
}
