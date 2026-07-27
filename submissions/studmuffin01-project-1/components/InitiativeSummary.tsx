"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import GoToNav from "@/components/GoToNav";
import InitiativeTaskRow from "@/components/InitiativeTaskRow";
import TaskFilterBar from "@/components/TaskFilterBar";
import { AllInitiativeTasks, InitiativeTasks, TaskField, taskNumberExists } from "@/lib/initiativeTasks";
import { EMPTY_TASK_FILTERS, filterTaskRows, type TaskFilters } from "@/lib/taskFilters";
import { initiativeSummaryTableClass, initiativeTaskNumberHeaderClass, initiativeThClass } from "@/lib/tableStyles";
import { getInitiativeAnchorId, type Initiative } from "@/lib/initiatives";
import { dashboardPanelCompactClassName } from "@/lib/dashboardStyles";
import type { PendingDueDateConfirmation } from "@/hooks/useInitiativeTasks";

const actionButtonClassName =
  "rounded-md px-2 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-2 dark:focus:ring-offset-surface-card";

const addButtonClassName = `${actionButtonClassName} bg-brand-600 text-white hover:bg-brand-700`;

const deleteButtonClassName = `${actionButtonClassName} border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20`;

const deletePanelClassName =
  "rounded-md border border-slate-200 bg-white p-2 shadow-md ring-1 ring-slate-200 dark:border-surface-border dark:bg-surface-card dark:ring-surface-border";

const deleteInputClassName =
  "w-16 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-1 text-xs tabular-nums text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary";

const confirmDeleteClassName = `${actionButtonClassName} border border-red-400 bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 dark:border-red-500/60`;

interface InitiativeTaskTableProps {
  initiative: Initiative;
  displayLabel: string;
  tasks: InitiativeTasks | undefined;
  rowFilters: Pick<TaskFilters, "status" | "assignee">;
  assigneeOptions: string[];
  onUpdateField: (initiativeSlug: string, rowId: string, field: TaskField, value: string) => void;
  onAddRow: (initiativeSlug: string) => void;
  onAddSubTask: (initiativeSlug: string, parentTaskNumber: string) => void;
  onDeleteRow: (initiativeSlug: string, taskNumber: string) => boolean;
  onFieldBlur?: () => void;
  pendingDueDateConfirmation: PendingDueDateConfirmation | null;
  onConfirmDueDateRollup: () => void;
  onCancelDueDateRollup: () => void;
}

const InitiativeTaskTable = memo(function InitiativeTaskTable({
  initiative,
  displayLabel,
  tasks,
  rowFilters,
  assigneeOptions,
  onUpdateField,
  onAddRow,
  onAddSubTask,
  onDeleteRow,
  onFieldBlur,
  pendingDueDateConfirmation,
  onConfirmDueDateRollup,
  onCancelDueDateRollup,
}: InitiativeTaskTableProps) {
  const [isChoosingDelete, setIsChoosingDelete] = useState(false);
  const [deleteTaskNumber, setDeleteTaskNumber] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteInputId = `${initiative.slug}-delete-task-number`;
  const deleteControlsRef = useRef<HTMLDivElement>(null);

  const taskRows = tasks ?? [];
  const visibleTaskRows = useMemo(
    () => filterTaskRows(taskRows, { ...EMPTY_TASK_FILTERS, ...rowFilters }),
    [rowFilters, taskRows]
  );
  const closeDeleteMode = useCallback(() => {
    setIsChoosingDelete(false);
    setDeleteTaskNumber("");
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
    if (isChoosingDelete && taskRows.length <= 1) {
      closeDeleteMode();
    }
  }, [closeDeleteMode, isChoosingDelete, taskRows.length]);

  const handleUpdateField = useCallback(
    (rowId: string, field: TaskField, value: string) => {
      onUpdateField(initiative.slug, rowId, field, value);
    },
    [initiative.slug, onUpdateField]
  );

  const handleAddRow = useCallback(() => {
    onAddRow(initiative.slug);
  }, [initiative.slug, onAddRow]);

  const handleAddSubTask = useCallback(
    (parentTaskNumber: string) => {
      onAddSubTask(initiative.slug, parentTaskNumber);
    },
    [initiative.slug, onAddSubTask]
  );

  const toggleDeleteMode = useCallback(() => {
    if (taskRows.length <= 1) {
      return;
    }

    setIsChoosingDelete((current) => {
      if (current) {
        setDeleteTaskNumber("");
        setDeleteError(null);
      }
      return !current;
    });
  }, [taskRows.length]);

  const confirmDelete = useCallback(() => {
    const trimmedTaskNumber = deleteTaskNumber.trim();

    if (!trimmedTaskNumber) {
      setDeleteError("Enter a valid task number.");
      return;
    }

    if (!taskNumberExists(taskRows, trimmedTaskNumber)) {
      setDeleteError(`Task ${trimmedTaskNumber} does not exist.`);
      return;
    }

    const deleted = onDeleteRow(initiative.slug, trimmedTaskNumber);
    if (deleted) {
      closeDeleteMode();
    }
  }, [closeDeleteMode, deleteTaskNumber, initiative.slug, onDeleteRow, taskRows]);

  return (
    <div id={getInitiativeAnchorId(initiative.slug)} className={`${dashboardPanelCompactClassName} scroll-mt-8 space-y-2`}>
      <h3 className="truncate rounded-md bg-brand-50 px-2 py-1 text-center text-xs font-bold leading-snug text-brand-700 underline decoration-brand-400 underline-offset-2 dark:bg-brand-500/10 dark:text-brand-400 dark:decoration-brand-500/60 sm:text-sm">
        {displayLabel}
      </h3>

      <div className="overflow-visible">
        <table className={initiativeSummaryTableClass}>
          <caption className="sr-only">{displayLabel} tasks</caption>
          <colgroup>
            <col className="w-[9%]" />
            <col className="w-[28%]" />
            <col className="w-[12%]" />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
            <col className="w-[25%]" />
          </colgroup>
          <thead>
            <tr>
              <th className={initiativeTaskNumberHeaderClass}>No.</th>
              <th className={initiativeThClass}>Task</th>
              <th className={initiativeThClass}>Status</th>
              <th className={initiativeThClass}>Due</th>
              <th className={initiativeThClass}>Assignee</th>
              <th className={initiativeThClass}>Comments</th>
            </tr>
          </thead>
          <tbody>
            {visibleTaskRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-2 py-2 text-center text-[11px] text-slate-500 dark:text-surface-secondary">
                  No tasks match the current filters.
                </td>
              </tr>
            ) : (
              visibleTaskRows.map((row) => {
                const dueDateWarning =
                  pendingDueDateConfirmation?.initiativeSlug === initiative.slug &&
                  pendingDueDateConfirmation.rowId === row.id
                    ? {
                        message: pendingDueDateConfirmation.message,
                        onConfirm: onConfirmDueDateRollup,
                        onCancel: onCancelDueDateRollup,
                      }
                    : null;

                return (
                <InitiativeTaskRow
                  key={row.id}
                  row={row}
                  assigneeOptions={assigneeOptions}
                  onUpdateField={handleUpdateField}
                  onAddSubTask={handleAddSubTask}
                  onFieldBlur={onFieldBlur}
                  dueDateWarning={dueDateWarning}
                />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-start gap-2">
        <button type="button" onClick={handleAddRow} className={addButtonClassName}>
          Add Task
        </button>

        <div ref={deleteControlsRef} className="flex flex-wrap items-start gap-1.5">
          <button
            type="button"
            onClick={toggleDeleteMode}
            disabled={taskRows.length <= 1}
            aria-expanded={isChoosingDelete}
            aria-haspopup="dialog"
            className={deleteButtonClassName}
          >
            Delete Task
          </button>

          {isChoosingDelete && (
            <div role="dialog" aria-label="Select task to delete" className={deletePanelClassName}>
              <p className="text-xs font-semibold text-slate-900 dark:text-surface-primary">
                Select Task
              </p>

              <div className="mt-1.5 flex items-center gap-1.5">
                <label htmlFor={deleteInputId} className="sr-only">
                  Task Number to Delete
                </label>
                <input
                  id={deleteInputId}
                  type="text"
                  inputMode="decimal"
                  value={deleteTaskNumber}
                  onChange={(event) => {
                    setDeleteTaskNumber(event.target.value);
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
                  aria-label="Delete selected task"
                >
                  Del
                </button>
              </div>

              {deleteError && (
                <p
                  id={`${deleteInputId}-error`}
                  role="alert"
                  className="mt-1.5 text-[10px] text-red-600 dark:text-red-400"
                >
                  {deleteError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default function InitiativeSummary({
  initiatives,
  tasksByInitiative,
  assigneeOptions,
  onUpdateField,
  onAddRow,
  onAddSubTask,
  onDeleteRow,
  onFieldBlur,
  pendingDueDateConfirmation,
  onConfirmDueDateRollup,
  onCancelDueDateRollup,
}: {
  initiatives: Initiative[];
  tasksByInitiative: AllInitiativeTasks;
  assigneeOptions: string[];
  onUpdateField: (initiativeSlug: string, rowId: string, field: TaskField, value: string) => void;
  onAddRow: (initiativeSlug: string) => void;
  onAddSubTask: (initiativeSlug: string, parentTaskNumber: string) => void;
  onDeleteRow: (initiativeSlug: string, taskNumber: string) => boolean;
  onFieldBlur?: () => void;
  pendingDueDateConfirmation: PendingDueDateConfirmation | null;
  onConfirmDueDateRollup: () => void;
  onCancelDueDateRollup: () => void;
}) {
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_TASK_FILTERS);

  const visibleInitiatives = useMemo(() => {
    if (!filters.initiativeSlug) {
      return initiatives;
    }

    return initiatives.filter((initiative) => initiative.slug === filters.initiativeSlug);
  }, [filters.initiativeSlug, initiatives]);

  const rowFilters = useMemo(
    () => ({ status: filters.status, assignee: filters.assignee }),
    [filters.assignee, filters.status]
  );

  const useGridLayout = visibleInitiatives.length > 1;

  return (
    <section aria-label="Initiative summary" className="space-y-3">
      <h2 className="section-heading text-lg sm:text-xl">Initiative Summary</h2>

      {initiatives.length > 0 && (
        <TaskFilterBar
          filters={filters}
          initiatives={initiatives}
          assigneeOptions={assigneeOptions}
          onChange={setFilters}
        />
      )}

      {initiatives.length > 0 && assigneeOptions.length === 0 && (
        <p className="text-xs text-slate-600 dark:text-surface-secondary">
          Add team members from{" "}
          <Link
            href="/team-members"
            className="font-medium text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Team Members
          </Link>{" "}
          to enable assignee filtering and task assignment.
        </p>
      )}

      {initiatives.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-surface-secondary">
          Task tables appear here after you add initiatives from Start New Initiative.
        </p>
      ) : visibleInitiatives.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-surface-secondary">
          No initiatives match the selected project filter.
        </p>
      ) : (
        <>
          <div
            className={
              useGridLayout
                ? "grid items-start gap-3 xl:grid-cols-2"
                : "grid gap-3"
            }
          >
            {visibleInitiatives.map((initiative) => (
              <InitiativeTaskTable
                key={initiative.slug}
                initiative={initiative}
                displayLabel={initiative.title}
                tasks={tasksByInitiative[initiative.slug]}
                rowFilters={rowFilters}
                assigneeOptions={assigneeOptions}
                onUpdateField={onUpdateField}
                onAddRow={onAddRow}
                onAddSubTask={onAddSubTask}
                onDeleteRow={onDeleteRow}
                onFieldBlur={onFieldBlur}
                pendingDueDateConfirmation={pendingDueDateConfirmation}
                onConfirmDueDateRollup={onConfirmDueDateRollup}
                onCancelDueDateRollup={onCancelDueDateRollup}
              />
            ))}
          </div>
          <GoToNav initiatives={initiatives} menuIdSuffix="summary" />
        </>
      )}
    </section>
  );
}
