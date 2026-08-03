import Link from "next/link";
import type { PmSnapshot } from "@/lib/types";
import { pmUrl } from "@/lib/site";

const STATUS_CLASS: Record<string, string> = {
  shipped: "status-pill status-shipped",
  "on-track": "status-pill status-on-track",
  "at-risk": "status-pill status-at-risk",
  blocked: "status-pill status-blocked",
};

/** Compact PM proof strip for the marketing homepage. */
export function WorkPulse({ snapshot }: { snapshot: PmSnapshot }) {
  const top = snapshot.projects.slice(0, 4);

  return (
    <section className="work-pulse section">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Live evidence</p>
          <h2>Not lorem. FlexiFlow.</h2>
          <p className="section-lead">
            Read-only cohort status mirrored from the PM platform — the same
            board partners can open when they want receipts.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={pmUrl()} className="btn btn-ghost text-sm" target="_blank" rel="noreferrer">
            Open FlexiFlow
          </a>
          <Link href="/work" className="btn btn-primary text-sm">
            Full board
          </Link>
        </div>
      </div>
      <div className="work-pulse-list">
        {top.map((project) => (
          <article key={project.id} className="work-pulse-row">
            <div>
              <p className="font-display text-lg leading-tight">{project.name}</p>
              <p className="mt-1 font-mono text-[0.7rem] text-[var(--fog)]/70">
                @{project.ownerHandle} · {project.progress}%
              </p>
            </div>
            <span className={STATUS_CLASS[project.status]}>{project.status}</span>
          </article>
        ))}
      </div>
      <p className="mt-4 font-mono text-[0.7rem] text-[var(--fog)]/70">
        Synced {new Date(snapshot.syncedAt).toUTCString()} · {snapshot.source}
      </p>
    </section>
  );
}
