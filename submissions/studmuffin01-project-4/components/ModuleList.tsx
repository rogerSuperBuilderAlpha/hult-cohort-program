"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { modules, type CourseModule } from "@/content/course";
import {
  MODULE_COMPLETE_EVENT,
  getCompletedModules,
} from "@/lib/module-completion";
import { PROGRESS_RESET_EVENT } from "@/lib/progress-reset";

function splitModuleTitle(title: string): {
  primary: string;
  secondary?: string;
} {
  const colon = title.indexOf(":");
  if (colon === -1) return { primary: title };
  return {
    primary: title.slice(0, colon).trim(),
    secondary: title.slice(colon + 1).trim(),
  };
}

function ModuleRow({
  mod,
  completed,
}: {
  mod: CourseModule;
  completed: boolean;
}) {
  const { primary, secondary } = splitModuleTitle(mod.title);
  const number = String(mod.order + 1).padStart(2, "0");

  return (
    <li>
      <Link
        href={`/modules/${mod.slug}`}
        className={completed ? "is-complete" : undefined}
        data-complete={completed ? "true" : "false"}
      >
        <span
          className={`module-check${completed ? " is-checked" : ""}`}
          aria-label={completed ? "Module completed" : "Module not completed"}
          title={completed ? "Completed" : "Not completed"}
        >
          {completed ? (
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path
                d="M3.2 8.2 6.4 11.4 12.8 4.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
        <span className="idx">{number}</span>
        <span>
          <strong>{primary}</strong>
          {secondary ? (
            <div style={{ marginTop: "0.15rem" }}>
              <strong>{secondary}</strong>
            </div>
          ) : null}
          <div className="meta">
            {mod.kind.charAt(0).toUpperCase() + mod.kind.slice(1)} · ~
            {mod.durationMinutes} min
          </div>
          <div
            className="muted"
            style={{ marginTop: "0.35rem", fontSize: "0.95rem" }}
          >
            {mod.summary}
          </div>
        </span>
        <span
          className={`module-cta${completed ? " is-review" : " is-start"}`}
        >
          {completed ? "Review" : "Start"}
        </span>
      </Link>
    </li>
  );
}

export function ModuleList() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    function refresh() {
      setCompleted(new Set(getCompletedModules()));
    }
    refresh();
    window.addEventListener(MODULE_COMPLETE_EVENT, refresh);
    window.addEventListener(PROGRESS_RESET_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(MODULE_COMPLETE_EVENT, refresh);
      window.removeEventListener(PROGRESS_RESET_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <ol className="module-list">
      {modules.map((mod) => (
        <ModuleRow
          key={mod.slug}
          mod={mod}
          completed={completed.has(mod.slug)}
        />
      ))}
    </ol>
  );
}
