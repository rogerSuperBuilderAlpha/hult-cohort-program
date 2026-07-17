'use client';

import { useEffect, useState } from 'react';
import { subscribeToMembers, subscribeToProjects, subscribeToTasks } from './data';
import type { Member, Project, Task } from './types';

/**
 * The cohort's shared work, live.
 *
 * One hook for all three collections because every screen needs all three to render a
 * card (task → its project, its assignee). Realtime via onSnapshot throughout: anything
 * the app shows arrives over a listener, so two people on the board see each other move.
 *
 * At cohort scale (65 members, tens of projects) these are small collections and
 * client-side filtering costs less than the extra indexed queries would.
 */
export function useCohort() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let loaded = 0;
    const settle = () => {
      loaded += 1;
      if (loaded >= 3) setReady(true);
    };

    const unsubs = [
      subscribeToTasks((t) => {
        setTasks(t);
        settle();
      }),
      subscribeToProjects((p) => {
        setProjects(p);
        settle();
      }),
      subscribeToMembers((m) => {
        setMembers(m);
        settle();
      }),
    ];

    return () => unsubs.forEach((u) => u());
  }, []);

  return { tasks, projects, members, ready };
}
