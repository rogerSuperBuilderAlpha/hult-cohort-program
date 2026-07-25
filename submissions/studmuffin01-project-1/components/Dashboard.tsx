"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getExecutiveSummaryRowCount, getInitiativeAnchorId, type Initiative } from "@/lib/initiatives";
import { AllInitiativeTasks, calculateInitiativeTaskPercent, getInitiativeTasks } from "@/lib/initiativeTasks";
import {
  getOverallHealth,
  HEALTH_LEGEND_DEFINITIONS,
  healthColors,
  healthIndicatorStyle,
  healthLabels,
  type HealthStatus,
} from "@/lib/health";
import { scrollToSection } from "@/lib/scroll";
import { tableClass, tdClass, tdPrimaryClass, thClass } from "@/lib/tableStyles";

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

const panelClassName =
  "rounded-lg border border-slate-200 bg-white p-3 shadow-md ring-1 ring-slate-200 dark:border-surface-border dark:bg-surface-card dark:ring-surface-border";

const rowInputClassName =
  "w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm tabular-nums text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary";

const titleInputClassName =
  "w-full min-w-[8rem] rounded border border-brand-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-brand-500/40 dark:bg-surface-bg dark:text-surface-primary";

const confirmArchiveClassName = `${actionButtonClassName} border border-amber-400 bg-amber-600 px-3 py-1.5 text-xs text-white hover:bg-amber-700 dark:border-amber-500/60`;

const confirmDeleteClassName = `${actionButtonClassName} border border-red-400 bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 dark:border-red-500/60`;

function ProgressCell({ percent }: { percent: number }) {
  return (
    <div className="flex min-w-[8rem] items-center gap-3">
      <div
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-surface-bg"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${percent}% complete`}
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-800 dark:text-surface-primary">
        {percent.toFixed(1)}%
      </span>
    </div>
  );
}

function HealthLegend() {
  return (
    <div
      aria-label="Overall health colour legend"
      className="rounded border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-surface-border dark:bg-surface-card"
    >
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
        className="inline-block h-6 w-6 rounded-full ring-2 ring-offset-1 ring-offset-white dark:ring-offset-surface-card"
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
}

function InitiativeTitleCell({ initiative, isArchived, onUpdateTitle }: InitiativeTitleCellProps) {
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
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => scrollToSection(getInitiativeAnchorId(initiative.slug))}
        aria-label={`Go to ${initiative.title}`}
        className={`text-left transition-colors hover:underline ${
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
          className="rounded px-1.5 py-0.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-surface-secondary dark:hover:bg-surface-bg dark:hover:text-surface-primary"
          aria-label={`Edit title for ${initiative.title}`}
        >
          Edit
        </button>
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
        return { rowIndex, initiative: null, percent: 0, health: getOverallHealth(0), isArchived: false };
      }

      const percent = calculateInitiativeTaskPercent(
        getInitiativeTasks(tasksByInitiative, initiative.slug)
      );

      return {
        rowIndex,
        initiative,
        percent,
        health: getOverallHealth(percent),
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
    <section aria-label="Executive summary" className="space-y-6">
      <div className="space-y-3">
        <h2 className="section-heading">Executive Summary</h2>
        <HealthLegend />
      </div>

      <div className="space-y-3">
        <table className={tableClass}>
          <caption className="sr-only">Executive Summary</caption>
          <thead>
            <tr>
              <th className={thClass}>Initiative</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Deadline</th>
              <th className={`${thClass} text-center`}>Overall Health</th>
              {showArchived && <th className={thClass}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {executiveSummaryRows.map(({ rowIndex, initiative, percent, health, isArchived }) => (
              <tr
                key={initiative?.slug ?? `executive-summary-row-${rowIndex}`}
                className={isArchived ? "opacity-70" : undefined}
              >
                <td className={tdPrimaryClass}>
                  {initiative ? (
                    <InitiativeTitleCell
                      initiative={initiative}
                      isArchived={isArchived}
                      onUpdateTitle={onUpdateInitiativeTitle}
                    />
                  ) : (
                    <span className="sr-only">Empty initiative row {rowIndex + 1}</span>
                  )}
                </td>
                <td className={tdClass}>
                  {initiative ? (
                    <ProgressCell percent={percent} />
                  ) : (
                    <span className="text-slate-400 dark:text-surface-secondary" aria-hidden="true">
                      —
                    </span>
                  )}
                </td>
                <td className={`${tdClass} whitespace-nowrap`}>
                  {initiative ? (
                    initiative.deadline
                  ) : (
                    <span className="text-slate-400 dark:text-surface-secondary" aria-hidden="true">
                      —
                    </span>
                  )}
                </td>
                <td className={tdClass}>
                  {initiative ? (
                    <HealthIndicator status={health} />
                  ) : (
                    <span className="text-slate-400 dark:text-surface-secondary" aria-hidden="true">
                      —
                    </span>
                  )}
                </td>
                {showArchived && (
                  <td className={tdClass}>
                    {initiative && isArchived ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onUnarchiveInitiative(initiative.slug)}
                          className={secondaryButtonClassName}
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
                          className={deleteButtonClassName}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-surface-secondary" aria-hidden="true">
                        —
                      </span>
                    )}
                  </td>
                )}
              </tr>
            ))}
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
                    Executive Summary row number to archive
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
