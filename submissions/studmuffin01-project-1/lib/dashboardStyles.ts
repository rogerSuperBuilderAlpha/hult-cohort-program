/** Shared dashboard styling aligned with the welcome gate aesthetic. */

export const dashboardShellClassName =
  "flex min-h-screen flex-col bg-gradient-to-b from-stone-100 via-amber-50/35 to-stone-100 dark:from-[#0c1018] dark:via-surface-bg dark:to-[#0e1219]";

export const dashboardPanelClassName =
  "rounded-xl border border-stone-200/90 bg-white/95 p-6 shadow-md shadow-stone-900/[0.04] ring-1 ring-amber-900/[0.06] backdrop-blur-sm dark:border-slate-600/70 dark:bg-surface-card dark:shadow-lg dark:shadow-black/20 dark:ring-slate-700/40";

export const dashboardPanelCompactClassName =
  "rounded-xl border border-stone-200/90 bg-white/95 p-3 shadow-md shadow-stone-900/[0.04] ring-1 ring-amber-900/[0.06] backdrop-blur-sm dark:border-slate-600/70 dark:bg-surface-card dark:shadow-md dark:shadow-black/15 dark:ring-slate-700/40";

export const dashboardFooterClassName =
  "border-t border-stone-200/90 bg-white/80 py-6 text-center text-sm text-stone-500 backdrop-blur-sm dark:border-surface-border dark:bg-surface-card dark:text-surface-secondary";

export const dashboardPrimaryButtonClassName =
  "rounded-lg bg-amber-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-700/40 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-800 dark:hover:bg-amber-700";

export const dashboardNavActiveClassName =
  "bg-amber-100/90 text-amber-950 dark:bg-amber-500/15 dark:text-amber-300";

export const dashboardNavIdleClassName =
  "text-stone-700 hover:bg-stone-50 hover:text-stone-900 dark:text-surface-secondary dark:hover:bg-surface-bg dark:hover:text-surface-primary";

/** Command Center sidebar — olive / army green shell and navigation */
export const COMMAND_CENTER_SIDEBAR_WIDTH_CLASS = "w-64";

export const commandCenterAsideClassName =
  "flex w-64 shrink-0 flex-col border-r border-command-800 bg-gradient-to-b from-command-900 via-command-900 to-command-950 shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)] dark:border-command-700/90 dark:from-command-950 dark:via-command-900 dark:to-[#141a14] dark:shadow-[4px_0_24px_rgba(0,0,0,0.35)]";

export const commandCenterHeaderClassName =
  "flex min-h-[3.5rem] shrink-0 items-center justify-between gap-2 border-b border-command-700/80 bg-command-950/40 px-4 py-3 dark:border-command-600/70 dark:bg-command-950/60";

export const commandCenterTitleClassName =
  "font-display text-base font-extrabold uppercase leading-none tracking-[0.12em] text-command-khaki dark:text-command-100";

export const commandCenterNavActiveClassName =
  "bg-command-700/90 text-command-50 ring-1 ring-command-khaki/35 shadow-sm dark:bg-command-700 dark:text-command-50 dark:ring-command-khaki/45";

export const commandCenterNavIdleClassName =
  "text-command-100/95 hover:bg-command-800/80 hover:text-command-50 dark:text-command-200/90 dark:hover:bg-command-800 dark:hover:text-command-50";

export const commandCenterAiSectionClassName =
  "shrink-0 border-t border-command-700/80 bg-command-950/50 p-3 dark:border-command-600/70 dark:bg-command-950/70";

/** Header bar toggle — matches gateway gradient chrome on mobile */
export const commandCenterHeaderToggleClassName =
  "inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-2.5 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400/40 lg:hidden";

export const commandCenterMobileCloseClassName =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-command-200 transition-colors hover:bg-command-800 hover:text-command-50 focus:outline-none focus:ring-2 focus:ring-command-khaki/40 lg:hidden";

export const commandCenterAiTitleClassName =
  "text-sm font-semibold text-command-50";

export const commandCenterAiHintClassName =
  "mt-1 text-xs text-command-200/90";

export const commandCenterAiPromptButtonClassName =
  "rounded-md border border-command-600/80 bg-command-800/60 px-2 py-1 text-left text-[10px] leading-snug text-command-100 transition-colors hover:border-command-khaki/50 hover:bg-command-700/80 hover:text-command-50";

export const commandCenterAiTextareaClassName =
  "w-full resize-none rounded-lg border border-command-600/80 bg-command-800/50 px-3 py-2 text-xs text-command-50 placeholder:text-command-200/60 focus:border-command-khaki/60 focus:outline-none focus:ring-2 focus:ring-command-khaki/25 dark:border-command-600 dark:bg-command-900/80 dark:placeholder:text-command-300/50";

export const commandCenterAiSubmitClassName =
  "w-full rounded-lg bg-command-khaki px-3 py-2 text-xs font-semibold text-command-950 transition-colors hover:bg-command-100 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-command-khaki/40 focus:ring-offset-2 focus:ring-offset-command-900 dark:bg-command-khaki dark:text-command-950 dark:hover:bg-command-100 dark:focus:ring-offset-command-950";

export const commandCenterAiResponseClassName =
  "mt-2 max-h-48 overflow-y-auto rounded-lg border border-command-600/70 bg-command-800/40 px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap text-command-100 dark:border-command-600 dark:bg-command-900/60 dark:text-command-100";

export const dashboardHeaderSubtitleClassName =
  "mt-1 text-amber-100/90 dark:text-surface-secondary";
