"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Participant } from "@/lib/types";
import { PersonTile } from "@/components/PersonTile";

export function PeopleDirectory({
  people,
  skills,
}: {
  people: Participant[];
  skills: string[];
}) {
  const search = useSearchParams();
  const skillParam = search.get("skill");
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("all");
  const [campus, setCampus] = useState("all");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (skillParam && skills.includes(skillParam)) {
      setSkill(skillParam);
    }
  }, [skillParam, skills]);

  const campuses = useMemo(
    () =>
      Array.from(new Set(people.map((p) => p.campus))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [people],
  );

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return people.filter((p) => {
      if (!p.publicProfile) {
        return !q && skill === "all" && campus === "all";
      }
      const matchesSkill = skill === "all" || p.skills.includes(skill);
      const matchesCampus = campus === "all" || p.campus === campus;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q)) ||
        p.campus.toLowerCase().includes(q);
      return matchesSkill && matchesCampus && matchesQuery;
    });
  }, [people, deferredQuery, skill, campus]);

  return (
    <div>
      <div className="mb-5 field">
        <label htmlFor="people-q">Search</label>
        <input
          id="people-q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, handle, skill, campus"
        />
      </div>

      <div className="mb-3">
        <p className="mb-2 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--fog)]">
          Skills
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`filter-chip ${skill === "all" ? "is-active" : ""}`}
            onClick={() => setSkill("all")}
          >
            All
          </button>
          {skills.map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-chip ${skill === s ? "is-active" : ""}`}
              onClick={() => setSkill(s === skill ? "all" : s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <p className="mb-2 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--fog)]">
          Campus
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`filter-chip ${campus === "all" ? "is-active" : ""}`}
            onClick={() => setCampus("all")}
          >
            All
          </button>
          {campuses.map((c) => (
            <button
              key={c}
              type="button"
              className={`filter-chip ${campus === c ? "is-active" : ""}`}
              onClick={() => setCampus(c === campus ? "all" : c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 font-mono text-xs text-[var(--fog)]" aria-live="polite">
        Showing {filtered.length} of {people.length}
        {skill !== "all" ? ` · ${skill}` : ""}
        {campus !== "all" ? ` · ${campus}` : ""}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((person, i) => (
          <PersonTile key={person.handle} person={person} index={i} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="mt-8 text-[var(--fog)]">
          No matches — clear a filter or try another skill.
        </p>
      ) : null}
    </div>
  );
}
