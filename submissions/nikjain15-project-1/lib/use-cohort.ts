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
    // Which collections have delivered at least once — a SET, not a counter.
    //
    // A counter was the bug: projects and members re-fire on every cohort write, and they
    // are the small, fast collections while tasks is the largest. Two project snapshots
    // plus one member snapshot reaches three, and `ready` flips with `tasks` still empty.
    // That is exactly the state use-sync warns against — the dedupe then runs against an
    // empty board and twins a manual card against the sensed one it should have updated.
    const delivered = new Set<string>();
    const settle = (name: string) => {
      delivered.add(name);
      if (delivered.size >= 3) setReady(true);
    };

    const unsubs = [
      subscribeToTasks((t) => {
        setTasks(t);
        settle('tasks');
      }),
      subscribeToProjects((p) => {
        setProjects(p);
        settle('projects');
      }),
      subscribeToMembers((m) => {
        setMembers(m);
        settle('members');
      }),
    ];

    return () => unsubs.forEach((u) => u());
  }, []);

  return { tasks, projects, members, ready };
}
