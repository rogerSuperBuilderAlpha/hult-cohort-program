import type { InitiativeTasks, TaskStatus } from "@/lib/initiativeTasks";
import { TASK_STATUS_OPTIONS } from "@/lib/initiativeTasks";

export interface TaskFilters {
  status: TaskStatus | "";
  assignee: string;
  initiativeSlug: string;
}

export const EMPTY_TASK_FILTERS: TaskFilters = {
  status: "",
  assignee: "",
  initiativeSlug: "",
};

export function filterTaskRows(rows: InitiativeTasks, filters: TaskFilters): InitiativeTasks {
  return rows.filter((row) => {
    if (filters.status && row.status !== filters.status) {
      return false;
    }

    if (filters.assignee && row.responsibility !== filters.assignee) {
      return false;
    }

    return true;
  });
}

export function hasActiveTaskFilters(filters: TaskFilters): boolean {
  return Boolean(filters.status || filters.assignee || filters.initiativeSlug);
}

export const TASK_FILTER_STATUS_OPTIONS = ["", ...TASK_STATUS_OPTIONS] as const;
