"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getExecutiveSummaryRowCount, getInitiativeAnchorId, type Initiative } from "@/lib/initiatives";
import { AllInitiativeTasks, getInitiativeTasks } from "@/lib/initiativeTasks";
import {
  getInitiativeOwnerDisplay,
  getInitiativeTaskMetrics,
  type InitiativeOwnerDisplay,
} from "@/lib/executiveSummaryMetrics";
import {
  formatDaysToDeadline,
  formatDeadlineCompact,
  getDaysToDeadline,
  getLatestTaskDueDate,
} from "@/lib/initiativeDeadlines";
import {
  getInitiativeHealthFromTasks,
  HEALTH_LEGEND_DEFINITIONS,
  healthColors,
  healthIndicatorStyle,
  healthLabels,
  type HealthStatus,
} from "@/lib/health";
import { scrollToSection } from "@/lib/scroll";
import { dashboardPanelCompactClassName } from "@/lib/dashboardStyles";
import {
  executiveSummaryTableClass,
  executiveSummaryTdCenterClass,
  executiveSummaryTdClass,
  executiveSummaryTdPrimaryClass,
  executiveSummaryThCenterClass,
  executiveSummaryThClass,
  executiveSummaryThWrapClass,
} from "@/lib/tableStyles";

interface DashboardProps {
  initiatives: Initiative[];
  archivedInitiatives: Initiative[];
  tasksByInitiative: AllInitiativeTasks;
  onUpdateInitiativeTitle: (slug: string, title: string) => boolean;
  onArchiveInitiative: (slug: string) => void;
  onUnarchiveInitiative: (slug: string) => void;
  onDeleteInitiative: (slug: string) => void;
}

const actionButtonClassName =
  "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-2 dark:focus:ring-offset-surface-card";

const archiveButtonClassName = `${actionButtonClassName} border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20`;

const deleteButtonClassName = `${actionButtonClassName} border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20`;

const secondaryButtonClassName = `${actionButtonClassName} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-surface-border dark:bg-surface-card dark:text-surface-secondary dark:hover:bg-surface-bg`;

const panelClassName = dashboardPanelCompactClassName;

const rowInputClassName =
  "w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm tabular-nums text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary";

const titleInputClassName =
  "w-full min-w-0 rounded border border-brand-300 bg-white px-2 py-1 text-xs text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-brand-500/40 dark:bg-surface-bg dark:text-surface-primary";

const confirmArchiveClassName = `${actionButtonClassName} border border-amber-400 bg-amber-600 px-3 py-1.5 text-xs text-white hover:bg-amber-700 dark:border-amber-500/60`;

const confirmDeleteClassName = `${actionButtonClassName} border border-red-400 bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 dark:border-red-500/60`;

function ProgressToDateCell({
  doneCount,
  activeTaskCount,
  donePercent,
}: {
  doneCount: number;
  activeTaskCount: number;
  donePercent: number;
}) {
  const displayPercent =
    donePercent % 1 === 0 ? donePercent.toFixed(0) : donePercent.toFixed(1);

  return (
    <span
      className="font-semibold tabular-nums text-slate-800 dark:text-surface-primary"
      title={`${doneCount} of ${activeTaskCount} tasks done`}
    >
      {displayPercent}%
    </span>
  );
}

function EmptyCell() {
  return (
    <span className="text-slate-400 dark:text-surface-secondary" aria-hidden="true">
      —
    </span>
  );
}

function HealthLegend() {
  return (
    <div
      aria-label="Overall health colour legend"
      className="rounded border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-surface-border dark:bg-surface-card"
    >
      <p className="mb-2 text-xs text-slate-600 dark:text-surface-secondary">
        Open Tasks = active tasks not marked Done. Owner shows one assignee, or Multiple when open
        work is split across people (hover for task counts per person). Deadline is the latest task due date.
      </p>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] leading-tight">
        {HEALTH_LEGEND_DEFINITIONS.map((item) => (
          <li key={item.status} className="flex items-center gap-1.5 text-slate-700 dark:text-surface-secondary">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-offset-1 ring-offset-white dark:ring-offset-surface-card"
              style={{
                backgroundColor: healthColors[item.status].fill,
                boxShadow: `0 0 0 1px ${healthColors[item.status].ring}`,
              }}
              aria-hidden="true"
            />
            <span>
              <span className="tabular-nums">{item.range}</span> {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HealthIndicator({ status }: { status: HealthStatus }) {
  return (
    <div className="flex justify-center">
      <span
        className="inline-block h-5 w-5 rounded-full ring-1 ring-offset-1 ring-offset-white dark:ring-offset-surface-card"
        style={healthIndicatorStyle(status)}
        role="img"
        aria-label={`Overall health: ${healthLabels[status]}`}
        title={healthLabels[status]}
      />
    </div>
  );
}

interface InitiativeTitleCellProps {
  initiative: Initiative;
  isArchived?: boolean;
  onUpdateTitle: (slug: string, title: string) => boolean;
  onUnarchiveInitiative?: (slug: string) => void;
  onDeleteInitiative?: (slug: string) => void;
}

function InitiativeTitleCell({
  initiative,
  isArchived,
  onUpdateTitle,
  onUnarchiveInitiative,
  onDeleteInitiative,
}: InitiativeTitleCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(initiative.title);

  useEffect(() => {
    if (!isEditing) {
      setDraftTitle(initiative.title);
    }
  }, [initiative.title, isEditing]);

  const saveTitle = useCallback(() => {
    if (onUpdateTitle(initiative.slug, draftTitle)) {
      setIsEditing(false);
    }
  }, [draftTitle, initiative.slug, onUpdateTitle]);

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              saveTitle();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              setDraftTitle(initiative.title);
              setIsEditing(false);
            }
          }}
          autoFocus
          className={titleInputClassName}
          aria-label={`Edit title for ${initiative.title}`}
        />
        <button type="button" onClick={saveTitle} className={secondaryButtonClassName}>
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setDraftTitle(initiative.title);
            setIsEditing(false);
          }}
          className={secondaryButtonClassName}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-start gap-1">
        <button
          type="button"
          onClick={() => scrollToSection(getInitiativeAnchorId(initiative.slug))}
          aria-label={`Go to ${initiative.title}`}
          title={initiative.title}
          className={`min-w-0 flex-1 truncate text-left transition-colors hover:underline ${
            isArchived
              ? "text-slate-500 line-through dark:text-surface-secondary"
              : "text-brand-600 hover:text-brand-700 dark:text-brand-500 dark:hover:text-brand-400"
          }`}
        >
          {initiative.title}
        </button>
        {!isArchived && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="shrink-0 rounded px-1 py-0.5 text-[10px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-surface-secondary dark:hover:bg-surface-bg dark:hover:text-surface-primary"
            aria-label={`Edit title for ${initiative.title}`}
          >
            Edit
          </button>
        )}
      </div>
      {isArchived && onUnarchiveInitiative && onDeleteInitiative && (
        <div className="mt-1 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => onUnarchiveInitiative(initiative.slug)}
            className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:text-surface-secondary dark:ring-surface-border dark:hover:bg-surface-bg"
          >
            Restore
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  `Permanently delete "${initiative.title}" and its tasks? This cannot be undone.`
                )
              ) {
                onDeleteInitiative(initiative.slug);
              }
            }}
            className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-50 dark:text-red-400 dark:ring-red-500/30 dark:hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function Dashboard({
  initiatives,
  archivedInitiatives,
  tasksByInitiative,
  onUpdateInitiativeTitle,
  onArchiveInitiative,
  onUnarchiveInitiative,
  onDeleteInitiative,
}: DashboardProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [isChoosingArchive, setIsChoosingArchive] = useState(false);
  const [archiveRowNumber, setArchiveRowNumber] = useState("");
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const archiveInputId = "executive-summary-archive-row-number";
  const archiveControlsRef = useRef<HTMLDivElement>(null);

  const displayedInitiatives = useMemo(
    () => (showArchived ? [...initiatives, ...archivedInitiatives] : initiatives),
    [archivedInitiatives, initiatives, showArchived]
  );

  const executiveSummaryRows = useMemo(() => {
    const rowCount = getExecutiveSummaryRowCount(displayedInitiatives.length);

    return Array.from({ length: rowCount }, (_, rowIndex) => {
      const initiative = displayedInitiatives[rowIndex];

      if (!initiative) {
        return {
          rowIndex,
          initiative: null,
          metrics: getInitiativeTaskMetrics(undefined),
          health: getInitiativeHealthFromTasks(undefined),
          computedDeadline: null,
          owner: {
            label: "—",
            isUnassigned: true,
            isMultiple: false,
          } satisfies InitiativeOwnerDisplay,
          isArchived: false,
        };
      }

      const tasks = getInitiativeTasks(tasksByInitiative, initiative.slug);
      const metrics = getInitiativeTaskMetrics(tasks);
      const computedDeadline = getLatestTaskDueDate(tasks);

      return {
        rowIndex,
        initiative,
        metrics,
        health: getInitiativeHealthFromTasks(tasks),
        computedDeadline,
        owner: getInitiativeOwnerDisplay(tasks),
        isArchived: Boolean(initiative.archived),
      };
    });
  }, [displayedInitiatives, tasksByInitiative]);

  const closeArchiveMode = useCallback(() => {
    setIsChoosingArchive(false);
    setArchiveRowNumber("");
    setArchiveError(null);
  }, []);

  useEffect(() => {
    if (!isChoosingArchive) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (archiveControlsRef.current && !archiveControlsRef.current.contains(event.target as Node)) {
        closeArchiveMode();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeArchiveMode, isChoosingArchive]);

  useEffect(() => {
    if (isChoosingArchive && initiatives.length === 0) {
      closeArchiveMode();
    }
  }, [closeArchiveMode, initiatives.length, isChoosingArchive]);

  const toggleArchiveMode = useCallback(() => {
    if (initiatives.length === 0) {
      return;
    }

    setIsChoosingArchive((current) => {
      if (current) {
        setArchiveRowNumber("");
        setArchiveError(null);
      }
      return !current;
    });
  }, [initiatives.length]);

  const confirmArchive = useCallback(() => {
    const trimmedRowNumber = archiveRowNumber.trim();
    const rowNumber = Number.parseInt(trimmedRowNumber, 10);

    if (!trimmedRowNumber || !Number.isFinite(rowNumber) || rowNumber < 1) {
      setArchiveError("Enter a valid row number.");
      return;
    }

    if (rowNumber > initiatives.length) {
      setArchiveError(`Row ${rowNumber} is not an active initiative.`);
      return;
    }

    const initiative = initiatives[rowNumber - 1];
    if (!initiative) {
      setArchiveError(`Row ${rowNumber} is empty.`);
      return;
    }

    if (
      !window.confirm(
        `Archive "${initiative.title}"? It will be hidden from the dashboard but tasks are preserved.`
      )
    ) {
      return;
    }

    onArchiveInitiative(initiative.slug);
    closeArchiveMode();
  }, [archiveRowNumber, closeArchiveMode, initiatives, onArchiveInitiative]);

  return (
    <section aria-label="Executive summary" className="min-w-0 space-y-6 overflow-x-hidden">
      <div className="space-y-3">
        <h2 className="section-heading">Executive Summary</h2>
        <HealthLegend />
        {initiatives.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 dark:border-surface-border dark:bg-surface-bg">
            <p className="text-sm text-slate-700 dark:text-surface-secondary">
              No initiatives yet. Create your first project to start tracking tasks and health
              metrics.
            </p>
            <Link
              href="/start-new-initiative"
              className="mt-2 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Start New Initiative →
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-3 min-w-0">
        <table className={executiveSummaryTableClass}>
          <caption className="sr-only">Executive Summary</caption>
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[8%]" />
            <col className="w-[7%]" />
            <col className="w-[8%]" />
            <col className="w-[11%]" />
            <col className="w-[9%]" />
            <col className="w-[8%]" />
            <col className="w-[21%]" />
          </colgroup>
          <thead>
            <tr>
              <th className={executiveSummaryThClass}>INITIATIVE</th>
              <th className={executiveSummaryThWrapClass}>Progress To Date</th>
              <th className={executiveSummaryThWrapClass}>Open Tasks</th>
              <th className={executiveSummaryThWrapClass}>Overdue Tasks</th>
              <th className={executiveSummaryThClass}>Deadline</th>
              <th className={executiveSummaryThCenterClass}>Days Left</th>
              <th className={executiveSummaryThWrapClass}>Overall Health</th>
              <th className={executiveSummaryThClass}>Owner</th>
            </tr>
          </thead>
          <tbody>
            {executiveSummaryRows.map(
              ({ rowIndex, initiative, metrics, health, computedDeadline, owner, isArchived }) => {
                const daysLeft = getDaysToDeadline(computedDeadline);
                const daysLeftLabel = formatDaysToDeadline(computedDeadline);

                return (
              <tr
                key={initiative?.slug ?? `executive-summary-row-${rowIndex}`}
                className={isArchived ? "opacity-70" : undefined}
              >
                <td className={executiveSummaryTdPrimaryClass}>
                  {initiative ? (
                    <InitiativeTitleCell
                      initiative={initiative}
                      isArchived={isArchived}
                      onUpdateTitle={onUpdateInitiativeTitle}
                      onUnarchiveInitiative={onUnarchiveInitiative}
                      onDeleteInitiative={onDeleteInitiative}
                    />
                  ) : (
                    <span className="sr-only">Empty initiative row {rowIndex + 1}</span>
                  )}
                </td>
                <td className={executiveSummaryTdCenterClass}>
                  {initiative && metrics.activeTaskCount > 0 ? (
                    <ProgressToDateCell
                      doneCount={metrics.doneCount}
                      activeTaskCount={metrics.activeTaskCount}
                      donePercent={metrics.donePercent}
                    />
                  ) : initiative ? (
                    <EmptyCell />
                  ) : (
                    <EmptyCell />
                  )}
                </td>
                <td className={executiveSummaryTdCenterClass}>
                  {initiative && metrics.activeTaskCount > 0 ? metrics.openCount : initiative ? (
                    <EmptyCell />
                  ) : (
                    <EmptyCell />
                  )}
                </td>
                <td className={executiveSummaryTdCenterClass}>
                  {initiative && metrics.overdueCount > 0 ? (
                    <span className="font-semibold text-red-700 dark:text-red-400">
                      {metrics.overdueCount}
                    </span>
                  ) : initiative && metrics.activeTaskCount > 0 ? (
                    "0"
                  ) : initiative ? (
                    <EmptyCell />
                  ) : (
                    <EmptyCell />
                  )}
                </td>
                <td className={`${executiveSummaryTdClass} whitespace-nowrap tabular-nums`}>
                  {initiative ? (
                    <span title={computedDeadline ?? undefined}>
                      {formatDeadlineCompact(computedDeadline)}
                    </span>
                  ) : (
                    <EmptyCell />
                  )}
                </td>
                <td className={executiveSummaryTdCenterClass}>
                  {initiative && daysLeft !== null ? (
                    <span
                      className={
                        daysLeft < 0
                          ? "font-semibold text-red-700 dark:text-red-400"
                          : daysLeft === 0
                            ? "font-semibold text-amber-700 dark:text-amber-400"
                            : undefined
                      }
                      title={daysLeftLabel}
                    >
                      {daysLeftLabel}
                    </span>
                  ) : initiative ? (
                    <EmptyCell />
                  ) : (
                    <EmptyCell />
                  )}
                </td>
                <td className={executiveSummaryTdClass}>
                  {initiative ? <HealthIndicator status={health} /> : <EmptyCell />}
                </td>
                <td className={`${executiveSummaryTdClass} max-w-0`}>
                  {initiative ? (
                    <span
                      className={`block whitespace-normal break-words leading-tight ${
                        owner.isUnassigned
                          ? "text-slate-400 italic dark:text-surface-secondary"
                          : owner.isMultiple
                            ? "font-medium text-slate-800 dark:text-surface-primary"
                            : undefined
                      }`}
                      title={owner.detail ?? owner.label}
                    >
                      {owner.label}
                    </span>
                  ) : (
                    <EmptyCell />
                  )}
                </td>
              </tr>
                );
              }
            )}
          </tbody>
        </table>

        <div className="flex flex-wrap items-start gap-2">
          <div ref={archiveControlsRef} className="flex flex-wrap items-start gap-2">
            <button
              type="button"
              onClick={toggleArchiveMode}
              disabled={initiatives.length === 0}
              aria-expanded={isChoosingArchive}
              aria-haspopup="dialog"
              className={archiveButtonClassName}
            >
              Archive Initiative
            </button>

            {isChoosingArchive && (
              <div role="dialog" aria-label="Enter row number to archive initiative" className={panelClassName}>
                <p className="text-sm font-semibold text-slate-900 dark:text-surface-primary">
                  Enter Row No.
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <label htmlFor={archiveInputId} className="sr-only">
                    Executive Summary Row Number to Archive
                  </label>
                  <input
                    id={archiveInputId}
                    type="text"
                    inputMode="numeric"
                    value={archiveRowNumber}
                    onChange={(event) => {
                      setArchiveRowNumber(event.target.value);
                      if (archiveError) setArchiveError(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        confirmArchive();
                      }
                      if (event.key === "Escape") {
                        event.preventDefault();
                        closeArchiveMode();
                      }
                    }}
                    autoFocus
                    className={rowInputClassName}
                    aria-invalid={archiveError ? true : undefined}
                    aria-describedby={archiveError ? `${archiveInputId}-error` : undefined}
                  />

                  <button
                    type="button"
                    onClick={confirmArchive}
                    className={confirmArchiveClassName}
                    aria-label="Archive selected initiative"
                  >
                    Archive
                  </button>
                </div>

                {archiveError && (
                  <p
                    id={`${archiveInputId}-error`}
                    role="alert"
                    className="mt-2 text-xs text-red-600 dark:text-red-400"
                  >
                    {archiveError}
                  </p>
                )}
              </div>
            )}
          </div>

          {archivedInitiatives.length > 0 && (
            <button
              type="button"
              onClick={() => setShowArchived((current) => !current)}
              aria-pressed={showArchived}
              className={secondaryButtonClassName}
            >
              {showArchived ? "Hide archived" : `Show archived (${archivedInitiatives.length})`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(Dashboard);
