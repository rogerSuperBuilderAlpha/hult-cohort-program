"use client";

import { useState } from "react";
import type { ShowcaseProject } from "@/lib/types";
import { getProjectEdges } from "@/lib/projects";

export function ArchitectureInspector({ project }: { project: ShowcaseProject }) {
  const [mode, setMode] = useState<"preview" | "architecture">("preview");
  const edges = getProjectEdges(project.id);

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("preview")}
          className={`rounded-lg px-3 py-1 text-xs font-mono uppercase ${
            mode === "preview"
              ? "bg-[var(--accent)] text-[var(--bg)]"
              : "text-[var(--ink-muted)]"
          }`}
        >
          UI Preview
        </button>
        <button
          type="button"
          onClick={() => setMode("architecture")}
          className={`rounded-lg px-3 py-1 text-xs font-mono uppercase ${
            mode === "architecture"
              ? "bg-[var(--accent-2)] text-[var(--bg)]"
              : "text-[var(--ink-muted)]"
          }`}
        >
          Under the Hood
        </button>
      </div>

      {mode === "preview" ? (
        <div
          className={`mt-3 flex h-40 items-end rounded-xl bg-gradient-to-br p-4 ${project.previewGradient}`}
        >
          <span className="font-display text-lg font-bold text-white drop-shadow">
            {project.title}
          </span>
        </div>
      ) : (
        <div className="relative mt-3 h-48 overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--bg)]">
          <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
            {edges.map((e) => {
              const from = project.architecture.find((n) => n.id === e.from);
              const to = project.architecture.find((n) => n.id === e.to);
              if (!from || !to) return null;
              return (
                <line
                  key={`${e.from}-${e.to}`}
                  x1={from.x + 8}
                  y1={from.y + 4}
                  x2={to.x + 8}
                  y2={to.y + 4}
                  className="arch-edge"
                />
              );
            })}
          </svg>
          {project.architecture.map((node) => (
            <div
              key={node.id}
              className="arch-node absolute"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
              }}
            >
              {node.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
