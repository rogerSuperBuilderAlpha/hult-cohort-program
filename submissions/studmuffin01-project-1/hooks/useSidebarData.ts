"use client";

import { useMemo } from "react";
import { useInitiativeTasks } from "@/hooks/useInitiativeTasks";
import { useInitiatives } from "@/hooks/useInitiatives";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import {
  flattenTasks,
  getActionItems,
  getMemberTasks,
  getPerformerScores,
} from "@/lib/sidebarStats";

/** @internal Use `useSidebarData` from `@/hooks/SidebarDataProvider` in UI code. */
export function useSidebarData() {
  const {
    activeCustomInitiatives,
    isLoaded: initiativesLoaded,
  } = useInitiatives();
  const { members, isLoaded: membersLoaded } = useTeamMembers();
  const {
    tasksByInitiative,
    isLoaded: tasksLoaded,
  } = useInitiativeTasks({
    initiativesReady: initiativesLoaded,
    initiativeSlugs: activeCustomInitiatives.map((initiative) => initiative.slug),
  });

  const isLoaded = initiativesLoaded && membersLoaded && tasksLoaded;

  const initiatives = activeCustomInitiatives;

  const flatTasks = useMemo(
    () => (isLoaded ? flattenTasks(initiatives, tasksByInitiative) : []),
    [initiatives, isLoaded, tasksByInitiative]
  );

  const actionItems = useMemo(
    () => (isLoaded ? getActionItems(flatTasks) : []),
    [flatTasks, isLoaded]
  );

  const performerScores = useMemo(
    () => (isLoaded ? getPerformerScores(flatTasks) : []),
    [flatTasks, isLoaded]
  );

  return {
    isLoaded,
    initiatives,
    members,
    tasksByInitiative,
    flatTasks,
    actionItems,
    performerScores,
    getMemberTasks: (memberName: string) => getMemberTasks(flatTasks, memberName),
  };
}
