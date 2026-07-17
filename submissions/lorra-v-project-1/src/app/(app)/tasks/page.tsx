import Link from "next/link";
import { createTask, updateTaskStatus } from "@/app/actions/tasks";
import { dueUrgency } from "@/lib/civilization";
import { getCurrentProfile, loadCohortData } from "@/lib/data";
import type { Profile, Task, TaskStatus } from "@/lib/types";
import {
  Field,
  Panel,
  buttonClass,
  inputClass,
  secondaryButtonClass,
} from "@/components/ui";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "To Do" },
  { status: "in_progress", label: "In Progress" },
  { status: "blocked", label: "Blocked" },
  { status: "done", label: "Done" },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function dueClass(due: string | null) {
  const urgency = dueUrgency(due);
  if (urgency === "overdue") return "text-[var(--danger)]";
  if (urgency === "soon") return "text-[var(--accent)]";
  return "text-[var(--muted)]";
}

function TaskCard({
  task,
  profiles,
  meId,
  filter,
}: {
  task: Task;
  profiles: Profile[];
  meId: string;
  filter: string;
}) {
  const assignee = profiles.find((p) => p.id === task.assignee_id);
  const canUpdate = task.created_by === meId || task.assignee_id === meId;

  return (
    <article className="rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3 space-y-2">
      <h3 className="font-medium leading-snug">{task.title}</h3>
      {task.description ? (
        <p className="text-xs text-[var(--muted)] line-clamp-2">{task.description}</p>
      ) : null}
      <div className="flex items-center gap-2 text-xs">
        {assignee ? (
          <>
            <span
              className="flex size-6 items-center justify-center rounded-full bg-[var(--bg-soft)] text-[10px] font-semibold text-[var(--accent)]"
              aria-hidden
            >
              {initials(assignee.display_name)}
            </span>
            <span className="text-[var(--muted)]">{assignee.display_name}</span>
          </>
        ) : (
          <span className="text-[var(--muted)]">Unassigned</span>
        )}
      </div>
      {task.due_date ? (
        <p className={`text-xs font-medium ${dueClass(task.due_date)}`}>
          Due {task.due_date}
          {dueUrgency(task.due_date) === "overdue"
            ? " · overdue"
            : dueUrgency(task.due_date) === "soon"
              ? " · due soon"
              : ""}
        </p>
      ) : (
        <p className="text-xs text-[var(--muted)]">No due date</p>
      )}
      {canUpdate ? (
        <form action={updateTaskStatus} className="flex gap-2">
          <input type="hidden" name="task_id" value={task.id} />
          <input type="hidden" name="filter" value={filter} />
          <select
            name="status"
            defaultValue={task.status}
            className={`${inputClass} text-xs py-1.5`}
          >
            {COLUMNS.map((col) => (
              <option key={col.status} value={col.status}>
                {col.label}
              </option>
            ))}
          </select>
          <button type="submit" className={`${secondaryButtonClass} px-2 py-1.5 text-xs`}>
            Set
          </button>
        </form>
      ) : (
        <p className="text-xs text-[var(--muted)]">View only</p>
      )}
    </article>
  );
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; error?: string; ok?: string }>;
}) {
  const { filter: filterRaw, error, ok } = await searchParams;
  const filter = filterRaw === "mine" ? "mine" : "all";
  const me = await getCurrentProfile();
  const data = await loadCohortData();

  if (!me) return null;

  const visible =
    filter === "mine"
      ? data.tasks.filter((t) => t.assignee_id === me.id)
      : data.tasks;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Tasks
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Lightweight board for deadlines — does not affect civilization gates.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/tasks?filter=all"
            className={filter === "all" ? buttonClass : secondaryButtonClass}
          >
            All tasks
          </Link>
          <Link
            href="/tasks?filter=mine"
            className={filter === "mine" ? buttonClass : secondaryButtonClass}
          >
            Assigned to me
          </Link>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="rounded-lg border border-[var(--success)]/40 bg-[var(--success)]/10 px-3 py-2 text-sm text-[var(--success)]">
          {ok === "created" ? "Task created." : "Status updated."}
        </p>
      ) : null}

      <Panel>
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold">
          Create task
        </h2>
        <form action={createTask} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Title">
              <input className={inputClass} name="title" required />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description (optional)">
              <textarea className={inputClass} name="description" rows={2} />
            </Field>
          </div>
          <Field label="Assignee">
            <select className={inputClass} name="assignee_id" defaultValue="">
              <option value="">Unassigned</option>
              {data.profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                  {p.id === me.id ? " (me)" : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Due date">
            <input className={inputClass} name="due_date" type="date" />
          </Field>
          <div className="sm:col-span-2">
            <button className={buttonClass} type="submit">
              Create task
            </button>
          </div>
        </form>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const columnTasks = visible.filter((t) => t.status === col.status);
          return (
            <section key={col.status} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                  {col.label}
                </h2>
                <span className="text-xs text-[var(--muted)]">{columnTasks.length}</span>
              </div>
              <div className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-3 min-h-40">
                {columnTasks.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] px-1 py-2">No tasks</p>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      profiles={data.profiles}
                      meId={me.id}
                      filter={filter}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
