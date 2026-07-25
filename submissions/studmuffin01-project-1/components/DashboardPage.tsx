"use client";

import { Suspense, useCallback, useEffect } from "react";
import CommandCenterPageShell from "@/components/CommandCenterPageShell";
import CommandCenterRow from "@/components/CommandCenterRow";
import Dashboard from "@/components/Dashboard";
import InitiativeSummary from "@/components/InitiativeSummary";
import PageHeader from "@/components/PageHeader";
import ScrollToInitiativeOnLoad from "@/components/ScrollToInitiativeOnLoad";
import { dashboardFooterClassName } from "@/lib/dashboardStyles";
import { useInitiativeTasks } from "@/hooks/useInitiativeTasks";
import { useInitiatives } from "@/hooks/useInitiatives";
import { useTeamMembers } from "@/hooks/useTeamMembers";

export default function DashboardPage() {
  const {
    activeCustomInitiatives,
    archivedCustomInitiatives,
    updateInitiativeTitle,
    archiveInitiative,
    unarchiveInitiative,
    deleteInitiative,
    isLoaded: initiativesLoaded,
  } = useInitiatives();
  const { memberNames, isLoaded: membersLoaded } = useTeamMembers();
  const {
    tasksByInitiative,
    pendingDueDateConfirmation,
    isLoaded: tasksLoaded,
    seedInitiativeTasks,
    updateTaskField,
    addTaskRow,
    addSubTaskRow,
    deleteTaskRow,
    removeInitiativeTasks,
    flushFieldSave,
    confirmDueDateRollup,
    cancelDueDateRollup,
  } = useInitiativeTasks({
    initiativesReady: initiativesLoaded,
    initiativeSlugs: activeCustomInitiatives.map((initiative) => initiative.slug),
  });

  useEffect(() => {
    if (!tasksLoaded || !initiativesLoaded) {
      return;
    }

    for (const initiative of activeCustomInitiatives) {
      if (!tasksByInitiative[initiative.slug]) {
        seedInitiativeTasks(initiative.slug);
      }
    }
  }, [
    activeCustomInitiatives,
    initiativesLoaded,
    seedInitiativeTasks,
    tasksByInitiative,
    tasksLoaded,
  ]);

  const handleDeleteInitiative = useCallback(
    (slug: string) => {
      if (deleteInitiative(slug)) {
        removeInitiativeTasks(slug);
      }
    },
    [deleteInitiative, removeInitiativeTasks]
  );

  const handleArchiveInitiative = useCallback(
    (slug: string) => {
      archiveInitiative(slug);
    },
    [archiveInitiative]
  );

  if (!tasksLoaded || !initiativesLoaded || !membersLoaded) {
    return (
      <CommandCenterPageShell header={<PageHeader id="top" />}>
        <CommandCenterRow>
          <div className="flex items-center justify-center px-4 pb-8 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
              <p className="mt-4 text-slate-600 dark:text-surface-secondary">Loading...</p>
            </div>
          </div>
        </CommandCenterRow>
      </CommandCenterPageShell>
    );
  }

  return (
    <CommandCenterPageShell
      header={<PageHeader id="top" />}
      footer={
        <footer className={dashboardFooterClassName}>
          Built with Next.js &amp; Tailwind CSS
        </footer>
      }
    >
      <Suspense fallback={null}>
        <ScrollToInitiativeOnLoad ready={tasksLoaded && initiativesLoaded && membersLoaded} />
      </Suspense>
      <CommandCenterRow>
        <div className="space-y-6 px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-5xl">
            <Dashboard
              initiatives={activeCustomInitiatives}
              archivedInitiatives={archivedCustomInitiatives}
              tasksByInitiative={tasksByInitiative}
              onUpdateInitiativeTitle={updateInitiativeTitle}
              onArchiveInitiative={handleArchiveInitiative}
              onUnarchiveInitiative={unarchiveInitiative}
              onDeleteInitiative={handleDeleteInitiative}
            />
          </div>
          <div className="mx-auto w-full max-w-7xl">
            <InitiativeSummary
              initiatives={activeCustomInitiatives}
              tasksByInitiative={tasksByInitiative}
              assigneeOptions={memberNames}
              onUpdateField={updateTaskField}
              onAddRow={addTaskRow}
              onAddSubTask={addSubTaskRow}
              onDeleteRow={deleteTaskRow}
              onFieldBlur={flushFieldSave}
              pendingDueDateConfirmation={pendingDueDateConfirmation}
              onConfirmDueDateRollup={confirmDueDateRollup}
              onCancelDueDateRollup={cancelDueDateRollup}
            />
          </div>
        </div>
      </CommandCenterRow>
    </CommandCenterPageShell>
  );
}
