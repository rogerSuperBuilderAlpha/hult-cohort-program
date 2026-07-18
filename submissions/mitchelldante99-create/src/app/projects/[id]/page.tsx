"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import {
  subscribeTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  subscribeAllUsers,
  subscribeProjects,
  updateProject,
  setProjectArchived,
  deleteProject,
  subscribeProjectMembers,
  setProjectMembers,
} from "@/lib/data";
import { Task, TaskStatus, TaskPriority, STATUS_ORDER, STATUS_LABELS, UserProfile, Project } from "@/lib/types";
import { Calendar, UserRound, Flag, Users } from "lucide-react";
import TaskCard from "@/components/TaskCard";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [assigneeUid, setAssigneeUid] = useState("");

  const [assigneeFilter, setAssigneeFilter] = useState("");

  const [editingProject, setEditingProject] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editMembers, setEditMembers] = useState<string[]>([]);

  const [managingMembers, setManagingMembers] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || !user) return;
    const unsub = subscribeTasks(id, setTasks);
    return () => unsub();
  }, [id, loading, user]);

  useEffect(() => {
    if (loading || !user) return;
    const unsub = subscribeAllUsers(setUsers);
    return () => unsub();
  }, [loading, user]);

  useEffect(() => {
    if (loading || !user) return;
    const unsub = subscribeProjectMembers(id, (ids) => {
      setMemberIds(ids);
      setEditMembers(ids);
    });
    return () => unsub();
  }, [id, loading, user]);

  useEffect(() => {
    if (loading || !user) return;
    const unsub = subscribeProjects((projects) => {
      const p = projects.find((p) => p.id === id) || null;
      setProject(p);
      if (p) {
        setEditName(p.name);
        setEditDesc(p.description);
      }
    });
    return () => unsub();
  }, [id, loading, user]);

  const visibleTasks = useMemo(
    () => (assigneeFilter ? tasks.filter((t) => t.assignee_id === assigneeFilter) : tasks),
    [tasks, assigneeFilter]
  );

  // Assignable people: project members if any have been picked, otherwise
  // fall back to the whole cohort (keeps older projects with no explicit
  // membership working exactly as before).
  const assignableUsers = memberIds.length > 0 ? users.filter((u) => memberIds.includes(u.id)) : users;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !taskName.trim()) return;
    setBusy(true);
    const assignee = users.find((u) => u.id === assigneeUid);
    try {
      await createTask(id, {
        name: taskName.trim(),
        description: taskDesc.trim(),
        priority,
        dueDate: dueDate || null,
        assigneeUid: assignee ? assignee.id : null,
        assigneeName: assignee ? assignee.display_name : null,
        createdBy: user.id,
      });
      setTaskName("");
      setTaskDesc("");
      setDueDate("");
      setAssigneeUid("");
      setPriority("Medium");
      setShowForm(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveProject(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim()) return;
    await updateProject(id, { name: editName.trim(), description: editDesc.trim() });
    setEditingProject(false);
  }

  async function handleSaveMembers() {
    await setProjectMembers(id, editMembers);
    setManagingMembers(false);
  }

  function toggleEditMember(uid: string) {
    setEditMembers((prev) => (prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]));
  }

  async function handleDeleteProject() {
    if (!window.confirm(`Delete "${project?.name}" and all of its tasks? This can't be undone.`)) return;
    await deleteProject(id);
    router.replace("/dashboard");
  }

  if (loading || !user) return null;

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex-1 min-w-0">
          {editingProject ? (
            <form onSubmit={handleSaveProject} className="flex flex-col gap-2 max-w-md">
              <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={2}
                placeholder="Description"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProject(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                  style={{ borderColor: "var(--border)" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{project?.name || "Project"}</h1>
                {project?.archived && (
                  <span
                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                    style={{ background: "var(--surface)", color: "var(--text-muted)" }}
                  >
                    Archived
                  </span>
                )}
              </div>
              {project?.description && (
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {memberIds.length === 0 ? (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Open to the whole cohort
                  </span>
                ) : (
                  <div className="flex items-center">
                    {users
                      .filter((u) => memberIds.includes(u.id))
                      .slice(0, 6)
                      .map((u, i) => (
                        <div
                          key={u.id}
                          title={u.display_name}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2"
                          style={{
                            background: "var(--accent)",
                            color: "#fff",
                            borderColor: "var(--bg)",
                            marginLeft: i === 0 ? 0 : -8,
                            zIndex: 10 - i,
                          }}
                        >
                          {initials(u.display_name)}
                        </div>
                      ))}
                    {memberIds.length > 6 && (
                      <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
                        +{memberIds.length - 6} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {!editingProject && (
            <>
              <button
                onClick={() => setEditingProject(true)}
                className="px-3 py-2 rounded-lg font-semibold text-xs border"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                Edit
              </button>
              <button
                onClick={() => setManagingMembers((m) => !m)}
                className="px-3 py-2 rounded-lg font-semibold text-xs border flex items-center gap-1.5"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                <Users size={13} /> Members
              </button>
              <button
                onClick={() => setProjectArchived(id, !project?.archived)}
                className="px-3 py-2 rounded-lg font-semibold text-xs border"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                {project?.archived ? "Unarchive" : "Archive"}
              </button>
              <button
                onClick={handleDeleteProject}
                className="px-3 py-2 rounded-lg font-semibold text-xs border"
                style={{ borderColor: "var(--border)", color: "var(--danger)" }}
              >
                Delete
              </button>
            </>
          )}
          <button
            onClick={() => setShowForm((s) => !s)}
            className="px-4 py-2 rounded-lg font-semibold text-sm"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {showForm ? "Cancel" : "+ New task"}
          </button>
        </div>
      </div>

      {managingMembers && (
        <div
          className="mb-6 p-5 rounded-xl border flex flex-col gap-3 max-w-md"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Users size={13} /> Who&apos;s on this project?
          </p>
          {users.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No cohort members yet.
            </p>
          ) : (
            <div
              className="flex flex-col gap-1 max-h-56 overflow-y-auto p-1.5 rounded-lg border"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}
            >
              {users.map((u) => {
                const active = editMembers.includes(u.id);
                return (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => toggleEditMember(u.id)}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors"
                    style={{ background: active ? "var(--surface-hover)" : "transparent" }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: active ? "var(--accent)" : "var(--surface)",
                        color: active ? "#fff" : "var(--text-muted)",
                      }}
                    >
                      {initials(u.display_name)}
                    </div>
                    <span className="flex-1 text-sm">{u.display_name}</span>
                    <span
                      className="text-[11px] font-semibold px-2 py-1 rounded-full shrink-0"
                      style={{
                        background: active ? "var(--success-muted)" : "var(--surface)",
                        color: active ? "var(--success)" : "var(--text-muted)",
                      }}
                    >
                      {active ? "Added" : "Add"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Leave everyone unchecked to keep this project open to the whole cohort for assignment.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSaveMembers}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditMembers(memberIds);
                setManagingMembers(false);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
              style={{ borderColor: "var(--border)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-5 rounded-xl border flex flex-col gap-3"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <input
            placeholder="Task name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
            rows={2}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                <Flag size={13} /> Priority
              </label>
              <div className="flex gap-1.5">
                {(["High", "Medium", "Low"] as TaskPriority[]).map((p) => {
                  const active = priority === p;
                  const color =
                    p === "High" ? "var(--priority-high)" : p === "Medium" ? "var(--priority-medium)" : "var(--priority-low)";
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors"
                      style={{
                        borderColor: active ? color : "var(--border)",
                        background: active ? `${color}22` : "transparent",
                        color: active ? color : "var(--text-muted)",
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                <Calendar size={13} /> Due date
              </label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                <UserRound size={13} /> Assign to
              </label>
              <select value={assigneeUid} onChange={(e) => setAssigneeUid(e.target.value)}>
                <option value="">Unassigned</option>
                {assignableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.display_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="self-start px-4 py-2 rounded-lg font-semibold text-sm"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {busy ? "Adding..." : "Add task"}
          </button>
        </form>
      )}

      <div className="flex items-center gap-2 mb-5">
        <label className="text-xs" style={{ color: "var(--text-muted)" }}>
          Filter by assignee:
        </label>
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="max-w-[200px]"
        >
          <option value="">Everyone</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.display_name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {STATUS_ORDER.map((status) => {
          const columnTasks = visibleTasks.filter((t) => t.status === status);
          return (
            <div key={status}>
              <h2
                className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2"
                style={{ color: "var(--text-muted)" }}
              >
                {STATUS_LABELS[status]}
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px]"
                  style={{ background: "var(--surface)" }}
                >
                  {columnTasks.length}
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {columnTasks.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Nothing here.
                  </p>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={(newStatus: TaskStatus) => updateTaskStatus(task.id, newStatus)}
                      onDelete={() => deleteTask(task.id)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
