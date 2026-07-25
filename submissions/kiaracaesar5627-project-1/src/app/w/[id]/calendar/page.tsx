import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getSessionUser } from "@/lib/auth";
import { listTasksForWorkspace } from "@/lib/db";
import { getShellData } from "@/lib/workspace-server";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shell = await getShellData(id);
  if (!shell) {
    const user = await getSessionUser();
    redirect(user ? "/workspaces" : "/login");
  }
  const { user, workspace, role, workspaces, unread } = shell;

  const tasks = (await listTasksForWorkspace(id)).filter((t) => t.due_date);
  const byDay = new Map<string, typeof tasks>();
  for (const t of tasks) {
    const key = t.due_date!.slice(0, 10);
    const arr = byDay.get(key) ?? [];
    arr.push(t);
    byDay.set(key, arr);
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: { date: Date; dim: boolean }[] = [];
  for (let i = 0; i < startDay; i++) {
    cells.push({ date: new Date(year, month, i - startDay + 1), dim: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), dim: false });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getTime() + 86400000), dim: true });
  }

  const fmt = (dt: Date) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
      dt.getDate(),
    ).padStart(2, "0")}`;

  return (
    <AppShell
      user={user}
      workspace={workspace}
      role={role}
      workspaces={workspaces}
      unread={unread}
      active="calendar"
    >
      <div className="stack">
        <div>
          <p className="brand-sub">Calendar</p>
          <h1>
            {first.toLocaleString(undefined, { month: "long" })} {year}
          </h1>
          <p className="lead" style={{ marginBottom: 0 }}>
            Tasks plotted by due date across every project.
          </p>
        </div>

        <div className="calendar">
          {WEEKDAYS.map((w) => (
            <div className="cal-head" key={w}>
              {w}
            </div>
          ))}
          {cells.map((cell, i) => {
            const key = fmt(cell.date);
            const dayTasks = byDay.get(key) ?? [];
            return (
              <div key={i} className={`cal-cell${cell.dim ? " dim" : ""}`}>
                <div className="daynum">{cell.date.getDate()}</div>
                {dayTasks.slice(0, 4).map((t) => (
                  <Link
                    key={t.id}
                    href={`/w/${id}/tasks/${t.id}`}
                    className="cal-task"
                    title={t.title}
                  >
                    {t.title}
                  </Link>
                ))}
                {dayTasks.length > 4 ? (
                  <span className="muted">+{dayTasks.length - 4} more</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
