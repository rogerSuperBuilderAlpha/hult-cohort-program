"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Person } from "@/lib/types";

type Props = {
  people: Person[];
  campuses: string[];
  skills: string[];
};

export function PeopleDirectory({ people, campuses, skills }: Props) {
  const [query, setQuery] = useState("");
  const [campus, setCampus] = useState("all");
  const [skill, setSkill] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people.filter((person) => {
      if (campus !== "all" && person.campus !== campus) return false;
      if (skill !== "all" && !person.skills.includes(skill)) return false;
      if (!q) return true;
      const hay = [
        person.name,
        person.handle,
        person.role,
        person.headline,
        person.whyImHere,
        person.featuredProject.title,
        ...person.skills,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [people, query, campus, skill]);

  return (
    <div>
      <div className="flex flex-col gap-3 border border-[var(--line)] bg-[var(--bg-elevated)] p-4 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs text-[var(--ink-muted)]">
          Search
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, skill, handle…"
            className="border border-[var(--line-strong)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--signal)]"
          />
        </label>
        <label className="flex w-full flex-col gap-1.5 text-xs text-[var(--ink-muted)] sm:w-40">
          Campus
          <select
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            className="border border-[var(--line-strong)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--signal)]"
          >
            <option value="all">All</option>
            {campuses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex w-full flex-col gap-1.5 text-xs text-[var(--ink-muted)] sm:w-44">
          Skill
          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="border border-[var(--line-strong)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--signal)]"
          >
            <option value="all">All</option>
            {skills.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
        {filtered.length} profile{filtered.length === 1 ? "" : "s"}
      </p>

      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {filtered.map((person) => (
          <li key={person.handle}>
            {person.privacy === "private" ? (
              <div className="border border-[var(--line)] bg-[var(--bg-elevated)] p-5 opacity-70">
                <p className="font-[family-name:var(--font-syne)] text-lg font-semibold">
                  Private profile
                </p>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  @{person.handle} · {person.campus} — opted out of public
                  showcase detail.
                </p>
              </div>
            ) : (
              <Link
                href={`/developers/${person.handle}`}
                className="block border border-[var(--line)] bg-[var(--bg-elevated)] p-5 transition hover:border-[var(--signal)] hover:bg-[var(--surface-hover)]"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--line-strong)] bg-[var(--signal-soft)] font-[family-name:var(--font-jetbrains)] text-xs font-semibold text-[var(--signal)]">
                    {person.photoInitials}
                  </span>
                  <div className="min-w-0">
                    <p className="font-[family-name:var(--font-syne)] text-lg font-semibold leading-tight">
                      {person.name}
                    </p>
                    <p className="mt-0.5 font-[family-name:var(--font-jetbrains)] text-[11px] text-[var(--ink-faint)]">
                      @{person.handle} · {person.campus} · {person.role}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--ink-muted)]">
                      {person.headline}
                    </p>
                    <p className="mt-3 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.1em] text-[var(--signal)]">
                      {person.skills.slice(0, 3).join(" · ")}
                    </p>
                  </div>
                </div>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
