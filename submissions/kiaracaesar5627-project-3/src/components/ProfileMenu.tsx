"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ThemeSettings } from "@/components/ThemeSettings";
import { useTheme } from "@/components/ThemeProvider";

const PROFILE_KEY = "signal-profile-v1";

export type LocalProfile = {
  displayName: string;
  role: "partner" | "participant" | "visitor";
};

const DEFAULT_PROFILE: LocalProfile = {
  displayName: "Guest",
  role: "visitor",
};

function loadProfile(): LocalProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<LocalProfile>;
    const role =
      parsed.role === "partner" ||
      parsed.role === "participant" ||
      parsed.role === "visitor"
        ? parsed.role
        : "visitor";
    return {
      displayName: (parsed.displayName || "Guest").slice(0, 40),
      role,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function saveProfile(profile: LocalProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "G";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function ProfileMenu() {
  const { themeId } = useTheme();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"account" | "themes">("account");
  const [profile, setProfile] = useState<LocalProfile>(DEFAULT_PROFILE);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function update(partial: Partial<LocalProfile>) {
    setProfile((prev) => {
      const next = { ...prev, ...partial };
      saveProfile(next);
      return next;
    });
  }

  return (
    <div className="profile-menu" ref={rootRef}>
      <button
        type="button"
        className="profile-trigger"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="profile-avatar" aria-hidden>
          {initials(profile.displayName)}
        </span>
        <span className="profile-trigger-label">Profile</span>
      </button>

      {open ? (
        <div
          id={menuId}
          className="profile-panel"
          role="dialog"
          aria-label="Profile and themes"
        >
          <div className="profile-panel-head">
            <div>
              <p className="font-display text-lg leading-tight">{profile.displayName}</p>
              <p className="font-mono text-[0.7rem] text-[var(--fog)]">
                {profile.role} · theme {themeId}
              </p>
            </div>
            <Link
              href="/profile"
              className="nav-link text-sm"
              onClick={() => setOpen(false)}
            >
              Open full
            </Link>
          </div>

          <div className="profile-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "account"}
              className={`filter-chip ${tab === "account" ? "is-active" : ""}`}
              onClick={() => setTab("account")}
            >
              Account
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "themes"}
              className={`filter-chip ${tab === "themes" ? "is-active" : ""}`}
              onClick={() => setTab("themes")}
            >
              Themes
            </button>
          </div>

          {tab === "account" ? (
            <div className="profile-account grid gap-3">
              <div className="field">
                <label htmlFor="profile-name-nav">Display name</label>
                <input
                  id="profile-name-nav"
                  value={profile.displayName}
                  onChange={(e) => update({ displayName: e.target.value.slice(0, 40) })}
                  maxLength={40}
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-[var(--fog)]">I am a…</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["visitor", "Visitor"],
                      ["partner", "Partner"],
                      ["participant", "Participant"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={`filter-chip ${profile.role === id ? "is-active" : ""}`}
                      onClick={() => update({ role: id })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <Link
                href="/people/kiaracaesar5627"
                className="btn btn-ghost text-sm w-fit"
                onClick={() => setOpen(false)}
              >
                Author profile
              </Link>
            </div>
          ) : (
            <div className="profile-themes">
              <ThemeSettings compact />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function ProfilePageClient() {
  const { themeId } = useTheme();
  const [profile, setProfile] = useState<LocalProfile>(DEFAULT_PROFILE);
  const [tab, setTab] = useState<"account" | "themes">("themes");

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  function update(partial: Partial<LocalProfile>) {
    setProfile((prev) => {
      const next = { ...prev, ...partial };
      saveProfile(next);
      return next;
    });
  }

  return (
    <div className="profile-page-shell">
      <div className="profile-page-card">
        <div className="flex flex-wrap items-center gap-4">
          <span className="profile-avatar profile-avatar-lg" aria-hidden>
            {initials(profile.displayName)}
          </span>
          <div>
            <p className="font-display text-2xl tracking-tight">{profile.displayName}</p>
            <p className="font-mono text-xs text-[var(--fog)]">
              {profile.role} · active theme {themeId}
            </p>
          </div>
        </div>

        <div className="profile-tabs mt-6" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "account"}
            className={`filter-chip ${tab === "account" ? "is-active" : ""}`}
            onClick={() => setTab("account")}
          >
            Account
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "themes"}
            className={`filter-chip ${tab === "themes" ? "is-active" : ""}`}
            onClick={() => setTab("themes")}
          >
            Themes
          </button>
        </div>
      </div>

      {tab === "account" ? (
        <div className="profile-page-card mt-4 grid max-w-xl gap-4">
          <div className="field">
            <label htmlFor="profile-name-page">Display name</label>
            <input
              id="profile-name-page"
              value={profile.displayName}
              onChange={(e) => update({ displayName: e.target.value.slice(0, 40) })}
              maxLength={40}
            />
          </div>
          <div>
            <p className="mb-2 text-sm text-[var(--fog)]">I am a…</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["visitor", "Visitor"],
                  ["partner", "Partner"],
                  ["participant", "Participant"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`filter-chip ${profile.role === id ? "is-active" : ""}`}
                  onClick={() => update({ role: id })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-[var(--fog)]">
            Saved in this browser only — used for personalizing the Trailmark surface
            while you browse. Theme settings live in the Themes tab.
          </p>
          <Link href="/people/kiaracaesar5627" className="btn btn-ghost w-fit text-sm">
            View author cohort profile
          </Link>
        </div>
      ) : (
        <div id="theme-studio" className="mt-6">
          <ThemeSettings />
        </div>
      )}
    </div>
  );
}
