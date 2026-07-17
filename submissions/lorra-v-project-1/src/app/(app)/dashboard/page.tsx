import Link from "next/link";
import {
  LEVEL_LABELS,
  computeCivilizationEnergy,
  computeCivilizationIndex,
  computeCohortMetrics,
  evaluateCohortLevel,
  dueUrgency,
  weekDateBounds,
} from "@/lib/civilization";
import { getCurrentProfile, loadCohortData } from "@/lib/data";
import { GateList, Panel, ProgressBar } from "@/components/ui";

export default async function DashboardPage() {
  const me = await getCurrentProfile();
  const data = await loadCohortData();
  const metrics = computeCohortMetrics(data);
  const { level, nextLevelGates } = evaluateCohortLevel(metrics);
  const energy = computeCivilizationEnergy(data);
  const index = computeCivilizationIndex(metrics);

  const { start, end } = weekDateBounds();
  const myDueThisWeek = me
    ? data.tasks
        .filter(
          (t) =>
            t.assignee_id === me.id &&
            t.status !== "done" &&
            t.due_date &&
            t.due_date >= start &&
            t.due_date <= end,
        )
        .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
        .slice(0, 5)
    : [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">Cohort dashboard</p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
          Civilization status
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/ascend" className="block transition hover:brightness-110">
          <Panel className="h-full">
            <p className="text-sm text-[var(--muted)]">Cohort Level</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--accent)]">
              {LEVEL_LABELS[level]}
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Click for gate checklist — what we need to ascend →
            </p>
          </Panel>
        </Link>

        <Panel>
          <p className="text-sm text-[var(--muted)]">Civilization Energy</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
            ⚡ {energy.toLocaleString()} Civilization Energy Generated
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Running total from merged PRs, reviews, contributions, adoption, and done tasks.
          </p>
        </Panel>
      </div>

      <Panel>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--muted)]">Civilization Index</p>
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">
              {(index * 100).toFixed(0)}% toward Galactic targets
            </p>
          </div>
          <p className="text-xs text-[var(--muted)]">Cosmetic only — gates decide level</p>
        </div>
        <ProgressBar value={index} />
      </Panel>

      <Panel>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            My tasks due this week
          </h2>
          <Link href="/tasks?filter=mine" className="text-sm text-[var(--accent)] hover:underline">
            Open board →
          </Link>
        </div>
        {myDueThisWeek.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nothing due this week.</p>
        ) : (
          <ul className="space-y-2">
            {myDueThisWeek.map((task) => {
              const urgency = dueUrgency(task.due_date);
              const dueColor =
                urgency === "overdue"
                  ? "text-[var(--danger)]"
                  : urgency === "soon"
                    ? "text-[var(--accent)]"
                    : "text-[var(--muted)]";
              return (
                <li
                  key={task.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-2 last:border-0"
                >
                  <Link href="/tasks" className="font-medium hover:text-[var(--accent)]">
                    {task.title}
                  </Link>
                  <span className={`text-sm ${dueColor}`}>{task.due_date}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          {level === "pre_level_1" ? "Progress toward Builder" : "Path to the next tier"}
        </h2>
        <p className="mt-1 mb-4 text-sm text-[var(--muted)]">
          {nextLevelGates.length
            ? "Open gates below. Full checklist on the ascend page."
            : "Galactic Civilization achieved."}
        </p>
        {nextLevelGates.length ? <GateList gates={nextLevelGates.slice(0, 4)} /> : null}
        {nextLevelGates.length > 4 ? (
          <Link href="/ascend" className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline">
            See all gates →
          </Link>
        ) : null}
      </Panel>
    </div>
  );
}
