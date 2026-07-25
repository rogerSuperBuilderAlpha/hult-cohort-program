import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { isTaskOverdue, getActionItems } from "@/lib/sidebarStats";
import type { FlatTask } from "@/lib/sidebarStats";

function flatTask(overrides: Partial<FlatTask> = {}): FlatTask {
  return {
    id: "task-1",
    taskNumber: "1",
    description: "Work item",
    status: "To Do",
    dateDue: "",
    responsibility: "Alex",
    comments: "",
    initiativeSlug: "alpha",
    initiativeTitle: "Alpha",
    ...overrides,
  };
}

describe("isTaskOverdue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 22, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false when due date is empty, task is done, or date is invalid", () => {
    expect(isTaskOverdue(flatTask())).toBe(false);
    expect(isTaskOverdue(flatTask({ dateDue: "2026-07-25" }))).toBe(false);
    expect(isTaskOverdue(flatTask({ dateDue: "2026-07-20", status: "Done" }))).toBe(false);
    expect(isTaskOverdue(flatTask({ dateDue: "not-a-date" }))).toBe(false);
  });

  it("returns true when an open task due date is before today", () => {
    expect(isTaskOverdue(flatTask({ dateDue: "2026-07-20", status: "In Progress" }))).toBe(true);
  });
});

describe("getActionItems", () => {
  it("includes only open tasks and sorts overdue items first", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 22, 12, 0, 0));

    const items = getActionItems([
      flatTask({ id: "a", status: "To Do", dateDue: "2026-07-25", description: "Future" }),
      flatTask({ id: "b", status: "Done", dateDue: "2026-07-01", description: "Done" }),
      flatTask({ id: "c", status: "In Progress", dateDue: "2026-07-10", description: "Late" }),
    ]);

    expect(items.map((item) => item.id)).toEqual(["c", "a"]);
    vi.useRealTimers();
  });
});
