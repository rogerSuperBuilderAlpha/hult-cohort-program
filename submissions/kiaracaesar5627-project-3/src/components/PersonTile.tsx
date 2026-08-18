"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import type { Participant } from "@/lib/types";

export function PersonTile({
  person,
  index = 0,
}: {
  person: Participant;
  index?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  function onMove(e: PointerEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--rx", `${(py - 0.5) * -8}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 10}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  if (!person.publicProfile) {
    return (
      <div
        className="person-tile person-tile-private"
        style={{ animationDelay: `${index * 40}ms` }}
      >
        <p className="font-display text-lg">Private profile</p>
        <p className="mt-2 text-sm text-[var(--fog)]">
          This participant opted out of the public roster.
        </p>
        <p className="mt-4 font-mono text-xs text-[var(--fog)]/70">
          @{person.handle}
        </p>
      </div>
    );
  }

  return (
    <Link
      ref={ref}
      href={`/people/${person.handle}`}
      className="person-tile group"
      style={{ animationDelay: `${index * 40}ms` }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className="person-tile-shine" aria-hidden />
      <div className="flex items-start gap-4">
        {person.avatarUrl ? (
          <Image
            src={person.avatarUrl}
            alt=""
            width={56}
            height={56}
            className="person-avatar rounded-full bg-[var(--ink-3)]"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ink-3)] font-display text-lg text-[var(--signal)]">
            {person.name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-display text-lg leading-tight transition-colors group-hover:text-[var(--signal)]">
            {person.name}
          </p>
          <p className="mt-1 font-mono text-xs text-[var(--fog)]">
            @{person.handle} · {person.campus}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--fog)]">
            {person.highlight || person.bio}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {person.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="skill-chip">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      <span className="person-tile-cta">Open trail →</span>
    </Link>
  );
}
