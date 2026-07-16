"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { subscribeLeaderboard } from "@/lib/data";
import { UserProfile } from "@/lib/types";

const medal = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    const unsub = subscribeLeaderboard(setUsers);
    return () => unsub();
  }, []);

  if (loading || !user) return null;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-bold mb-1">Leaderboard</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Ranked by tasks completed across every project. Streaks track
        consecutive days with at least one completion.
      </p>

      {users.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No activity yet — complete a task to appear here.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((u, i) => (
            <div
              key={u.id}
              className="flex items-center gap-4 p-4 rounded-xl border"
              style={{
                background: u.id === user.id ? "var(--surface-hover)" : "var(--surface)",
                borderColor: u.id === user.id ? "var(--accent)" : "var(--border)",
              }}
            >
              <span className="text-lg w-7 text-center shrink-0">
                {medal[i] || `#${i + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{u.display_name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {u.total_completed} task{u.total_completed === 1 ? "" : "s"} completed
                </p>
              </div>
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
                style={{ background: "var(--success-muted)", color: "var(--success)" }}
              >
                🔥 {u.streak}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
