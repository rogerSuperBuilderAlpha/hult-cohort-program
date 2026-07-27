"use client";

import Link from "next/link";
import SidebarPageFrame, { SidebarPanelCompact } from "@/components/sidebar/SidebarPageFrame";
import { useSidebarData } from "@/hooks/SidebarDataProvider";
import { getInitiativeAnchorId } from "@/lib/initiatives";
import { isTaskOverdue } from "@/lib/sidebarStats";
import {
  sidebarTableClass,
  sidebarTdClass,
  sidebarTdPrimaryClass,
  sidebarThClass,
} from "@/lib/tableStyles";

export default function ActionItemsPage() {
  return (
    <SidebarPageFrame title="Action Items" subtitle="Open Tasks Across All Initiatives">
      <ActionItemsContent />
    </SidebarPageFrame>
  );
}

function ActionItemsContent() {
  const { actionItems } = useSidebarData();

  return (
      <SidebarPanelCompact>
        {actionItems.length === 0 ? (
          <p className="text-xs text-slate-600 dark:text-surface-secondary">
            No open action items. Tasks marked <strong>To Do</strong> or{" "}
            <strong>In Progress</strong> appear here.
          </p>
        ) : (
          <table className={sidebarTableClass}>
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[24%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[18%]" />
            </colgroup>
            <thead>
              <tr>
                <th className={sidebarThClass}>Task</th>
                <th className={sidebarThClass}>Initiative</th>
                <th className={sidebarThClass}>Status</th>
                <th className={sidebarThClass}>Assignee</th>
                <th className={sidebarThClass}>Due</th>
              </tr>
            </thead>
            <tbody>
              {actionItems.map((task) => {
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
                    <td className={sidebarTdClass}>{task.responsibility.trim() || "—"}</td>
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
        )}
      </SidebarPanelCompact>
  );
}
