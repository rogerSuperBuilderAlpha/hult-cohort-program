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
  tasksByInitiative: AllInitiativeTasks;
  onDeleteInitiative: (slug: string) => void;
}

const actionButtonClassName =
  "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-2 dark:focus:ring-offset-surface-card";

const deleteButtonClassName = `${actionButtonClassName} border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20`;

const deletePanelClassName =
  "rounded-lg border border-slate-200 bg-white p-3 shadow-md ring-1 ring-slate-200 dark:border-surface-border dark:bg-surface-card dark:ring-surface-border";

const deleteInputClassName =
  "w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm tabular-nums text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary";

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

function Dashboard({ initiatives, tasksByInitiative, onDeleteInitiative }: DashboardProps) {
  const [isChoosingDelete, setIsChoosingDelete] = useState(false);
  const [deleteRowNumber, setDeleteRowNumber] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteInputId = "executive-summary-delete-row-number";
  const deleteControlsRef = useRef<HTMLDivElement>(null);

  const executiveSummaryRows = useMemo(() => {
    const rowCount = getExecutiveSummaryRowCount(initiatives.length);

    return Array.from({ length: rowCount }, (_, rowIndex) => {
      const initiative = initiatives[rowIndex];

      if (!initiative) {
        return { rowIndex, initiative: null, percent: 0, health: getOverallHealth(0) };
      }

      const percent = calculateInitiativeTaskPercent(
        getInitiativeTasks(tasksByInitiative, initiative.slug)
      );

      return {
        rowIndex,
        initiative,
        percent,
        health: getOverallHealth(percent),
      };
    });
  }, [initiatives, tasksByInitiative]);

  const closeDeleteMode = useCallback(() => {
    setIsChoosingDelete(false);
    setDeleteRowNumber("");
    setDeleteError(null);
  }, []);

  useEffect(() => {
    if (!isChoosingDelete) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (deleteControlsRef.current && !deleteControlsRef.current.contains(event.target as Node)) {
        closeDeleteMode();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isChoosingDelete, closeDeleteMode]);

  useEffect(() => {
    if (isChoosingDelete && initiatives.length === 0) {
      closeDeleteMode();
    }
  }, [closeDeleteMode, initiatives.length, isChoosingDelete]);

  const toggleDeleteMode = useCallback(() => {
    if (initiatives.length === 0) {
      return;
    }

    setIsChoosingDelete((current) => {
      if (current) {
        setDeleteRowNumber("");
        setDeleteError(null);
      }
      return !current;
    });
  }, [initiatives.length]);

  const confirmDelete = useCallback(() => {
    const trimmedRowNumber = deleteRowNumber.trim();
    const rowNumber = Number.parseInt(trimmedRowNumber, 10);

    if (!trimmedRowNumber || !Number.isFinite(rowNumber) || rowNumber < 1) {
      setDeleteError("Enter a valid row number.");
      return;
    }

    const rowCount = getExecutiveSummaryRowCount(initiatives.length);
    if (rowNumber > rowCount) {
      setDeleteError(`Row ${rowNumber} does not exist.`);
      return;
    }

    const initiative = initiatives[rowNumber - 1];
    if (!initiative) {
      setDeleteError(`Row ${rowNumber} is empty.`);
      return;
    }

    if (
      !window.confirm(
        `Remove "${initiative.title}" from the Executive Summary? Its task table will also be deleted.`
      )
    ) {
      return;
    }

    onDeleteInitiative(initiative.slug);
    closeDeleteMode();
  }, [closeDeleteMode, deleteRowNumber, initiatives, onDeleteInitiative]);

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
            </tr>
          </thead>
          <tbody>
            {executiveSummaryRows.map(({ rowIndex, initiative, percent, health }) => (
              <tr key={initiative?.slug ?? `executive-summary-row-${rowIndex}`}>
                <td className={tdPrimaryClass}>
                  {initiative ? (
                    <button
                      type="button"
                      onClick={() => scrollToSection(getInitiativeAnchorId(initiative.slug))}
                      aria-label={`Go to ${initiative.title}`}
                      className="text-left text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-500 dark:hover:text-brand-400"
                    >
                      {initiative.title}
                    </button>
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
              </tr>
            ))}
          </tbody>
        </table>

        <div ref={deleteControlsRef} className="flex flex-wrap items-start gap-2">
          <button
            type="button"
            onClick={toggleDeleteMode}
            disabled={initiatives.length === 0}
            aria-expanded={isChoosingDelete}
            aria-haspopup="dialog"
            className={deleteButtonClassName}
          >
            Delete Initiative
          </button>

          {isChoosingDelete && (
            <div role="dialog" aria-label="Enter row number to delete initiative" className={deletePanelClassName}>
              <p className="text-sm font-semibold text-slate-900 dark:text-surface-primary">
                Enter Row No.
              </p>

              <div className="mt-2 flex items-center gap-2">
                <label htmlFor={deleteInputId} className="sr-only">
                  Executive Summary row number to delete
                </label>
                <input
                  id={deleteInputId}
                  type="text"
                  inputMode="numeric"
                  value={deleteRowNumber}
                  onChange={(event) => {
                    setDeleteRowNumber(event.target.value);
                    if (deleteError) setDeleteError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      confirmDelete();
                    }
                    if (event.key === "Escape") {
                      event.preventDefault();
                      closeDeleteMode();
                    }
                  }}
                  autoFocus
                  className={deleteInputClassName}
                  aria-invalid={deleteError ? true : undefined}
                  aria-describedby={deleteError ? `${deleteInputId}-error` : undefined}
                />

                <button
                  type="button"
                  onClick={confirmDelete}
                  className={confirmDeleteClassName}
                  aria-label="Delete selected initiative"
                >
                  Del
                </button>
              </div>

              {deleteError && (
                <p
                  id={`${deleteInputId}-error`}
                  role="alert"
                  className="mt-2 text-xs text-red-600 dark:text-red-400"
                >
                  {deleteError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(Dashboard);
