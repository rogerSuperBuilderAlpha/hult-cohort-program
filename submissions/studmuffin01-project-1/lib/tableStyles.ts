/** Shared Tailwind class strings for data tables. */

export const tableClass =
  "w-full border-collapse overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200 dark:bg-surface-card dark:shadow-none dark:ring-surface-border";

export const thClass =
  "border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary";

export const tdClass =
  "border border-slate-200 px-4 py-3 text-sm text-slate-700 dark:border-surface-border dark:text-surface-secondary";

export const tdPrimaryClass =
  "border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 dark:border-surface-border dark:text-surface-primary";

/** Compact cells for initiative summary task tables. */
export const initiativeThClass =
  "border border-slate-200 bg-slate-50 px-2 py-1 text-left text-xs font-semibold leading-none text-slate-800 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary";

export const initiativeTdClass =
  "border border-slate-200 px-2 py-0.5 text-xs leading-tight text-slate-700 dark:border-surface-border dark:text-surface-secondary";

export const initiativeTaskNumberHeaderClass = `${initiativeThClass} w-28 whitespace-nowrap`;

export const initiativeTaskNumberClass = `${initiativeTdClass} w-28 whitespace-nowrap text-left tabular-nums`;

export const cohortTdBaseClass =
  "border px-4 py-0.5 text-sm leading-tight transition-colors duration-300";

export const cohortTdDefaultClass =
  "border border-slate-200 px-4 py-0.5 text-sm leading-tight text-slate-700 dark:border-surface-border dark:text-surface-secondary";

export const cohortTdDefaultNumberClass = `${cohortTdDefaultClass} text-center tabular-nums text-slate-600 dark:text-surface-secondary`;

export const cohortTdDefaultStatusClass = `${cohortTdDefaultClass} text-center font-bold tabular-nums text-slate-900 dark:text-surface-primary`;
