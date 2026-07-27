"use client";

import CommandCenterPageShell from "@/components/CommandCenterPageShell";
import CommandCenterRow from "@/components/CommandCenterRow";
import PageHeader from "@/components/PageHeader";
import { useSidebarData } from "@/hooks/SidebarDataProvider";
import {
  dashboardPanelCompactClassName,
} from "@/lib/dashboardStyles";
import { sidebarSectionTitleClass } from "@/lib/tableStyles";

interface SidebarPageFrameProps {
  title: string;
  subtitle?: string;
  /** When set, page content waits for this in addition to sidebar data (e.g. Team Members roster). */
  contentLoaded?: boolean;
  children: React.ReactNode;
}

function SidebarPageMain({
  contentLoaded = true,
  children,
}: {
  contentLoaded?: boolean;
  children: React.ReactNode;
}) {
  const { isLoaded: sidebarLoaded } = useSidebarData();
  const ready = sidebarLoaded && contentLoaded;

  return (
    <main className="w-full px-4 pb-4 sm:px-6 lg:px-8">
      {!ready ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            <p className="mt-3 text-sm text-slate-600 dark:text-surface-secondary">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </main>
  );
}

export default function SidebarPageFrame({
  title,
  subtitle,
  contentLoaded,
  children,
}: SidebarPageFrameProps) {
  return (
    <CommandCenterPageShell
      header={
        <PageHeader
          backHref="/"
          backLabel="← Back to Executive Summary"
          title={title}
          subtitle={subtitle}
        />
      }
    >
      <CommandCenterRow>
        <SidebarPageMain contentLoaded={contentLoaded}>{children}</SidebarPageMain>
      </CommandCenterRow>
    </CommandCenterPageShell>
  );
}

export function SidebarPanelCompact({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${dashboardPanelCompactClassName} ${className}`}>{children}</div>;
}

export function SidebarSectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className={sidebarSectionTitleClass}>{children}</h2>;
}

export function StatCard({
  label,
  value,
  hint,
  compact = false,
  trailing,
}: {
  label: string;
  value: string | number;
  hint?: string;
  compact?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-surface-border dark:bg-surface-bg">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-surface-secondary">
        {label}
      </p>
      <div className={`mt-0.5 flex items-center gap-1.5 ${compact ? "text-lg" : "text-2xl"} font-bold tabular-nums text-slate-900 dark:text-surface-primary`}>
        {trailing}
        <span>{value}</span>
      </div>
      {hint && (
        <p className="mt-0.5 text-[10px] text-slate-500 dark:text-surface-secondary">{hint}</p>
      )}
    </div>
  );
}

export const sidebarSelectClassName =
  "mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary";

export const sidebarLabelClassName =
  "text-[11px] font-semibold text-slate-900 dark:text-surface-primary";

export const sidebarHintClassName =
  "text-[10px] leading-snug text-slate-500 dark:text-surface-secondary";
