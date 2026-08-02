"use client";

import { useState } from "react";
import Image from "next/image";
import type { Builder } from "@/lib/types";
import { githubAvatar } from "@/lib/config";
import { BuilderQuickPeek } from "./BuilderQuickPeek";

export function BuilderCard({ builder }: { builder: Builder }) {
  const [peekOpen, setPeekOpen] = useState(false);

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => setPeekOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setPeekOpen(true);
          }
        }}
        className="glass-card builder-card group cursor-pointer"
      >
        <div className="builder-card-glow" />
        <div className="relative flex items-start gap-4">
          <Image
            src={githubAvatar(builder.handle)}
            alt=""
            width={56}
            height={56}
            className="rounded-xl border border-white/10 transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-lg font-semibold">
              {builder.displayName}
            </h3>
            <p className="font-mono text-xs text-[var(--accent)]">@{builder.handle}</p>
          </div>
        </div>
        <p className="relative mt-3 line-clamp-2 text-sm text-[var(--ink-muted)]">
          {builder.tagline}
        </p>
        <p className="relative mt-2 text-xs font-medium text-[var(--accent-2)]">
          {builder.signatureProject}
        </p>
        <div className="relative mt-3 flex flex-wrap gap-1.5">
          {builder.skills.slice(0, 3).map((s) => (
            <span key={s} className="skill-chip">
              {s}
            </span>
          ))}
        </div>
        <p className="relative mt-4 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] opacity-0 transition-opacity group-hover:opacity-100">
          Click for quick peek →
        </p>
      </article>

      <BuilderQuickPeek
        builder={builder}
        open={peekOpen}
        onClose={() => setPeekOpen(false)}
      />
    </>
  );
}
