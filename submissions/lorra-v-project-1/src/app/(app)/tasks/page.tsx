import Link from "next/link";
import { createTask, updateTaskStatus } from "@/app/actions/tasks";
import { dueUrgency } from "@/lib/civilization";
import { getCurrentProfile, loadCohortData } from "@/lib/data";
import type { Profile, Project, Task, TaskStatus } from "@/lib/types";
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

const STATUS_VALUES: TaskStatus[] = ["todo", "in_progress", "blocked", "done"];

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
  projects,
  meId,
  filterQuery,
}: {
  task: Task;
  profiles: Profile[];
  projects: Project[];
  meId: string;
  filterQuery: { project: string; assignee: string; status: string };
}) {
  const assignee = profiles.find((p) => p.id === task.assignee_id);
  const project = projects.find((p) => p.id === task.project_id);
  const canUpdate = task.created_by === meId || task.assignee_id === meId;

  return (
    <article className="rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3 space-y-2">
      <h3 className="font-medium leading-snug">{task.title}</h3>
      {task.description ? (
        <p className="text-xs text-[var(--muted)] line-clamp-2">{task.description}</p>
      ) : null}
      {project ? (
        <p className="text-xs text-[var(--accent)]">{project.name}</p>
      ) : (
        <p className="text-xs text-[var(--muted)]">No project</p>
      )}
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
          <input type="hidden" name="project" value={filterQuery.project} />
          <input type="hidden" name="assignee" value={filterQuery.assignee} />
          <input type="hidden" name="status_filter" value={filterQuery.status} />
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

function parseFilters(
  params: {
    project?: string;
    assignee?: string;
    status?: string;
    filter?: string;
  },
  meId: string,
) {
  const project = params.project?.trim() || "all";
  let assignee = params.assignee?.trim() || "all";
  // Legacy dashboard link: /tasks?filter=mine
  if (params.filter === "mine" && !params.assignee) {
    assignee = meId;
  }
  const statusRaw = params.status?.trim() || "all";
  const status =
    statusRaw === "all" || STATUS_VALUES.includes(statusRaw as TaskStatus)
      ? statusRaw
      : "all";
  return { project, assignee, status };
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{
    project?: string;
    assignee?: string;
    status?: string;
    filter?: string;
    error?: string;
    ok?: string;
  }>;
}) {
  const params = await searchParams;
  const { error, ok } = params;
  const me = await getCurrentProfile();
  const data = await loadCohortData();

  if (!me) return null;

  const filters = parseFilters(params, me.id);
  const activeProjects = data.projects.filter((p) => p.status === "active");

  const visible = data.tasks.filter((t) => {
    if (filters.project === "none") {
      if (t.project_id) return false;
    } else if (filters.project !== "all") {
      if (t.project_id !== filters.project) return false;
    }

    if (filters.assignee === "unassigned") {
      if (t.assignee_id) return false;
    } else if (filters.assignee !== "all") {
      if (t.assignee_id !== filters.assignee) return false;
    }

    if (filters.status !== "all" && t.status !== filters.status) return false;

    return true;
  });

  const filterQs = new URLSearchParams({
    project: filters.project,
    assignee: filters.assignee,
    status: filters.status,
  }).toString();

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
        <Link href="/projects" className={secondaryButtonClass}>
          Manage projects
        </Link>
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
          Filters
        </h2>
        <form method="get" className="grid gap-4 sm:grid-cols-3">
          <Field label="Project">
            <select className={inputClass} name="project" defaultValue={filters.project}>
              <option value="all">All projects</option>
              <option value="none">No project</option>
              {data.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.status === "archived" ? " (archived)" : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Assignee">
            <select className={inputClass} name="assignee" defaultValue={filters.assignee}>
              <option value="all">All</option>
              <option value="unassigned">Unassigned</option>
              {data.profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                  {p.id === me.id ? " (me)" : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className={inputClass} name="status" defaultValue={filters.status}>
              <option value="all">All statuses</option>
              {COLUMNS.map((col) => (
                <option key={col.status} value={col.status}>
                  {col.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-3 flex flex-wrap gap-2">
            <button className={buttonClass} type="submit">
              Apply filters
            </button>
            <Link href="/tasks?project=all&assignee=all&status=all" className={secondaryButtonClass}>
              Clear
            </Link>
          </div>
        </form>
      </Panel>

      <Panel>
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold">
          Create task
        </h2>
        <form action={createTask} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="project" value={filters.project} />
          <input type="hidden" name="assignee" value={filters.assignee} />
          <input type="hidden" name="status_filter" value={filters.status} />
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
          <Field label="Project (optional)">
            <select className={inputClass} name="project_id" defaultValue="">
              <option value="">No project</option>
              {activeProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
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

      <p className="text-sm text-[var(--muted)]">
        Showing {visible.length} task{visible.length === 1 ? "" : "s"}
        {filters.project !== "all" || filters.assignee !== "all" || filters.status !== "all"
          ? " (filtered)"
          : ""}
        .{" "}
        <Link href={`/tasks?${filterQs}`} className="text-[var(--accent)] hover:underline">
          Permalink
        </Link>
      </p>

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
                      projects={data.projects}
                      meId={me.id}
                      filterQuery={filters}
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
