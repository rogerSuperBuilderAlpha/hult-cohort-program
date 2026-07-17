"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Project, Task } from "@/lib/types";
import { subscribeTasks } from "@/lib/data";
import { useAuth } from "@/lib/AuthContext";

export default function ProjectCard({ project }: { project: Project }) {
  const { user, loading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (loading || !user) return;
    const unsub = subscribeTasks(project.id, setTasks);
    return () => unsub();
  }, [project.id, loading, user]);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block p-5 rounded-xl border transition-colors animate-slide-in"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-lg">{project.name}</h3>
        <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
          {total} task{total === 1 ? "" : "s"}
        </span>
      </div>
      {project.description && (
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          {project.description}
        </p>
      )}
      <div
        className="h-2 rounded-full overflow-hidden mb-1.5"
        style={{ background: "var(--bg)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(90deg, var(--accent), var(--success))",
          }}
        />
      </div>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {done} of {total} complete · started by {project.created_by_name}
      </p>
    </Link>
  );
}
