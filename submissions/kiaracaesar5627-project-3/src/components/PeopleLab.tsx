"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { Participant } from "@/lib/types";
import { PeopleDirectory } from "@/components/PeopleDirectory";

type SortMode = "name" | "campus" | "skills";
type Density = "cozy" | "compact";

export function PeopleLab({
  people,
  skills,
}: {
  people: Participant[];
  skills: string[];
}) {
  const router = useRouter();
  const [sort, setSort] = useState<SortMode>("name");
  const [density, setDensity] = useState<Density>("cozy");
  const [shuffleKey, setShuffleKey] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sorted = useMemo(() => {
    const list = [...people];
    if (shuffleKey > 0) {
      for (let i = list.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      return list;
    }
    list.sort((a, b) => {
      if (sort === "campus") return a.campus.localeCompare(b.campus) || a.name.localeCompare(b.name);
      if (sort === "skills") return b.skills.length - a.skills.length || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [people, sort, shuffleKey]);

  function surprise() {
    const publicOnes = people.filter((p) => p.publicProfile);
    const pick = publicOnes[Math.floor(Math.random() * publicOnes.length)];
    if (!pick) return;
    setFlash(pick.handle);
    startTransition(() => {
      router.push(`/people/${pick.handle}`);
    });
  }

  return (
    <div id="people-lab" className="people-lab">
      <div className="people-lab-controls">
        <div>
          <p className="lab-label">Sort</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["name", "Name"],
                ["campus", "Campus"],
                ["skills", "Skill count"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`filter-chip ${sort === id && shuffleKey === 0 ? "is-active" : ""}`}
                onClick={() => {
                  setShuffleKey(0);
                  setSort(id);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="lab-label">Density</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["cozy", "Cozy"],
                ["compact", "Compact"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`filter-chip ${density === id ? "is-active" : ""}`}
                onClick={() => setDensity(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="people-lab-actions">
          <button
            type="button"
            className="btn btn-ghost text-sm"
            onClick={() => {
              setShuffleKey((k) => k + 1);
              setFlash("shuffled");
            }}
          >
            Shuffle deck
          </button>
          <button type="button" className="btn btn-primary btn-bounce text-sm" onClick={surprise}>
            Surprise me
          </button>
        </div>
      </div>
      {flash ? (
        <p className="mb-4 font-mono text-xs text-[var(--signal)]" role="status">
          {flash === "shuffled" ? "Deck reshuffled" : `Opening @${flash}…`}
        </p>
      ) : null}
      <div className={`people-lab-grid density-${density}`}>
        <PeopleDirectory people={sorted} skills={skills} />
      </div>
    </div>
  );
}
