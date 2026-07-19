import Link from "next/link";
import { redirect } from "next/navigation";
import { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { progressPercent } from "@/lib/stats";
import { createProjectAction, joinProjectAction } from "@/lib/actions";
import { DueBadge, ProgressBar } from "@/components/widgets";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await currentUser();
  if (!user) redirect("/signin");
  const now = new Date();

  const projects = await prisma.project.findMany({
    include: {
      owner: { select: { name: true } },
      members: { select: { userId: true } },
      tasks: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <h1 className="text-xl font-bold text-white">Start a project</h1>
        <form action={createProjectAction} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_2fr_1fr_auto]">
          <input
            name="name"
            required
            maxLength={100}
            placeholder="Project name"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-400"
          />
          <input
            name="description"
            maxLength={500}
            placeholder="What are you building? (optional)"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-400"
          />
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
            Create
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">All cohort projects</h2>
        {projects.length === 0 ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-slate-400">
            No projects yet — create the first one above.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {projects.map((project) => {
              const total = project.tasks.length;
              const done = project.tasks.filter((t) => t.status === TaskStatus.DONE).length;
              const percent = progressPercent(done, total);
              const isMember = project.members.some((m) => m.userId === user.id);
              return (
                <div key={project.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-lg font-semibold text-white hover:text-indigo-300"
                      >
                        {project.name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        by {project.owner.name} · {project.members.length} member
                        {project.members.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <DueBadge dueDate={project.dueDate} now={now} />
                  </div>
                  {project.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-400">{project.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-3">
                    <ProgressBar percent={percent} />
                    <span className="shrink-0 text-xs text-slate-400">
                      {done}/{total} · {percent}%
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="rounded-lg border border-slate-700 px-4 py-1.5 text-sm text-slate-200 transition hover:border-slate-500"
                    >
                      Open board
                    </Link>
                    {!isMember && (
                      <form action={joinProjectAction}>
                        <input type="hidden" name="projectId" value={project.id} />
                        <button
                          type="submit"
                          className="rounded-lg bg-indigo-500/20 px-4 py-1.5 text-sm text-indigo-300 transition hover:bg-indigo-500/30"
                        >
                          Join
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
