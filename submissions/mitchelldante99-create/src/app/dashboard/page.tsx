"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { subscribeProjects, createProject } from "@/lib/data";
import { Project } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    const unsub = subscribeProjects(setProjects);
    return () => unsub();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setBusy(true);
    try {
      await createProject(name.trim(), description.trim(), user.id, profile?.display_name || user.email || "Someone");
      setName("");
      setDescription("");
      setShowForm(false);
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Everything the cohort is tracking, in one shared view.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-4 py-2 rounded-lg font-semibold text-sm"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {showForm ? "Cancel" : "+ New project"}
        </button>
      </div>

      <label className="flex items-center gap-2 text-xs mb-4" style={{ color: "var(--text-muted)" }}>
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
          className="w-auto"
        />
        Show archived projects
      </label>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 p-5 rounded-xl border flex flex-col gap-3"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <input
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            placeholder="What's this project about? (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <button
            type="submit"
            disabled={busy}
            className="self-start px-4 py-2 rounded-lg font-semibold text-sm"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {busy ? "Creating..." : "Create project"}
          </button>
        </form>
      )}

      {projects.filter((p) => showArchived || !p.archived).length === 0 ? (
        <div
          className="text-center py-16 rounded-xl border border-dashed"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          No projects yet. Create the first one to get the cohort moving.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects
            .filter((p) => showArchived || !p.archived)
            .map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
        </div>
      )}
    </div>
  );
}
