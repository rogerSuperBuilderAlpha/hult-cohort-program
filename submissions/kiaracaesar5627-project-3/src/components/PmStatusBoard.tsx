"use client";

import { useEffect, useRef, useState } from "react";
import type { PmSnapshot } from "@/lib/types";
import { pmUrl } from "@/lib/site";

const STATUS_CLASS: Record<string, string> = {
  shipped: "status-pill status-shipped",
  "on-track": "status-pill status-on-track",
  "at-risk": "status-pill status-at-risk",
  blocked: "status-pill status-blocked",
};

export function PmStatusBoard({ snapshot }: { snapshot: PmSnapshot }) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-[var(--fog)]">
            Source · {snapshot.source}
          </p>
          <p className="mt-1 font-mono text-xs text-[var(--fog)]/70">
            Synced {new Date(snapshot.syncedAt).toUTCString()}
          </p>
        </div>
        <a
          href={pmUrl()}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost text-sm"
        >
          Open FlexiFlow
        </a>
      </div>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-[var(--fog)]">
        {snapshot.note}
      </p>
      <div className="grid gap-3">
        {snapshot.projects.map((project, i) => (
          <article
            key={project.id}
            className="work-card"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg leading-tight">{project.name}</p>
                <p className="mt-1 font-mono text-[0.7rem] text-[var(--fog)]/70">
                  Updated {new Date(project.updatedAt).toLocaleDateString()} ·{" "}
                  <a href={`/people/${project.ownerHandle}`} className="nav-link">
                    @{project.ownerHandle}
                  </a>
                </p>
              </div>
              <span className={STATUS_CLASS[project.status]}>{project.status}</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: armed ? `${project.progress}%` : "0%",
                    transitionDelay: `${120 + i * 80}ms`,
                  }}
                />
              </div>
              <span className="font-mono text-xs tabular-nums">{project.progress}%</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
