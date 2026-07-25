"use client";

import { useId } from "react";

const panelClassName =
  "w-60 rounded-md border border-slate-200 bg-white p-2.5 shadow-lg dark:border-surface-border dark:bg-surface-card";

const confirmButtonClassName =
  "mt-2 w-full rounded border border-brand-600 bg-brand-600 px-2 py-1.5 text-xs font-semibold leading-snug text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

interface SubTaskDueDateWarningPopoverProps {
  message: string;
  onConfirm: () => void;
}

export default function SubTaskDueDateWarningPopover({
  message,
  onConfirm,
}: SubTaskDueDateWarningPopoverProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <div
      data-due-date-warning
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={`${panelClassName} absolute bottom-full left-0 z-[100] mb-1`}
    >
      <p
        id={titleId}
        className="text-[11px] font-semibold leading-snug text-amber-800 dark:text-amber-300"
      >
        Sub-task due date exceeds parent
      </p>
      <p
        id={descriptionId}
        className="mt-1 text-[11px] leading-snug text-slate-600 dark:text-surface-secondary"
      >
        {message}
      </p>
      <p className="mt-1.5 text-[10px] leading-snug text-slate-500 dark:text-surface-secondary">
        Pick another date in the calendar, or confirm below.
      </p>
      <button
        type="button"
        data-due-date-warning
        onMouseDown={(event) => event.preventDefault()}
        onClick={onConfirm}
        className={confirmButtonClassName}
      >
        Keep date &amp; adjust parent
      </button>
    </div>
  );
}
