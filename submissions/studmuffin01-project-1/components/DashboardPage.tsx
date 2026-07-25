"use client";

import { useCallback } from "react";
import CommandCenterRow from "@/components/CommandCenterRow";
import Dashboard from "@/components/Dashboard";
import InitiativeSummary from "@/components/InitiativeSummary";
import PageHeader from "@/components/PageHeader";
import PageShell, { CommandCenterSpacer } from "@/components/PageShell";
import { useInitiativeTasks } from "@/hooks/useInitiativeTasks";
import { useInitiatives } from "@/hooks/useInitiatives";

export default function DashboardPage() {
  const {
    tasksByInitiative,
    isLoaded: tasksLoaded,
    getTasks,
    ensureInitiativeTasks,
    updateTaskField,
    addTaskRow,
    addSubTaskRow,
    deleteTaskRow,
    removeInitiativeTasks,
  } = useInitiativeTasks();
  const { customInitiatives, deleteInitiative, isLoaded: initiativesLoaded } = useInitiatives();

  const handleDeleteInitiative = useCallback(
    (slug: string) => {
      if (deleteInitiative(slug)) {
        removeInitiativeTasks(slug);
      }
    },
    [deleteInitiative, removeInitiativeTasks]
  );

  if (!tasksLoaded || !initiativesLoaded) {
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
          <Dashboard
            initiatives={customInitiatives}
            tasksByInitiative={tasksByInitiative}
            onDeleteInitiative={handleDeleteInitiative}
          />
        </div>
      </CommandCenterRow>

      <div className="flex">
        <CommandCenterSpacer />
        <div className="min-w-0 flex-1 space-y-12 px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-5xl">
            <InitiativeSummary
              initiatives={customInitiatives}
              getTasks={getTasks}
              onEnsureTasks={ensureInitiativeTasks}
              onUpdateField={updateTaskField}
              onAddRow={addTaskRow}
              onAddSubTask={addSubTaskRow}
              onDeleteRow={deleteTaskRow}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
