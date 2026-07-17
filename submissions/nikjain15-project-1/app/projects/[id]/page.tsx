'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Board } from '@/components/Board';
import { applyFilters, Filters, useFilters } from '@/components/Filters';
import { ProjectModal } from '@/components/ProjectModal';
import { Avatar } from '@/components/TaskCard';
import { TaskModal } from '@/components/TaskModal';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { updateProject } from '@/lib/data';
import { useCohort } from '@/lib/use-cohort';
import type { Status, Task } from '@/lib/types';

export default function ProjectDetailPage() {
  return (
    <AppShell>
      <Suspense fallback={<p className="text-sm text-zinc-400">Loading…</p>}>
        <ProjectDetail />
      </Suspense>
    </AppShell>
  );
}

function ProjectDetail() {
  // Client component: params is a plain object, not the promise a server component gets.
  const { id } = useParams<{ id: string }>();
  const { user, memberName } = useAuth();
  const { tasks, projects, members, ready } = useCohort();
  const filters = useFilters();

  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState<Status | null>(null);
  const [editingProject, setEditingProject] = useState(false);

  const actor = useMemo(
    () => ({
      uid: user!.uid,
      // From the member doc, not the Firebase User — the rules check actorName against it.
      name: memberName ?? user!.displayName ?? user!.email?.split('@')[0] ?? 'member',
      photoURL: user!.photoURL,
    }),
    [user, memberName]
  );

  const project = projects.find((p) => p.id === id);
  const owner = members.find((m) => m.uid === project?.ownerUid);

  const visible = useMemo(
    () => applyFilters(tasks.filter((t) => t.projectId === id), filters),
    [tasks, id, filters]
  );

  if (!ready) return <p className="text-sm text-zinc-400">Loading…</p>;

  if (!project) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-zinc-300">That project isn’t here. The cohort still is, though.</p>
        <Link href="/projects" className="mt-3 inline-block text-xs text-emerald-400 hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Link href="/projects" className="text-xs text-zinc-400 hover:text-zinc-400">
          ← projects
        </Link>

        <div className="mt-2 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-medium text-zinc-100">
              {project.name}
              {project.archived && (
                <span className="ml-2 rounded border border-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
                  archived
                </span>
              )}
            </h1>
            {project.description && (
              <p className="mt-1 text-xs text-zinc-400">{project.description}</p>
            )}
            {owner && (
              <div className="mt-2 flex items-center gap-2">
                <Avatar member={owner} size={16} />
                <span className="text-xs text-zinc-400">{owner.displayName}</span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button onClick={() => setEditingProject(true)}>Edit</Button>
            <Button onClick={() => updateProject(project.id, { archived: !project.archived })}>
              {project.archived ? 'Restore' : 'Archive'}
            </Button>
          </div>
        </div>
      </div>

      {/* Project is fixed by the route, so that filter would be a no-op here. */}
      <Filters
        uid={actor.uid}
        members={members}
        projects={projects}
        showProject={false}
        onNew={() => setCreating('todo')}
      />

      <Board
        actor={actor}
        tasks={visible}
        projects={projects}
        members={members}
        onOpenTask={setEditing}
        onNewTask={setCreating}
      />

      {(editing || creating) && (
        <TaskModal
          actor={actor}
          task={editing}
          projects={projects.filter((p) => !p.archived)}
          members={members}
          defaultProjectId={project.id}
          defaultStatus={creating ?? undefined}
          onClose={() => {
            setEditing(null);
            setCreating(null);
          }}
        />
      )}

      {editingProject && (
        <ProjectModal actor={actor} project={project} onClose={() => setEditingProject(false)} />
      )}
    </>
  );
}
