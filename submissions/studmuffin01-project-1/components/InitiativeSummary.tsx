"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import GoToNav from "@/components/GoToNav";
import InitiativeTaskRow from "@/components/InitiativeTaskRow";
import { AllInitiativeTasks, InitiativeTasks, TaskField, taskNumberExists } from "@/lib/initiativeTasks";
import { initiativeTaskNumberHeaderClass, initiativeThClass } from "@/lib/tableStyles";
import { getInitiativeAnchorId, type Initiative } from "@/lib/initiatives";

const actionButtonClassName =
  "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-2 dark:focus:ring-offset-surface-card";

const addButtonClassName = `${actionButtonClassName} bg-brand-600 text-white hover:bg-brand-700`;

const deleteButtonClassName = `${actionButtonClassName} border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20`;

const deletePanelClassName =
  "rounded-lg border border-slate-200 bg-white p-3 shadow-md ring-1 ring-slate-200 dark:border-surface-border dark:bg-surface-card dark:ring-surface-border";

const deleteInputClassName =
  "w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm tabular-nums text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary";

const confirmDeleteClassName = `${actionButtonClassName} border border-red-400 bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 dark:border-red-500/60`;

interface InitiativeTaskTableProps {
  initiative: Initiative;
  displayLabel: string;
  allInitiatives: Initiative[];
  tasks: InitiativeTasks | undefined;
  onUpdateField: (initiativeSlug: string, rowId: string, field: TaskField, value: string) => void;
  onAddRow: (initiativeSlug: string) => void;
  onAddSubTask: (initiativeSlug: string, parentTaskNumber: string) => void;
  onDeleteRow: (initiativeSlug: string, taskNumber: string) => boolean;
}

const InitiativeTaskTable = memo(function InitiativeTaskTable({
  initiative,
  displayLabel,
  allInitiatives,
  tasks,
  onUpdateField,
  onAddRow,
  onAddSubTask,
  onDeleteRow,
}: InitiativeTaskTableProps) {
  const [isChoosingDelete, setIsChoosingDelete] = useState(false);
  const [deleteTaskNumber, setDeleteTaskNumber] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteInputId = `${initiative.slug}-delete-task-number`;
  const deleteControlsRef = useRef<HTMLDivElement>(null);

  const taskRows = tasks ?? [];

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
    <div id={getInitiativeAnchorId(initiative.slug)} className="scroll-mt-8 space-y-3">
      <h3 className="overflow-visible rounded-lg bg-brand-50 px-3 py-3.5 text-center font-display text-lg font-bold leading-relaxed text-brand-700 underline decoration-brand-400 underline-offset-[0.2em] dark:bg-brand-500/10 dark:text-brand-400 dark:decoration-brand-500/60 sm:text-xl">
        {displayLabel}
      </h3>

      <div className="rounded-xl bg-white shadow-md ring-1 ring-slate-200 dark:bg-surface-card dark:shadow-none dark:ring-surface-border">
        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">{displayLabel} tasks</caption>
          <colgroup>
            <col className="w-28" />
            <col className="w-[32%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[22%]" />
          </colgroup>
          <thead>
            <tr>
              <th className={initiativeTaskNumberHeaderClass}>Task No.</th>
              <th className={initiativeThClass}>Description</th>
              <th className={initiativeThClass}>Status</th>
              <th className={initiativeThClass}>Date Due</th>
              <th className={initiativeThClass}>Assignee</th>
              <th className={initiativeThClass}>Comments</th>
            </tr>
          </thead>
          <tbody>
            {taskRows.map((row) => (
              <InitiativeTaskRow
                key={row.id}
                row={row}
                onUpdateField={handleUpdateField}
                onAddSubTask={handleAddSubTask}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <button type="button" onClick={handleAddRow} className={addButtonClassName}>
          Add Task
        </button>

        <div ref={deleteControlsRef} className="flex flex-wrap items-start gap-2">
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
              <p className="text-sm font-semibold text-slate-900 dark:text-surface-primary">
                Select Task
              </p>

              <div className="mt-2 flex items-center gap-2">
                <label htmlFor={deleteInputId} className="sr-only">
                  Task number to delete
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
                  className="mt-2 text-xs text-red-600 dark:text-red-400"
                >
                  {deleteError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <GoToNav initiatives={allInitiatives} menuIdSuffix={initiative.slug} />
    </div>
  );
});

export default function InitiativeSummary({
  initiatives,
  tasksByInitiative,
  onUpdateField,
  onAddRow,
  onAddSubTask,
  onDeleteRow,
}: {
  initiatives: Initiative[];
  tasksByInitiative: AllInitiativeTasks;
  onUpdateField: (initiativeSlug: string, rowId: string, field: TaskField, value: string) => void;
  onAddRow: (initiativeSlug: string) => void;
  onAddSubTask: (initiativeSlug: string, parentTaskNumber: string) => void;
  onDeleteRow: (initiativeSlug: string, taskNumber: string) => boolean;
}) {
  return (
    <section aria-label="Initiative summary" className="space-y-8">
      <h2 className="section-heading">Initiative Summary</h2>

      {initiatives.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-surface-secondary">
          Task tables appear here after you add initiatives from Start New Initiative.
        </p>
      ) : (
        initiatives.map((initiative) => (
          <InitiativeTaskTable
            key={initiative.slug}
            initiative={initiative}
            displayLabel={initiative.title}
            allInitiatives={initiatives}
            tasks={tasksByInitiative[initiative.slug]}
            onUpdateField={onUpdateField}
            onAddRow={onAddRow}
            onAddSubTask={onAddSubTask}
            onDeleteRow={onDeleteRow}
          />
        ))
      )}
    </section>
  );
}
