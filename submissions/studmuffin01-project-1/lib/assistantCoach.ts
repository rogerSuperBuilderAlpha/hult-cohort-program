/**
 * Context-aware portfolio coach — answers questions from a PortfolioSnapshot.
 */

import type {
  PortfolioInitiativeSummary,
  PortfolioSnapshot,
  PortfolioTaskSummary,
} from "@/lib/assistantPortfolioContext";

export const ASSISTANT_SUGGESTED_PROMPTS = [
  "What's overdue?",
  "What should I focus on?",
  "Summarize my portfolio",
  "Who has the most open work?",
] as const;

type AssistantIntent =
  | "help"
  | "overdue"
  | "prioritize"
  | "workload"
  | "summarize"
  | "performers"
  | "initiative"
  | "member";

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function includesAny(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => text.includes(phrase));
}

function detectIntent(query: string, snapshot: PortfolioSnapshot): AssistantIntent {
  const text = normalizeQuery(query);

  if (
    includesAny(text, ["help", "what can you", "how do you", "what do you", "what questions"])
  ) {
    return "help";
  }

  if (includesAny(text, ["overdue", "past due", "late task", "behind schedule"])) {
    return "overdue";
  }

  if (
    includesAny(text, [
      "focus",
      "priorit",
      "next",
      "should i work",
      "what to do",
      "urgent",
      "tackle first",
    ])
  ) {
    return "prioritize";
  }

  if (
    includesAny(text, [
      "workload",
      "open work",
      "most task",
      "overloaded",
      "who has",
      "busiest",
      "capacity",
    ])
  ) {
    return "workload";
  }

  if (
    includesAny(text, ["top performer", "completed", "done most", "leaderboard", "finished most"])
  ) {
    return "performers";
  }

  if (
    includesAny(text, [
      "summarize",
      "summary",
      "overview",
      "portfolio",
      "status update",
      "how am i doing",
      "how are we doing",
    ])
  ) {
    return "summarize";
  }

  const matchedInitiative = findMatchingInitiative(text, snapshot.initiatives);
  if (matchedInitiative) {
    return "initiative";
  }

  const matchedMember = findMatchingMember(text, snapshot.memberWorkloads.map((entry) => entry.name));
  if (
    matchedMember &&
    includesAny(text, ["member", "assign", "task", "progress", "work", "status"])
  ) {
    return "member";
  }

  if (matchedMember) {
    return "member";
  }

  return "summarize";
}

function findMatchingInitiative(
  text: string,
  initiatives: PortfolioInitiativeSummary[]
): PortfolioInitiativeSummary | null {
  let best: PortfolioInitiativeSummary | null = null;
  let bestLength = 0;

  for (const initiative of initiatives) {
    const title = initiative.title.toLowerCase();
    if (title.length >= 3 && text.includes(title) && title.length > bestLength) {
      best = initiative;
      bestLength = title.length;
    }
  }

  return best;
}

function findMatchingMember(text: string, memberNames: string[]): string | null {
  let best: string | null = null;
  let bestLength = 0;

  for (const name of memberNames) {
    const normalized = name.toLowerCase();
    if (normalized.length >= 2 && text.includes(normalized) && normalized.length > bestLength) {
      best = name;
      bestLength = normalized.length;
    }
  }

  return best;
}

function formatTaskLine(task: PortfolioTaskSummary, index?: number): string {
  const prefix = index === undefined ? "•" : `${index + 1}.`;
  return `${prefix} ${task.description} (${task.initiativeTitle}) — ${task.assignee}, ${task.status}, due ${task.dueDate}`;
}

function formatInitiativeLine(initiative: PortfolioInitiativeSummary): string {
  return `• ${initiative.title}: ${initiative.progressPercent}% done, ${initiative.openTasks} open, ${initiative.overdueTasks} overdue, health ${initiative.healthLabel}, deadline ${initiative.deadline}, owner ${initiative.ownerLabel}`;
}

function answerHelp(): string {
  return [
    "I read your initiatives, tasks, assignees, and health metrics to answer quick portfolio questions.",
    "",
    "Try asking:",
    "• What's overdue?",
    "• What should I focus on this week?",
    "• Summarize my portfolio",
    "• Who has the most open work?",
    "• How is Power System Upgrade doing?",
    "• What's on John's plate?",
  ].join("\n");
}

function answerOverdue(snapshot: PortfolioSnapshot): string {
  if (snapshot.totalOverdueTasks === 0) {
    return "Good news — no overdue open tasks right now. Check Action Items for work still in To Do or In Progress.";
  }

  const lines = [
    `You have ${snapshot.totalOverdueTasks} overdue open task${snapshot.totalOverdueTasks === 1 ? "" : "s"} across ${snapshot.initiativeCount} initiative${snapshot.initiativeCount === 1 ? "" : "s"}.`,
    "",
    "Most urgent:",
    ...snapshot.overdueTasks.slice(0, 5).map((task, index) => formatTaskLine(task, index)),
  ];

  if (snapshot.overdueTasks.length > 5) {
    lines.push(`…and ${snapshot.overdueTasks.length - 5} more. Open Action Items for the full list.`);
  }

  return lines.join("\n");
}

function answerPrioritize(snapshot: PortfolioSnapshot): string {
  if (snapshot.prioritizedTasks.length === 0) {
    return "No open action items yet. Add tasks in Initiative Summary or create a new initiative to get started.";
  }

  const overdueFirst = snapshot.prioritizedTasks.filter((task) =>
    snapshot.overdueTasks.some(
      (overdue) =>
        overdue.description === task.description &&
        overdue.initiativeTitle === task.initiativeTitle
    )
  );

  const lines = [
    "Start with overdue work, then nearest due dates:",
    "",
    ...(overdueFirst.length > 0
      ? ["Overdue:", ...overdueFirst.slice(0, 3).map((task) => formatTaskLine(task)), ""]
      : []),
    "Next up:",
    ...snapshot.prioritizedTasks.slice(0, 5).map((task, index) => formatTaskLine(task, index)),
  ];

  if (snapshot.initiatives.some((initiative) => initiative.healthLabel === "Overdue")) {
    lines.push(
      "",
      "Initiatives in Overdue health need attention on remaining due dates or scope."
    );
  }

  return lines.join("\n");
}

function answerWorkload(snapshot: PortfolioSnapshot): string {
  const withOpenWork = snapshot.memberWorkloads.filter((entry) => entry.openTasks > 0);

  if (withOpenWork.length === 0) {
    return "No open assigned tasks yet. Assign work from Initiative Summary once tasks are created.";
  }

  const leader = withOpenWork[0];
  const lines = [
    `${leader.name} has the most open work (${leader.openTasks} task${leader.openTasks === 1 ? "" : "s"}, ${leader.overdueTasks} overdue).`,
    "",
    "Open tasks by team member:",
    ...withOpenWork.slice(0, 6).map(
      (entry) =>
        `• ${entry.name}: ${entry.openTasks} open, ${entry.overdueTasks} overdue, ${entry.doneTasks} done`
    ),
  ];

  const overloaded = withOpenWork.filter((entry) => entry.openTasks >= 4);
  if (overloaded.length > 1) {
    lines.push("", "Several members carry heavy loads — consider rebalancing assignees.");
  }

  return lines.join("\n");
}

function answerPerformers(snapshot: PortfolioSnapshot): string {
  if (snapshot.topPerformers.length === 0) {
    return "No completed assigned tasks yet. Mark tasks Done in Initiative Summary to populate Top Performers.";
  }

  return [
    "Top performers by completed assigned tasks:",
    ...snapshot.topPerformers.slice(0, 5).map(
      (entry, index) => `${index + 1}. ${entry.name} — ${entry.count} completed`
    ),
  ].join("\n");
}

function answerSummarize(snapshot: PortfolioSnapshot): string {
  if (snapshot.initiativeCount === 0) {
    return "You don't have any active initiatives yet. Use Start New Initiative to create your first project, then add tasks on the dashboard.";
  }

  const worstHealth = snapshot.initiatives.filter((entry) => entry.healthLabel === "Overdue");
  const atRisk = snapshot.initiatives.filter((entry) => entry.healthLabel === "At risk");

  const lines = [
    `Portfolio snapshot: ${snapshot.initiativeCount} initiative${snapshot.initiativeCount === 1 ? "" : "s"}, ${snapshot.totalOpenTasks} open task${snapshot.totalOpenTasks === 1 ? "" : "s"}, ${snapshot.totalOverdueTasks} overdue, ${snapshot.totalDoneTasks} done.`,
    "",
    "Initiatives:",
    ...snapshot.initiatives.slice(0, 5).map((initiative) => formatInitiativeLine(initiative)),
  ];

  if (snapshot.statusBreakdown.length > 0) {
    lines.push(
      "",
      "Task status mix:",
      ...snapshot.statusBreakdown.map((entry) => `• ${entry.status}: ${entry.count}`)
    );
  }

  if (worstHealth.length > 0) {
    lines.push(
      "",
      `Needs attention: ${worstHealth.map((entry) => entry.title).join(", ")} (${worstHealth.length} in Overdue health).`
    );
  } else if (atRisk.length > 0) {
    lines.push("", `Watch list: ${atRisk.map((entry) => entry.title).join(", ")} (At risk).`);
  } else if (snapshot.totalOverdueTasks === 0) {
    lines.push("", "Schedule health looks solid — no overdue open tasks.");
  }

  return lines.join("\n");
}

function answerInitiative(
  query: string,
  snapshot: PortfolioSnapshot,
  initiative: PortfolioInitiativeSummary
): string {
  const relatedTasks = snapshot.prioritizedTasks.filter(
    (task) => task.initiativeTitle.toLowerCase() === initiative.title.toLowerCase()
  );
  const relatedOverdue = snapshot.overdueTasks.filter(
    (task) => task.initiativeTitle.toLowerCase() === initiative.title.toLowerCase()
  );

  const lines = [
    `${initiative.title}:`,
    `• Progress: ${initiative.progressPercent}% done`,
    `• Open tasks: ${initiative.openTasks}`,
    `• Overdue: ${initiative.overdueTasks}`,
    `• Health: ${initiative.healthLabel}`,
    `• Deadline: ${initiative.deadline}`,
    `• Owner: ${initiative.ownerLabel}`,
  ];

  if (relatedOverdue.length > 0) {
    lines.push("", "Overdue work:", ...relatedOverdue.slice(0, 4).map((task) => formatTaskLine(task)));
  } else if (relatedTasks.length > 0) {
    lines.push("", "Open work:", ...relatedTasks.slice(0, 4).map((task) => formatTaskLine(task)));
  } else {
    lines.push("", "No open tasks with content yet for this initiative.");
  }

  if (!normalizeQuery(query).includes(initiative.title.toLowerCase())) {
    lines.unshift(`Here's the latest on ${initiative.title}:`);
  }

  return lines.join("\n");
}

function answerMember(snapshot: PortfolioSnapshot, memberName: string): string {
  const workload = snapshot.memberWorkloads.find((entry) => entry.name === memberName);
  if (!workload) {
    return `I couldn't find ${memberName} in your team roster or assignee list. Add them on Team Members first.`;
  }

  const memberTasks = [
    ...snapshot.prioritizedTasks.filter((task) => task.assignee === memberName),
    ...snapshot.overdueTasks.filter(
      (task) =>
        task.assignee === memberName &&
        !snapshot.prioritizedTasks.some(
          (open) =>
            open.description === task.description && open.initiativeTitle === task.initiativeTitle
        )
    ),
  ].slice(0, 6);

  const lines = [
    `${memberName}'s workload:`,
    `• ${workload.openTasks} open, ${workload.overdueTasks} overdue, ${workload.doneTasks} completed`,
  ];

  if (memberTasks.length > 0) {
    lines.push("", "Assigned work:", ...memberTasks.map((task) => formatTaskLine(task)));
  } else if (workload.openTasks === 0) {
    lines.push("", "No open assigned tasks right now.");
  }

  lines.push("", "See Member Status for the full breakdown.");

  return lines.join("\n");
}

export function answerPortfolioQuestion(query: string, snapshot: PortfolioSnapshot): string {
  const trimmed = query.trim();
  if (!trimmed) {
    return "Ask about overdue work, priorities, initiative health, or team workload.";
  }

  const intent = detectIntent(trimmed, snapshot);

  switch (intent) {
    case "help":
      return answerHelp();
    case "overdue":
      return answerOverdue(snapshot);
    case "prioritize":
      return answerPrioritize(snapshot);
    case "workload":
      return answerWorkload(snapshot);
    case "performers":
      return answerPerformers(snapshot);
    case "initiative": {
      const initiative = findMatchingInitiative(normalizeQuery(trimmed), snapshot.initiatives);
      return initiative ? answerInitiative(trimmed, snapshot, initiative) : answerSummarize(snapshot);
    }
    case "member": {
      const member = findMatchingMember(
        normalizeQuery(trimmed),
        snapshot.memberWorkloads.map((entry) => entry.name)
      );
      return member ? answerMember(snapshot, member) : answerWorkload(snapshot);
    }
    case "summarize":
    default:
      return answerSummarize(snapshot);
  }
}
