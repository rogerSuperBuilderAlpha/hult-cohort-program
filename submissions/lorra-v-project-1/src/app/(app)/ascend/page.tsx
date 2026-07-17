import Link from "next/link";
import {
  LEVEL_LABELS,
  computeCohortMetrics,
  evaluateCohortLevel,
} from "@/lib/civilization";
import { loadCohortData } from "@/lib/data";
import { GateList, Panel } from "@/components/ui";

export default async function AscendPage() {
  const data = await loadCohortData();
  const metrics = computeCohortMetrics(data);
  const { level, gates, nextLevelGates } = evaluateCohortLevel(metrics);

  const showGates = level === "pre_level_1" ? nextLevelGates : nextLevelGates.length ? nextLevelGates : gates;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
          ← Dashboard
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
          What we need to ascend
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Current level: <span className="text-[var(--accent)]">{LEVEL_LABELS[level]}</span>
        </p>
      </div>

      <Panel>
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold">
          {level === "galactic"
            ? "All gates cleared"
            : level === "pre_level_1"
              ? "Builder Civilization gates"
              : `Next: ${LEVEL_LABELS[level === "builder" ? "stellar" : "galactic"]}`}
        </h2>
        {showGates.length ? <GateList gates={showGates} /> : <p>No open gates.</p>}
      </Panel>

      {level !== "pre_level_1" && gates.length ? (
        <Panel>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold">
            Current level gates (already met)
          </h2>
          <GateList gates={gates} />
        </Panel>
      ) : null}

      <Panel>
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold">
          Raw cohort metrics
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-[var(--muted)]">Merged PRs</dt>
            <dd className="text-lg font-semibold">{metrics.totalMergedPrs}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Unique contributors</dt>
            <dd className="text-lg font-semibold">{metrics.uniqueContributors}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">MVP feature %</dt>
            <dd className="text-lg font-semibold">{metrics.mvpFeaturePct}%</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Critical bugs</dt>
            <dd className="text-lg font-semibold">{metrics.criticalBugsOpen}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Weekly active</dt>
            <dd className="text-lg font-semibold">{metrics.weeklyActivePct.toFixed(1)}%</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Daily active (stand-in)</dt>
            <dd className="text-lg font-semibold">{metrics.dailyActivePct.toFixed(1)}%</dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}
