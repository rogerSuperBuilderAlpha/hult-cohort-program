"use client";

import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";

export default function NavBar() {
  const { user, profile, logOut, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (loading) return null;

  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <Link href={user ? "/dashboard" : "/"} className="font-bold text-lg tracking-tight">
          Cohort PM Tool
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/dashboard" className="hover:opacity-80" style={{ color: "var(--text-muted)" }}>
                Projects
              </Link>
              <Link href="/leaderboard" className="hover:opacity-80" style={{ color: "var(--text-muted)" }}>
                Leaderboard
              </Link>

              {profile && (
                <span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "var(--success-muted)", color: "var(--success)" }}
                  title="Current completion streak"
                >
                  🔥 {profile.streak} day{profile.streak === 1 ? "" : "s"}
                </span>
              )}

              <span style={{ color: "var(--text-muted)" }} className="hidden sm:inline">
                {profile?.display_name || user.email}
              </span>
            </nav>
          )}

          <button
            onClick={toggleTheme}
            aria-label="Toggle light/dark mode"
            className="p-2 rounded-lg border flex items-center justify-center"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user && (
            <button
              onClick={() => logOut()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "var(--danger-muted)", color: "var(--danger)" }}
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
