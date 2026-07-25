"use client";

import { useCallback, useEffect } from "react";
import CommandCenterRow from "@/components/CommandCenterRow";
import Dashboard from "@/components/Dashboard";
import InitiativeSummary from "@/components/InitiativeSummary";
import PageHeader from "@/components/PageHeader";
import PageShell, { CommandCenterSpacer } from "@/components/PageShell";
import TeamMembersPanel from "@/components/TeamMembersPanel";
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
  const { memberNames, members, addMember, removeMember, isLoaded: membersLoaded } =
    useTeamMembers();
  const {
    tasksByInitiative,
    isLoaded: tasksLoaded,
    seedInitiativeTasks,
    updateTaskField,
    addTaskRow,
    addSubTaskRow,
    deleteTaskRow,
    removeInitiativeTasks,
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
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-8 sm:px-6 lg:px-8">
          <TeamMembersPanel members={members} onAddMember={addMember} onRemoveMember={removeMember} />
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
      </CommandCenterRow>

      <div className="flex">
        <CommandCenterSpacer />
        <div className="min-w-0 flex-1 space-y-12 px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-5xl">
            <InitiativeSummary
              initiatives={activeCustomInitiatives}
              tasksByInitiative={tasksByInitiative}
              assigneeOptions={memberNames}
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
