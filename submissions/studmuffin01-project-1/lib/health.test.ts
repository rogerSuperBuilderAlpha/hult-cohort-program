import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  calculateDueDateHealthPercent,
  getInitiativeHealthFromTasks,
  getOverallHealth,
  INITIATIVE_DEADLINE_PENALTY_CAP,
} from "@/lib/health";
import type { TaskRow } from "@/lib/initiativeTasks";

function task(overrides: Partial<TaskRow> = {}): TaskRow {
  return {
    id: "task-1",
    taskNumber: "1",
    description: "Work item",
    status: "To Do",
    dateDue: "",
    responsibility: "",
    comments: "",
    ...overrides,
  };
}

describe("getOverallHealth", () => {
  it("maps completion percent to green, orange, and red bands", () => {
    expect(getOverallHealth(80)).toBe("green");
    expect(getOverallHealth(79.9)).toBe("orange");
    expect(getOverallHealth(40)).toBe("orange");
    expect(getOverallHealth(39.9)).toBe("red");
  });
});

describe("calculateDueDateHealthPercent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 22, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 for empty task lists", () => {
    expect(calculateDueDateHealthPercent([])).toBe(0);
    expect(calculateDueDateHealthPercent(undefined)).toBe(0);
  });

  it("treats done tasks as on schedule", () => {
    const percent = calculateDueDateHealthPercent([
      task({ status: "Done", dateDue: "2026-07-01" }),
    ]);
    expect(percent).toBe(100);
    expect(getInitiativeHealthFromTasks([task({ status: "Done", dateDue: "2026-07-01" })])).toBe(
      "green"
    );
  });

  it("penalizes open tasks past due date", () => {
    const percent = calculateDueDateHealthPercent([
      task({ status: "To Do", dateDue: "2026-07-20" }),
    ]);
    expect(percent).toBe(0);
    expect(getInitiativeHealthFromTasks([task({ status: "To Do", dateDue: "2026-07-20" })])).toBe(
      "red"
    );
  });

  it("caps health when initiative deadline passed with open work", () => {
    const tasks = [
      task({ status: "To Do", dateDue: "2026-07-18" }),
      task({ id: "task-2", taskNumber: "2", status: "In Progress", dateDue: "2026-07-20" }),
    ];
    const percent = calculateDueDateHealthPercent(tasks);
    expect(percent).toBeLessThanOrEqual(INITIATIVE_DEADLINE_PENALTY_CAP);
    expect(getInitiativeHealthFromTasks(tasks)).toBe("red");
  });
});
