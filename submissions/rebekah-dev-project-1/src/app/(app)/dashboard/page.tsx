import Link from "next/link";
import { redirect } from "next/navigation";
import { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { computeStreak, momentum } from "@/lib/stats";
import { setTaskStatusAction } from "@/lib/actions";
import { DueBadge, PriorityBadge, StatCard } from "@/components/widgets";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/signin");
  const now = new Date();

  const [myCompleted, nextActions, dueSoon, shipFeed, myProjectCount] = await Promise.all([
    prisma.task.findMany({
      where: { assigneeId: user.id, status: TaskStatus.DONE, completedAt: { not: null } },
      select: { completedAt: true },
    }),
    prisma.task.findMany({
      where: {
        status: { not: TaskStatus.DONE },
        project: { members: { some: { userId: user.id } } },
        OR: [{ assigneeId: user.id }, { assigneeId: null }],
      },
      include: { project: { select: { id: true, name: true } } },
      orderBy: [{ priority: "desc" }, { dueDate: { sort: "asc", nulls: "last" } }],
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        status: { not: TaskStatus.DONE },
        dueDate: { lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
        project: { members: { some: { userId: user.id } } },
      },
      include: { project: { select: { id: true, name: true } } },
      orderBy: { dueDate: "asc" },
      take: 8,
    }),
    prisma.task.findMany({
      where: { status: TaskStatus.DONE, completedAt: { not: null } },
      include: {
        assignee: { select: { name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { completedAt: "desc" },
      take: 10,
    }),
    prisma.projectMember.count({ where: { userId: user.id } }),
  ]);

  const completionDates = myCompleted
    .map((t) => t.completedAt)
    .filter((d): d is Date => d !== null);
  const streak = computeStreak(completionDates, now);
  const { thisWeek, lastWeek, delta } = momentum(completionDates, now);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {streak > 0 ? `🔥 ${streak}-day streak, ${user.name}!` : `Welcome, ${user.name}`}
        </h1>
        <p className="mt-1 text-slate-400">
          {streak > 0
            ? "Ship one task today to keep it alive."
            : "Complete a task today to start a shipping streak."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Shipped this week"
          value={String(thisWeek)}
          hint={
            delta === 0
              ? `same as last week (${lastWeek})`
              : delta > 0
                ? `▲ ${delta} more than last week`
                : `▼ ${-delta} fewer than last week`
          }
        />
        <StatCard label="Current streak" value={`${streak} day${streak === 1 ? "" : "s"}`} hint="days in a row with a completed task" />
        <StatCard label="My projects" value={String(myProjectCount)} hint="projects you're a member of" />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">🎯 Next actions</h2>
        {nextActions.length === 0 ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-slate-400">
            Nothing queued.{" "}
            <Link href="/projects" className="text-indigo-300 hover:underline">
              Open a project
            </Link>{" "}
            and add your next task.
          </p>
        ) : (
          <ul className="space-y-2">
            {nextActions.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3"
              >
                <form action={setTaskStatusAction}>
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="status" value="DONE" />
                  <button
                    type="submit"
                    title="Mark done"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-600 text-transparent transition hover:border-emerald-400 hover:text-emerald-400"
                  >
                    ✓
                  </button>
                </form>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-slate-100">{task.title}</p>
                  <Link
                    href={`/projects/${task.project.id}`}
                    className="text-xs text-slate-500 hover:text-indigo-300"
                  >
                    {task.project.name}
                  </Link>
                </div>
                <PriorityBadge priority={task.priority} />
                <DueBadge dueDate={task.dueDate} now={now} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">⏰ Deadlines (next 7 days)</h2>
          {dueSoon.length === 0 ? (
            <p className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-slate-400">
              No deadlines in the next week. Breathe.
            </p>
          ) : (
            <ul className="space-y-2">
              {dueSoon.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-slate-100">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.project.name}</p>
                  </div>
                  <DueBadge dueDate={task.dueDate} now={now} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">🚢 Cohort ship feed</h2>
          {shipFeed.length === 0 ? (
            <p className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-slate-400">
              Nothing shipped yet. Be the first!
            </p>
          ) : (
            <ul className="space-y-2">
              {shipFeed.map((task) => (
                <li
                  key={task.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3"
                >
                  <p className="text-sm text-slate-100">
                    <span className="font-semibold text-emerald-300">
                      {task.assignee?.name ?? "Someone"}
                    </span>{" "}
                    shipped <span className="font-medium">{task.title}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {task.project.name} ·{" "}
                    {task.completedAt ? new Date(task.completedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }) + " UTC" : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
