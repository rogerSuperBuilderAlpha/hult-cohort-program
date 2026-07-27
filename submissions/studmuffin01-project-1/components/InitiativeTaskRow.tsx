"use client";

import { memo, useEffect, useRef } from "react";
import SubTaskDueDateWarningPopover from "@/components/SubTaskDueDateWarningPopover";
import { getTaskNumberDepth, TASK_STATUS_OPTIONS, TaskField, TaskRow } from "@/lib/initiativeTasks";
import { initiativeTaskNumberClass, initiativeTdClass } from "@/lib/tableStyles";

const inputClassName =
  "min-w-0 flex-1 border-0 bg-transparent p-0 text-[11px] leading-snug text-inherit outline-none focus:ring-0";

const selectClassName =
  "w-full min-w-0 border-0 bg-transparent p-0 text-[11px] leading-snug text-inherit outline-none focus:ring-0 cursor-pointer appearance-none [&::-ms-expand]:hidden";

const subTaskButtonClassName =
  "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-semibold leading-none text-brand-600 transition-colors hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:text-brand-400 dark:hover:bg-brand-500/10";

interface DueDateWarningState {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface InitiativeTaskRowProps {
  row: TaskRow;
  assigneeOptions: string[];
  onUpdateField: (rowId: string, field: TaskField, value: string) => void;
  onAddSubTask: (parentTaskNumber: string) => void;
  onFieldBlur?: () => void;
  dueDateWarning?: DueDateWarningState | null;
}

function InitiativeTaskRow({
  row,
  assigneeOptions,
  onUpdateField,
  onAddSubTask,
  onFieldBlur,
  dueDateWarning,
}: InitiativeTaskRowProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const taskDepth = getTaskNumberDepth(row.taskNumber);
  const hierarchyIndentRem = 0.3 + taskDepth * 0.45;
  const assigneeValue = row.responsibility;
  const hasCustomAssignee =
    assigneeValue.length > 0 &&
    !assigneeOptions.some((name) => name.toLowerCase() === assigneeValue.toLowerCase());

  useEffect(() => {
    if (!dueDateWarning || !dateInputRef.current) {
      return;
    }

    dateInputRef.current.focus();

    try {
      dateInputRef.current.showPicker?.();
    } catch {
      // showPicker can throw if not triggered by a user gesture.
    }
  }, [dueDateWarning]);

  const handleDateBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (dueDateWarning) {
      const relatedTarget = event.relatedTarget;
      if (
        relatedTarget instanceof Element &&
        relatedTarget.closest("[data-due-date-warning]")
      ) {
        return;
      }

      dueDateWarning.onCancel();
    }

    onFieldBlur?.();
  };

  return (
    <tr className="align-middle">
      <td
        className={initiativeTaskNumberClass}
        style={{ paddingLeft: `${hierarchyIndentRem}rem` }}
      >
        {row.taskNumber}
      </td>
      <td className={`${initiativeTdClass} min-w-0`} style={{ paddingLeft: `${hierarchyIndentRem}rem` }}>
        <div className="flex items-center gap-1">
          <label htmlFor={`${row.id}-description`} className="sr-only">
            Task {row.taskNumber} description
          </label>
          <input
            id={`${row.id}-description`}
            type="text"
            value={row.description}
            onChange={(event) => onUpdateField(row.id, "description", event.target.value)}
            onBlur={onFieldBlur}
            className={inputClassName}
          />
          <button
            type="button"
            title="Add Sub-task"
            aria-label={`Add sub-task to task ${row.taskNumber}`}
            onClick={() => onAddSubTask(row.taskNumber)}
            className={subTaskButtonClassName}
          >
            +
          </button>
        </div>
      </td>
      <td className={initiativeTdClass}>
        <select
          id={`${row.id}-status`}
          value={row.status}
          onChange={(event) => onUpdateField(row.id, "status", event.target.value)}
          onBlur={onFieldBlur}
          className={selectClassName}
          aria-label={`Task ${row.taskNumber} status`}
        >
          <option value="" hidden />
          {TASK_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </td>
      <td className={`${initiativeTdClass} relative overflow-visible`}>
        <label htmlFor={`${row.id}-date-due`} className="sr-only">
          Task {row.taskNumber} date due
        </label>
        <input
          ref={dateInputRef}
          id={`${row.id}-date-due`}
          type="date"
          value={row.dateDue}
          onChange={(event) => onUpdateField(row.id, "dateDue", event.target.value)}
          onBlur={handleDateBlur}
          className={`${selectClassName} [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:p-0`}
        />
        {dueDateWarning && (
          <SubTaskDueDateWarningPopover
            message={dueDateWarning.message}
            onConfirm={dueDateWarning.onConfirm}
          />
        )}
      </td>
      <td className={initiativeTdClass}>
        <select
          id={`${row.id}-assignee`}
          value={assigneeValue}
          onChange={(event) => onUpdateField(row.id, "responsibility", event.target.value)}
          onBlur={onFieldBlur}
          className={selectClassName}
          aria-label={`Task ${row.taskNumber} assignee`}
        >
          <option value="">Unassigned</option>
          {hasCustomAssignee && (
            <option value={assigneeValue}>{assigneeValue}</option>
          )}
          {assigneeOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </td>
      <td className={`${initiativeTdClass} min-w-0 break-words`}>
        <label htmlFor={`${row.id}-comments`} className="sr-only">
          Task {row.taskNumber} comments
        </label>
        <input
          id={`${row.id}-comments`}
          type="text"
          value={row.comments}
          onChange={(event) => onUpdateField(row.id, "comments", event.target.value)}
          onBlur={onFieldBlur}
          className={selectClassName}
        />
      </td>
    </tr>
  );
}

export default memo(InitiativeTaskRow);
