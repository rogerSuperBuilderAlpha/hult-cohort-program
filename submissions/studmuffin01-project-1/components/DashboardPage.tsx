"use client";

import CommandCenterRow from "@/components/CommandCenterRow";
import Dashboard from "@/components/Dashboard";
import InitiativeSummary from "@/components/InitiativeSummary";
import PageHeader from "@/components/PageHeader";
import PageShell, { CommandCenterSpacer } from "@/components/PageShell";
import { useCohortSubmissions } from "@/hooks/useCohortSubmissions";

export default function DashboardPage() {
  const { submissions, isLoaded, toggleSubmission, updateRowName } = useCohortSubmissions();

  if (!isLoaded) {
    return (
      <PageShell header={<PageHeader id="top" />}>
        <CommandCenterRow>
          <div className="flex items-center justify-center px-4 pb-8 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
              <p className="mt-4 text-slate-600 dark:text-surface-secondary">Loading...</p>
            </div>
          </div>
        </CommandCenterRow>
      </PageShell>
    );
  }

  return (
    <PageShell
      header={<PageHeader id="top" />}
      footer={
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500 dark:border-surface-border dark:bg-surface-card dark:text-surface-secondary">
          Built with Next.js &amp; Tailwind CSS
        </footer>
      }
    >
      <CommandCenterRow>
        <div className="mx-auto w-full max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
          <Dashboard submissions={submissions} />
        </div>
      </CommandCenterRow>

      <div className="flex">
        <CommandCenterSpacer />
        <div className="min-w-0 flex-1 space-y-12 px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-5xl">
            <InitiativeSummary
              submissions={submissions}
              onToggle={toggleSubmission}
              onUpdateName={updateRowName}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
