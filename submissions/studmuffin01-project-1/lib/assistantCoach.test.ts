import { describe, expect, it } from "vitest";
import { answerPortfolioQuestion } from "@/lib/assistantCoach";
import type { PortfolioSnapshot } from "@/lib/assistantPortfolioContext";

const emptySnapshot: PortfolioSnapshot = {
  initiativeCount: 0,
  memberCount: 0,
  totalOpenTasks: 0,
  totalOverdueTasks: 0,
  totalDoneTasks: 0,
  initiatives: [],
  overdueTasks: [],
  prioritizedTasks: [],
  memberWorkloads: [],
  topPerformers: [],
  statusBreakdown: [],
};

describe("answerPortfolioQuestion", () => {
  it("handles empty portfolio", () => {
    const answer = answerPortfolioQuestion("Summarize my portfolio", emptySnapshot);
    expect(answer.toLowerCase()).toContain("initiative");
  });

  it("detects overdue intent", () => {
    const answer = answerPortfolioQuestion("What's overdue?", {
      ...emptySnapshot,
      totalOverdueTasks: 2,
      overdueTasks: [
        {
          description: "Task A",
          initiativeTitle: "Init 1",
          assignee: "John",
          status: "To Do",
          dueDate: "2026-01-01",
        },
      ],
    });
    expect(answer).toContain("2 overdue");
  });
});
