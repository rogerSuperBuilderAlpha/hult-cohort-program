"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SidebarPageFrame, {
  SidebarPanelCompact,
  SidebarSectionTitle,
  StatCard,
  sidebarHintClassName,
  sidebarLabelClassName,
  sidebarSelectClassName,
} from "@/components/sidebar/SidebarPageFrame";
import { useSidebarData } from "@/hooks/SidebarDataProvider";
import { getOverallHealth, healthIndicatorStyle, healthLabels } from "@/lib/health";
import { getInitiativeAnchorId } from "@/lib/initiatives";
import {
  getMemberInitiativeTaskSummaries,
  getMemberTasks,
  getTaskStatusBreakdown,
  isTaskOverdue,
} from "@/lib/sidebarStats";
import {
  sidebarTableClass,
  sidebarTdClass,
  sidebarTdPrimaryClass,
  sidebarThClass,
} from "@/lib/tableStyles";

export default function MemberStatusPage() {
  return (
    <SidebarPageFrame
      title="Member Status"
      subtitle="Task Progress and Workload for a Specific Team Member"
    >
      <MemberStatusContent />
    </SidebarPageFrame>
  );
}

function MemberStatusContent() {
  const { members, initiatives, flatTasks } = useSidebarData();
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId) ?? members[0],
    [members, selectedMemberId]
  );

  const memberName = selectedMember?.name ?? "";

  const memberTasks = useMemo(
    () => (memberName ? getMemberTasks(flatTasks, memberName) : []),
    [flatTasks, memberName]
  );

  const statusBreakdown = useMemo(
    () => getTaskStatusBreakdown(memberTasks),
    [memberTasks]
  );

  const initiativeSummaries = useMemo(
    () => getMemberInitiativeTaskSummaries(initiatives, memberTasks),
    [initiatives, memberTasks]
  );

  const doneCount = memberTasks.filter((task) => task.status === "Done").length;
  const inProgressCount = memberTasks.filter((task) => task.status === "In Progress").length;
  const completionRate =
    memberTasks.length > 0 ? Math.round((doneCount / memberTasks.length) * 1000) / 10 : 0;
  const overallHealth = getOverallHealth(completionRate);

  return (
    <>
      {members.length === 0 ? (
        <SidebarPanelCompact>
          <p className="text-xs text-slate-600 dark:text-surface-secondary">
            No team members yet. Add names from{" "}
            <Link
              href="/team-members"
              className="font-medium text-amber-900 hover:text-amber-950 dark:text-amber-400 dark:hover:text-amber-300"
            >
              Team Members
            </Link>{" "}
            in the Command Center, then return here to review their progress.
          </p>
        </SidebarPanelCompact>
      ) : (
        <div className="grid gap-3">
          <SidebarPanelCompact className="grid gap-2 sm:grid-cols-[minmax(0,12rem)_1fr] sm:items-end">
            <div>
              <label htmlFor="member-status-select" className={sidebarLabelClassName}>
                Team Member
              </label>
              <select
                id="member-status-select"
                value={selectedMember?.id ?? ""}
                onChange={(event) => setSelectedMemberId(event.target.value)}
                className={sidebarSelectClassName}
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <p className={sidebarHintClassName}>
              Tasks are matched by assignee name from Initiative Summary tables.
            </p>
          </SidebarPanelCompact>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <StatCard compact label="Assigned Tasks" value={memberTasks.length} />
            <StatCard compact label="Completed" value={doneCount} hint={`${completionRate}% done`} />
            <StatCard compact label="In Progress" value={inProgressCount} />
            <StatCard
              compact
              label="Overall Health"
              value={healthLabels[overallHealth]}
              trailing={
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={healthIndicatorStyle(overallHealth)}
                  aria-hidden
                />
              }
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-12">
            <SidebarPanelCompact
              className={initiativeSummaries.length > 0 ? "lg:col-span-4" : "lg:col-span-12"}
            >
              <SidebarSectionTitle>Task Status Breakdown</SidebarSectionTitle>
              {memberTasks.length === 0 ? (
                <p className={`mt-2 ${sidebarHintClassName}`}>
                  No tasks assigned to {memberName} yet.
                </p>
              ) : (
                <ul className="mt-2 grid grid-cols-2 gap-1.5">
                  {statusBreakdown.map((item) => (
                    <li
                      key={item.status}
                      className="flex items-center justify-between rounded-md border border-slate-200 px-2 py-1 dark:border-surface-border"
                    >
                      <span className="text-[11px] text-slate-600 dark:text-surface-secondary">
                        {item.status}
                      </span>
                      <span className="text-xs font-bold tabular-nums text-slate-900 dark:text-surface-primary">
                        {item.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SidebarPanelCompact>

            {initiativeSummaries.length > 0 && (
              <SidebarPanelCompact className="lg:col-span-8">
                <SidebarSectionTitle>Progress by Initiative</SidebarSectionTitle>
                <table className={`${sidebarTableClass} mt-2`}>
                  <colgroup>
                    <col className="w-[40%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className={sidebarThClass}>Initiative</th>
                      <th className={sidebarThClass}>Assigned</th>
                      <th className={sidebarThClass}>Done</th>
                      <th className={sidebarThClass}>In Progress</th>
                      <th className={sidebarThClass}>To Do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initiativeSummaries.map((row) => (
                      <tr key={row.slug}>
                        <td className={sidebarTdPrimaryClass}>
                          <Link
                            href={`/#${getInitiativeAnchorId(row.slug)}`}
                            className="break-words text-brand-600 hover:text-brand-700 dark:text-brand-500 dark:hover:text-brand-400"
                          >
                            {row.title}
                          </Link>
                        </td>
                        <td className={`${sidebarTdClass} tabular-nums`}>{row.total}</td>
                        <td className={`${sidebarTdClass} tabular-nums`}>{row.done}</td>
                        <td className={`${sidebarTdClass} tabular-nums`}>{row.inProgress}</td>
                        <td className={`${sidebarTdClass} tabular-nums`}>{row.toDo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </SidebarPanelCompact>
            )}
          </div>

          {memberTasks.length > 0 && (
            <SidebarPanelCompact>
              <SidebarSectionTitle>All Assigned Tasks</SidebarSectionTitle>
              <table className={`${sidebarTableClass} mt-2`}>
                <colgroup>
                  <col className="w-[34%]" />
                  <col className="w-[28%]" />
                  <col className="w-[18%]" />
                  <col className="w-[20%]" />
                </colgroup>
                <thead>
                  <tr>
                    <th className={sidebarThClass}>Task</th>
                    <th className={sidebarThClass}>Initiative</th>
                    <th className={sidebarThClass}>Status</th>
                    <th className={sidebarThClass}>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {memberTasks.map((task) => {
                    const overdue = isTaskOverdue(task);
                    return (
                      <tr key={task.id}>
                        <td className={sidebarTdPrimaryClass}>
                          <Link
                            href={`/#${getInitiativeAnchorId(task.initiativeSlug)}`}
                            className="break-words hover:text-brand-600 dark:hover:text-brand-400"
                          >
                            {task.description.trim() || `Task ${task.taskNumber}`}
                          </Link>
                        </td>
                        <td className={`${sidebarTdClass} break-words`}>{task.initiativeTitle}</td>
                        <td className={sidebarTdClass}>{task.status.trim() || "Unset"}</td>
                        <td className={`${sidebarTdClass} tabular-nums`}>
                          {task.dateDue.trim() || "—"}
                          {overdue && (
                            <span className="ml-1 text-[10px] font-semibold text-red-700 dark:text-red-400">
                              Overdue
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </SidebarPanelCompact>
          )}
        </div>
      )}
    </>
  );
}
