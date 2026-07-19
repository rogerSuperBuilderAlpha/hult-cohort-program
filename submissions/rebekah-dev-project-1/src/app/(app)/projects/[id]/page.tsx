import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { progressPercent } from "@/lib/stats";
import {
  claimTaskAction,
  createTaskAction,
  deleteTaskAction,
  joinProjectAction,
  setTaskStatusAction,
} from "@/lib/actions";
import { DueBadge, PriorityBadge, ProgressBar } from "@/components/widgets";

export const dynamic = "force-dynamic";

const columns: { status: TaskStatus; title: string }[] = [
  { status: TaskStatus.TODO, title: "📋 To do" },
  { status: TaskStatus.IN_PROGRESS, title: "🛠️ In progress" },
  { status: TaskStatus.DONE, title: "🚢 Shipped" },
];

const moveTargets: Record<TaskStatus, { status: TaskStatus; label: string }[]> = {
  TODO: [{ status: TaskStatus.IN_PROGRESS, label: "Start →" }],
  IN_PROGRESS: [
    { status: TaskStatus.TODO, label: "← Back" },
    { status: TaskStatus.DONE, label: "Ship ✓" },
  ],
  DONE: [{ status: TaskStatus.IN_PROGRESS, label: "← Reopen" }],
};

export default async function ProjectBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/signin");
  const { id } = await params;
  const now = new Date();

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true } } } },
      tasks: {
        include: { assignee: { select: { id: true, name: true } } },
        orderBy: [{ priority: "desc" }, { dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
      },
    },
  });
  if (!project) notFound();

  const isMember = project.members.some((m) => m.userId === user.id);
  const done = project.tasks.filter((t) => t.status === TaskStatus.DONE).length;
  const percent = progressPercent(done, project.tasks.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/projects" className="text-xs text-slate-500 hover:text-indigo-300">
            ← All projects
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-white">{project.name}</h1>
          {project.description && <p className="mt-1 text-slate-400">{project.description}</p>}
          <p className="mt-1 text-xs text-slate-500">
            Owner: {project.owner.name} · Members:{" "}
            {project.members.map((m) => m.user.name).join(", ")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DueBadge dueDate={project.dueDate} now={now} />
          {!isMember && (
            <form action={joinProjectAction}>
              <input type="hidden" name="projectId" value={project.id} />
              <button
                type="submit"
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                Join project
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ProgressBar percent={percent} />
        <span className="shrink-0 text-sm text-slate-400">
          {done}/{project.tasks.length} shipped · {percent}%
        </span>
      </div>

      {isMember && (
        <form
          action={createTaskAction}
          className="grid grid-cols-1 gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:grid-cols-[3fr_1fr_1fr_auto]"
        >
          <input type="hidden" name="projectId" value={project.id} />
          <input
            name="title"
            required
            maxLength={140}
            placeholder="Add a task — small enough to ship today"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-400"
          />
          <select
            name="priority"
            defaultValue="MEDIUM"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-400"
            aria-label="Priority"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <input
            name="dueDate"
            type="date"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-400"
            aria-label="Due date"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-500 px-5 py-2 font-semibold text-white transition hover:bg-indigo-400"
          >
            Add
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map(({ status, title }) => {
          const tasks = project.tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="rounded-xl border border-slate-800 bg-slate-900/30 p-3">
              <h2 className="mb-3 px-1 text-sm font-semibold text-slate-300">
                {title} <span className="text-slate-500">({tasks.length})</span>
              </h2>
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li key={task.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                    <p className="text-sm text-slate-100">{task.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <PriorityBadge priority={task.priority} />
                      <DueBadge dueDate={task.dueDate} now={now} />
                      {task.assignee && (
                        <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300">
                          {task.assignee.id === user.id ? "you" : task.assignee.name}
                        </span>
                      )}
                    </div>
                    {isMember && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {moveTargets[task.status].map(({ status: target, label }) => (
                          <form key={target} action={setTaskStatusAction}>
                            <input type="hidden" name="taskId" value={task.id} />
                            <input type="hidden" name="status" value={target} />
                            <button
                              type="submit"
                              className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-indigo-400 hover:text-white"
                            >
                              {label}
                            </button>
                          </form>
                        ))}
                        {task.status !== TaskStatus.DONE && (
                          <form action={claimTaskAction}>
                            <input type="hidden" name="taskId" value={task.id} />
                            <button
                              type="submit"
                              className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-indigo-400 hover:text-white"
                            >
                              {task.assignee?.id === user.id ? "Unclaim" : "Claim"}
                            </button>
                          </form>
                        )}
                        {(task.createdById === user.id || project.ownerId === user.id) && (
                          <form action={deleteTaskAction}>
                            <input type="hidden" name="taskId" value={task.id} />
                            <button
                              type="submit"
                              className="rounded border border-slate-800 px-2 py-1 text-xs text-slate-500 transition hover:border-rose-500/50 hover:text-rose-300"
                            >
                              Delete
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </li>
                ))}
                {tasks.length === 0 && (
                  <li className="rounded-lg border border-dashed border-slate-800 p-3 text-center text-xs text-slate-600">
                    Empty
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
