"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import {
  subscribeTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  subscribeAllUsers,
  subscribeProjects,
} from "@/lib/data";
import { Task, TaskStatus, TaskPriority, STATUS_ORDER, STATUS_LABELS, UserProfile, Project } from "@/lib/types";
import TaskCard from "@/components/TaskCard";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [assigneeUid, setAssigneeUid] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    const unsub = subscribeTasks(id, setTasks);
    return () => unsub();
  }, [id]);

  useEffect(() => {
    const unsub = subscribeAllUsers(setUsers);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeProjects((projects) => {
      setProject(projects.find((p) => p.id === id) || null);
    });
    return () => unsub();
  }, [id]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !taskName.trim()) return;
    setBusy(true);
    const assignee = users.find((u) => u.uid === assigneeUid);
    try {
      await createTask(id, {
        name: taskName.trim(),
        description: taskDesc.trim(),
        priority,
        dueDate: dueDate || null,
        assigneeUid: assignee ? assignee.uid : null,
        assigneeName: assignee ? assignee.displayName : null,
        createdBy: user.uid,
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

  if (loading || !user) return null;

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project?.name || "Project"}</h1>
          {project?.description && (
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {project.description}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-4 py-2 rounded-lg font-semibold text-sm shrink-0"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {showForm ? "Cancel" : "+ New task"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 p-5 rounded-xl border flex flex-col gap-3"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <select value={assigneeUid} onChange={(e) => setAssigneeUid(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.displayName}
                </option>
              ))}
            </select>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {STATUS_ORDER.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
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
                      onStatusChange={(newStatus: TaskStatus) =>
                        updateTaskStatus(id, task.id, newStatus, user.uid)
                      }
                      onDelete={() => deleteTask(id, task.id)}
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
