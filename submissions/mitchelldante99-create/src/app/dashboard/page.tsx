"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { subscribeProjects, createProject, subscribeAllUsers } from "@/lib/data";
import { Project, UserProfile } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";
import ToggleSwitch from "@/components/ToggleSwitch";
import { UserRound } from "lucide-react";

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || !user) return;
    const unsub = subscribeProjects(setProjects);
    return () => unsub();
  }, [loading, user]);

  useEffect(() => {
    if (loading || !user) return;
    const unsub = subscribeAllUsers(setUsers);
    return () => unsub();
  }, [loading, user]);

  function toggleMember(uid: string) {
    setSelectedMembers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setBusy(true);
    try {
      await createProject(
        name.trim(),
        description.trim(),
        user.id,
        profile?.display_name || user.email || "Someone",
        selectedMembers
      );
      setName("");
      setDescription("");
      setSelectedMembers([]);
      setShowForm(false);
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) return null;

  const otherUsers = users.filter((u) => u.id !== user.id);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Everything the cohort is tracking, in one shared view.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-4 py-2 rounded-lg font-semibold text-sm shrink-0"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {showForm ? "Cancel" : "+ New project"}
        </button>
      </div>

      <div className="flex justify-end mb-6">
        <ToggleSwitch checked={showArchived} onChange={setShowArchived} label="Show archived projects" />
      </div>

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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <UserRound size={13} /> Add people to this project
            </label>
            {otherUsers.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                No other cohort members have signed up yet.
              </p>
            ) : (
              <div
                className="flex flex-col gap-1 max-h-40 overflow-y-auto p-1.5 rounded-lg border"
                style={{ borderColor: "var(--border)", background: "var(--bg)" }}
              >
                {otherUsers.map((u) => {
                  const active = selectedMembers.includes(u.id);
                  return (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => toggleMember(u.id)}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors"
                      style={{ background: active ? "var(--surface-hover)" : "transparent" }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{
                          background: active ? "var(--accent)" : "var(--surface)",
                          color: active ? "#fff" : "var(--text-muted)",
                        }}
                      >
                        {u.display_name
                          .trim()
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase() || "")
                          .join("")}
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
          </div>

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
