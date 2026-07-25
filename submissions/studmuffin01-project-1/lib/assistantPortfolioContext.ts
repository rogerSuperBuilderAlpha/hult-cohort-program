/**
 * Portfolio snapshot for the AI Assistant — derived from dashboard data.
 */

import {
  getInitiativeOwnerDisplay,
  getInitiativeTaskMetrics,
} from "@/lib/executiveSummaryMetrics";
import { getInitiativeHealthFromTasks, healthLabels } from "@/lib/health";
import type { Initiative } from "@/lib/initiatives";
import {
  getInitiativeTasks,
  type AllInitiativeTasks,
} from "@/lib/initiativeTasks";
import type { TeamMember } from "@/lib/teamMembers";
import {
  flattenTasks,
  getActionItems,
  getInitiativeProgressList,
  getMemberTasks,
  getPerformerScores,
  getTaskStatusBreakdown,
  isTaskOverdue,
  type FlatTask,
} from "@/lib/sidebarStats";

export interface PortfolioInitiativeSummary {
  slug: string;
  title: string;
  progressPercent: number;
  openTasks: number;
  overdueTasks: number;
  healthLabel: string;
  deadline: string;
  ownerLabel: string;
}

export interface PortfolioTaskSummary {
  description: string;
  initiativeTitle: string;
  assignee: string;
  status: string;
  dueDate: string;
}

export interface PortfolioMemberWorkload {
  name: string;
  openTasks: number;
  overdueTasks: number;
  doneTasks: number;
}

export interface PortfolioSnapshot {
  initiativeCount: number;
  memberCount: number;
  totalOpenTasks: number;
  totalOverdueTasks: number;
  totalDoneTasks: number;
  initiatives: PortfolioInitiativeSummary[];
  overdueTasks: PortfolioTaskSummary[];
  prioritizedTasks: PortfolioTaskSummary[];
  memberWorkloads: PortfolioMemberWorkload[];
  topPerformers: { name: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
}

function toTaskSummary(task: FlatTask): PortfolioTaskSummary {
  return {
    description: task.description.trim() || `Task ${task.taskNumber}`,
    initiativeTitle: task.initiativeTitle,
    assignee: task.responsibility.trim() || "Unassigned",
    status: task.status.trim() || "Unset",
    dueDate: task.dateDue.trim() || "No due date",
  };
}

function buildMemberWorkloads(flatTasks: FlatTask[], members: TeamMember[]): PortfolioMemberWorkload[] {
  const names = new Set<string>();

  for (const member of members) {
    if (member.name.trim()) {
      names.add(member.name.trim());
    }
  }

  for (const task of flatTasks) {
    const assignee = task.responsibility.trim();
    if (assignee) {
      names.add(assignee);
    }
  }

  return [...names]
    .sort((left, right) => left.localeCompare(right))
    .map((name) => {
      const memberTasks = getMemberTasks(flatTasks, name);
      const openTasks = memberTasks.filter((task) => task.status !== "Done");
      return {
        name,
        openTasks: openTasks.length,
        overdueTasks: openTasks.filter(isTaskOverdue).length,
        doneTasks: memberTasks.filter((task) => task.status === "Done").length,
      };
    })
    .sort(
      (left, right) =>
        right.openTasks - left.openTasks ||
        right.overdueTasks - left.overdueTasks ||
        left.name.localeCompare(right.name)
    );
}

export function buildPortfolioSnapshot(
  initiatives: Initiative[],
  tasksByInitiative: AllInitiativeTasks,
  members: TeamMember[]
): PortfolioSnapshot {
  const flatTasks = flattenTasks(initiatives, tasksByInitiative);
  const actionItems = getActionItems(flatTasks);
  const progressList = getInitiativeProgressList(initiatives, tasksByInitiative);
  const totalDoneTasks = progressList.reduce((sum, row) => sum + row.doneTasks, 0);

  const initiativeSummaries: PortfolioInitiativeSummary[] = initiatives.map((initiative) => {
    const tasks = getInitiativeTasks(tasksByInitiative, initiative.slug);
    const metrics = getInitiativeTaskMetrics(tasks);
    const health = getInitiativeHealthFromTasks(tasks);
    const owner = getInitiativeOwnerDisplay(tasks);
    const progress = progressList.find((entry) => entry.slug === initiative.slug);

    return {
      slug: initiative.slug,
      title: initiative.title,
      progressPercent: progress?.taskPercent ?? metrics.donePercent,
      openTasks: metrics.openCount,
      overdueTasks: metrics.overdueCount,
      healthLabel: healthLabels[health],
      deadline: initiative.deadline.trim() || "TBD",
      ownerLabel: owner.label,
    };
  });

  const overdueTasks = flatTasks
    .filter(isTaskOverdue)
    .map(toTaskSummary)
    .slice(0, 12);

  const prioritizedTasks = actionItems.map(toTaskSummary).slice(0, 8);
  const memberWorkloads = buildMemberWorkloads(flatTasks, members);
  const topPerformers = getPerformerScores(flatTasks);
  const statusBreakdown = getTaskStatusBreakdown(flatTasks);

  const totalOpenTasks = initiativeSummaries.reduce((sum, entry) => sum + entry.openTasks, 0);
  const totalOverdueTasks = initiativeSummaries.reduce((sum, entry) => sum + entry.overdueTasks, 0);

  return {
    initiativeCount: initiatives.length,
    memberCount: members.length,
    totalOpenTasks,
    totalOverdueTasks,
    totalDoneTasks,
    initiatives: initiativeSummaries.sort(
      (left, right) =>
        right.overdueTasks - left.overdueTasks ||
        right.openTasks - left.openTasks ||
        left.title.localeCompare(right.title)
    ),
    overdueTasks,
    prioritizedTasks,
    memberWorkloads,
    topPerformers,
    statusBreakdown: statusBreakdown.filter((entry) => entry.count > 0),
  };
}
