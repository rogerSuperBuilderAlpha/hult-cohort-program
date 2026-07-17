'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { ProjectModal } from '@/components/ProjectModal';
import { Avatar } from '@/components/TaskCard';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { updateProject } from '@/lib/data';
import { useCohort } from '@/lib/use-cohort';
import { STATUSES, STATUS_LABELS, type Member, type Project, type Task } from '@/lib/types';

export default function ProjectsPage() {
  return (
    <AppShell>
      <ProjectsView />
    </AppShell>
  );
}

/**
 * Inside AppShell, not beside it: the shell returns null until auth resolves, so this
 * component's hooks never run with a null user. Hoisting them into the page instead makes
 * `user!.uid` a real crash at prerender.
 */
function ProjectsView() {
  const { user } = useAuth();
  const { tasks, projects, members, ready } = useCohort();

  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const actor = useMemo(
    () => ({
      uid: user!.uid,
      name: user!.displayName ?? user!.email?.split('@')[0] ?? 'member',
      photoURL: user!.photoURL,
    }),
    [user]
  );

  const memberByUid = useMemo(() => new Map(members.map((m) => [m.uid, m])), [members]);
  const visible = useMemo(
    () => projects.filter((p) => (showArchived ? p.archived : !p.archived)),
    [projects, showArchived]
  );

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div>
          <h1 className="text-sm font-medium text-zinc-100">Projects</h1>
          <p className="mt-1 text-xs text-zinc-500">
            Connected repos become projects. Manual ones are for everything that isn’t code.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="min-h-11 rounded border border-zinc-800 px-3 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-100"
          >
            {showArchived ? 'show active' : 'show archived'}
          </button>
          <Button variant="primary" onClick={() => setCreating(true)}>
            New project
          </Button>
        </div>
      </div>

      {!ready ? (
        <p className="text-sm text-zinc-500">Loading projects…</p>
      ) : visible.length === 0 ? (
        <p className="rounded-lg border border-zinc-800 bg-zinc-900/30 py-10 text-center text-sm text-zinc-500">
          {showArchived ? 'Nothing archived.' : 'No projects yet. Create one to put a task in it.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              tasks={tasks.filter((t) => t.projectId === project.id)}
              owner={memberByUid.get(project.ownerUid)}
              onEdit={() => setEditing(project)}
            />
          ))}
        </ul>
      )}

      {(creating || editing) && (
        <ProjectModal
          actor={actor}
          project={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function ProjectRow({
  project,
  tasks,
  owner,
  onEdit,
}: {
  project: Project;
  tasks: Task[];
  owner?: Member;
  onEdit: () => void;
}) {
  return (
    <li className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <Link href={`/projects/${project.id}`} className="text-sm text-zinc-100 hover:underline">
            {project.name}
          </Link>
          {project.description && (
            <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{project.description}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {STATUSES.map((s) => (
              <span key={s} className="text-xs text-zinc-600">
                {STATUS_LABELS[s].toLowerCase()} · {tasks.filter((t) => t.status === s).length}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {owner && <Avatar member={owner} />}
          <button
            onClick={onEdit}
            className="min-h-11 px-2 text-xs text-zinc-500 transition-colors hover:text-zinc-200"
          >
            edit
          </button>
          <button
            // Archive, never delete. The feed references projects by id, and nothing in
            // Project 1 hard-deletes — un-archiving has to stay possible.
            onClick={() => updateProject(project.id, { archived: !project.archived })}
            className="min-h-11 px-2 text-xs text-zinc-500 transition-colors hover:text-zinc-200"
          >
            {project.archived ? 'restore' : 'archive'}
          </button>
        </div>
      </div>
    </li>
  );
}
