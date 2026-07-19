'use client';

import { Suspense, useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Board } from '@/components/Board';
import { applyFilters, Filters, useFilters } from '@/components/Filters';
import { SyncNote } from '@/components/SyncNote';
import { TaskModal } from '@/components/TaskModal';
import { WorkflowPicker } from '@/components/WorkflowPicker';
import { placeCard } from '@/lib/board-view';
import { useAuth } from '@/lib/auth-context';
import { useBoardView } from '@/lib/use-board-view';
import { useGitHubLink } from '@/lib/use-github-link';
import { useCohort } from '@/lib/use-cohort';
import { useSync } from '@/lib/use-sync';
import { columnsOrDefault } from '@/lib/workflows';
import type { Status, Task } from '@/lib/types';

export default function BoardPage() {
  return (
    <AppShell>
      {/* useSearchParams needs a Suspense boundary — the filters read the URL. */}
      <Suspense fallback={<p className="text-sm text-zinc-400">Loading the board…</p>}>
        <BoardView />
      </Suspense>
    </AppShell>
  );
}

function BoardView() {
  const { user, memberName } = useAuth();
  const { tasks, projects, members, ready } = useCohort();
  const filters = useFilters();

  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState<Status | null>(null);

  const actor = useMemo(
    () => ({
      uid: user!.uid,
      // From the member doc, not the Firebase User — the rules check actorName against it.
      name: memberName ?? user!.displayName ?? user!.email?.split('@')[0] ?? 'member',
      photoURL: user!.photoURL,
    }),
    [user, memberName]
  );

  // The board builds itself — but only ever as a bonus on top of a board that already
  // works. Every branch of this hook is best-effort; none of it gates what renders below.
  const { link, ready: linkReady } = useGitHubLink(user!.uid);
  const outcome = useSync({ actor, link, tasks, projects, members, ready: ready && linkReady });

  // The user's private workflow lens. Null (no choice) → the classic three-column board.
  const view = useBoardView(user!.uid);
  const columns = useMemo(() => columnsOrDefault(view), [view]);

  // Archived projects' tasks stay off the board — archiving is how you get work out of
  // sight without deleting it, and nothing in Project 1 hard-deletes a project.
  const liveProjects = useMemo(() => projects.filter((p) => !p.archived), [projects]);

  const visible = useMemo(() => {
    const liveIds = new Set(liveProjects.map((p) => p.id));
    return applyFilters(tasks.filter((t) => liveIds.has(t.projectId)), filters);
  }, [tasks, liveProjects, filters]);

  return (
    <>
      <div className="mb-4">
        <h1 className="text-sm font-medium text-zinc-100">Board</h1>
        <p className="mt-1 text-xs text-zinc-400">
          Pulse moves these when you ship. Drag works too — every card says where it came from.
        </p>
      </div>

      <SyncNote outcome={outcome} />

      <div className="mb-3 flex items-center justify-end">
        <WorkflowPicker uid={actor.uid} view={view} />
      </div>

      <Filters uid={actor.uid} members={members} projects={liveProjects} onNew={() => setCreating('todo')} />

      {!ready ? (
        <p className="text-sm text-zinc-400">Loading the board…</p>
      ) : (
        <Board
          actor={actor}
          tasks={visible}
          projects={liveProjects}
          members={members}
          onOpenTask={setEditing}
          onNewTask={setCreating}
          columns={columns}
          placement={view?.placement}
          onPlaceCard={(taskId, laneId) => void placeCard(actor.uid, taskId, laneId)}
        />
      )}

      {(editing || creating) && (
        <TaskModal
          actor={actor}
          task={editing}
          projects={liveProjects}
          members={members}
          defaultProjectId={filters.project !== 'all' ? filters.project : undefined}
          defaultStatus={creating ?? undefined}
          onClose={() => {
            setEditing(null);
            setCreating(null);
          }}
        />
      )}
    </>
  );
}
