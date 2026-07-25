/** Shared Tailwind class strings for data tables. */

/** Compact cells for initiative summary task tables. */
export const initiativeSummaryTableClass =
  "w-full table-fixed border-collapse text-[11px] leading-snug";

export const initiativeThClass =
  "border border-slate-200 bg-slate-50 px-1 py-0.5 text-left text-[10px] font-semibold leading-tight text-slate-800 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary";

export const initiativeTdClass =
  "border border-slate-200 px-1 py-0.5 text-[11px] leading-snug text-slate-700 dark:border-surface-border dark:text-surface-secondary";

export const initiativeTaskNumberHeaderClass = `${initiativeThClass} whitespace-nowrap tabular-nums`;

export const initiativeTaskNumberClass = `${initiativeTdClass} whitespace-nowrap text-left tabular-nums`;

/** Compact Executive Summary table — fits main column without horizontal scroll. */
export const executiveSummaryTableClass =
  "w-full table-fixed border-collapse rounded-xl bg-white text-xs shadow-md ring-1 ring-slate-200 dark:bg-surface-card dark:shadow-none dark:ring-surface-border";

export const executiveSummaryThClass =
  "border border-slate-200 bg-slate-50 px-1.5 py-2 text-left text-[11px] font-semibold leading-tight text-slate-800 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary";

export const executiveSummaryThCenterClass = `${executiveSummaryThClass} text-center`;

export const executiveSummaryThWrapClass =
  `${executiveSummaryThCenterClass} whitespace-normal leading-tight`;

export const executiveSummaryTdClass =
  "border border-slate-200 px-1.5 py-2 text-xs leading-snug text-slate-700 dark:border-surface-border dark:text-surface-secondary";

export const executiveSummaryTdPrimaryClass =
  "border border-slate-200 px-1.5 py-2 text-xs leading-snug font-medium text-slate-900 dark:border-surface-border dark:text-surface-primary";

export const executiveSummaryTdCenterClass = `${executiveSummaryTdClass} text-center tabular-nums`;

/** Compact tables for Command Center sidebar pages — table-fixed, no horizontal scroll. */
export const sidebarTableClass =
  "w-full table-fixed border-collapse rounded-lg bg-white text-xs shadow-sm ring-1 ring-slate-200 dark:bg-surface-card dark:shadow-none dark:ring-surface-border";

export const sidebarThClass =
  "border border-slate-200 bg-slate-50 px-2 py-1.5 text-left text-[11px] font-semibold leading-tight text-slate-800 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary";

export const sidebarTdClass =
  "border border-slate-200 px-2 py-1.5 text-xs leading-snug text-slate-700 dark:border-surface-border dark:text-surface-secondary";

export const sidebarTdPrimaryClass =
  "border border-slate-200 px-2 py-1.5 text-xs leading-snug font-medium text-slate-900 dark:border-surface-border dark:text-surface-primary break-words";

export const sidebarSectionTitleClass =
  "text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-surface-secondary";
