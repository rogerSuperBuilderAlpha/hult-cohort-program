import type {
  CohortLevel,
  CohortMetrics,
  Contribution,
  GateCheck,
  MvpStatus,
  Profile,
  PullRequest,
  Task,
  WeeklyActivity,
} from "./types";

const LEVEL_3_TARGETS = {
  totalMergedPrs: 300,
  uniqueContributors: 40,
  mvpFeaturePct: 100,
  // Inverse metric: 0 bugs is the target; use bugs as distance from 0 for index.
  criticalBugsOpen: 0,
  weeklyActivePct: 80,
  dailyActivePct: 60,
} as const;

export const LEVEL_LABELS: Record<CohortLevel, string> = {
  pre_level_1: "Pre-Level 1",
  builder: "Builder Civilization",
  stellar: "Stellar Civilization",
  galactic: "Galactic Civilization",
};

export function startOfWeek(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday-start week
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function computeCohortMetrics(input: {
  profiles: Profile[];
  pullRequests: PullRequest[];
  contributions: Contribution[];
  mvp: MvpStatus | null;
  weeklyActivity: WeeklyActivity[];
}): CohortMetrics {
  const cohortSize = Math.max(input.profiles.length, 1);
  const merged = input.pullRequests.filter((pr) => pr.status === "merged");
  const totalMergedPrs = merged.length;
  const prsWithTwoPlusReviewers = merged.filter((pr) => pr.reviewer_count >= 2).length;

  const contributorIds = new Set<string>();
  for (const pr of merged) contributorIds.add(pr.profile_id);
  for (const c of input.contributions) contributorIds.add(c.profile_id);
  const uniqueContributors = contributorIds.size;

  const outputCounts = new Map<string, number>();
  for (const pr of merged) {
    outputCounts.set(pr.profile_id, (outputCounts.get(pr.profile_id) ?? 0) + 1);
  }
  for (const c of input.contributions) {
    outputCounts.set(c.profile_id, (outputCounts.get(c.profile_id) ?? 0) + 1);
  }
  let contributorsWithFivePlus = 0;
  for (const count of outputCounts.values()) {
    if (count >= 5) contributorsWithFivePlus += 1;
  }

  const week = startOfWeek();
  const thisWeek = input.weeklyActivity.filter((row) => row.week_start === week);
  const weeklyActive = thisWeek.filter((row) => row.active).length;
  const weeklyActivePct = (weeklyActive / cohortSize) * 100;

  // v1 limitation: schema has no daily activity table. Use weekly active % as a
  // stand-in for daily_active_pct so Level 2/3 gates remain evaluable.
  const dailyActivePct = weeklyActivePct;

  return {
    totalMergedPrs,
    uniqueContributors,
    mvpFeaturePct: Number(input.mvp?.feature_completion_pct ?? 0),
    criticalBugsOpen: input.mvp?.critical_bugs_open ?? 0,
    e2eFlowImplemented: input.mvp?.e2e_flow_implemented ?? false,
    weeklyActivePct,
    dailyActivePct,
    cohortSize,
    prsWithTwoPlusReviewers,
    contributorsWithFivePlus,
  };
}

function gateChecksForLevel(
  level: Exclude<CohortLevel, "pre_level_1">,
  m: CohortMetrics,
): GateCheck[] {
  if (level === "builder") {
    return [
      {
        key: "merged",
        label: "Merged PRs",
        met: m.totalMergedPrs >= 50,
        current: String(m.totalMergedPrs),
        target: "≥ 50",
      },
      {
        key: "contributors",
        label: "Unique contributors",
        met: m.uniqueContributors >= 15,
        current: String(m.uniqueContributors),
        target: "≥ 15",
      },
      {
        key: "mvp",
        label: "MVP feature completion",
        met: m.mvpFeaturePct >= 60,
        current: `${m.mvpFeaturePct}%`,
        target: "≥ 60%",
      },
      {
        key: "e2e",
        label: "End-to-end flow implemented",
        met: m.e2eFlowImplemented,
        current: m.e2eFlowImplemented ? "Yes" : "No",
        target: "Yes",
      },
      {
        key: "wau",
        label: "Weekly active",
        met: m.weeklyActivePct >= 10,
        current: `${m.weeklyActivePct.toFixed(1)}%`,
        target: "≥ 10%",
      },
    ];
  }

  if (level === "stellar") {
    const reviewedPct =
      m.totalMergedPrs === 0 ? 0 : (m.prsWithTwoPlusReviewers / m.totalMergedPrs) * 100;
    const heavyPct =
      m.uniqueContributors === 0
        ? 0
        : (m.contributorsWithFivePlus / m.uniqueContributors) * 100;
    return [
      {
        key: "merged",
        label: "Merged PRs",
        met: m.totalMergedPrs >= 150,
        current: String(m.totalMergedPrs),
        target: "≥ 150",
      },
      {
        key: "reviewed",
        label: "PRs with ≥2 reviewers",
        met: reviewedPct >= 30,
        current: `${reviewedPct.toFixed(1)}%`,
        target: "≥ 30%",
      },
      {
        key: "contributors",
        label: "Unique contributors",
        met: m.uniqueContributors >= 25,
        current: String(m.uniqueContributors),
        target: "≥ 25",
      },
      {
        key: "heavy",
        label: "Contributors with ≥5 outputs",
        met: heavyPct >= 20,
        current: `${heavyPct.toFixed(1)}%`,
        target: "≥ 20%",
      },
      {
        key: "mvp",
        label: "MVP feature completion",
        met: m.mvpFeaturePct >= 90,
        current: `${m.mvpFeaturePct}%`,
        target: "≥ 90%",
      },
      {
        key: "bugs",
        label: "Critical bugs open",
        met: m.criticalBugsOpen <= 5,
        current: String(m.criticalBugsOpen),
        target: "≤ 5",
      },
      {
        key: "wau",
        label: "Weekly active",
        met: m.weeklyActivePct >= 50,
        current: `${m.weeklyActivePct.toFixed(1)}%`,
        target: "≥ 50%",
      },
      {
        key: "dau",
        label: "Daily active (weekly stand-in)",
        met: m.dailyActivePct >= 30,
        current: `${m.dailyActivePct.toFixed(1)}%`,
        target: "≥ 30%",
      },
    ];
  }

  return [
    {
      key: "merged",
      label: "Merged PRs",
      met: m.totalMergedPrs >= 300,
      current: String(m.totalMergedPrs),
      target: "≥ 300",
    },
    {
      key: "contributors",
      label: "Unique contributors",
      met: m.uniqueContributors >= 40,
      current: String(m.uniqueContributors),
      target: "≥ 40",
    },
    {
      key: "mvp",
      label: "MVP feature completion",
      met: m.mvpFeaturePct >= 100,
      current: `${m.mvpFeaturePct}%`,
      target: "100%",
    },
    {
      key: "bugs",
      label: "Critical bugs open",
      met: m.criticalBugsOpen === 0,
      current: String(m.criticalBugsOpen),
      target: "0",
    },
    {
      key: "wau",
      label: "Weekly active",
      met: m.weeklyActivePct >= 80,
      current: `${m.weeklyActivePct.toFixed(1)}%`,
      target: "≥ 80%",
    },
    {
      key: "dau",
      label: "Daily active (weekly stand-in)",
      met: m.dailyActivePct >= 60,
      current: `${m.dailyActivePct.toFixed(1)}%`,
      target: "≥ 60%",
    },
  ];
}

export function evaluateCohortLevel(metrics: CohortMetrics): {
  level: CohortLevel;
  gates: GateCheck[];
  nextLevelGates: GateCheck[];
} {
  const galactic = gateChecksForLevel("galactic", metrics);
  if (galactic.every((g) => g.met)) {
    return { level: "galactic", gates: galactic, nextLevelGates: [] };
  }
  const stellar = gateChecksForLevel("stellar", metrics);
  if (stellar.every((g) => g.met)) {
    return { level: "stellar", gates: stellar, nextLevelGates: galactic };
  }
  const builder = gateChecksForLevel("builder", metrics);
  if (builder.every((g) => g.met)) {
    return { level: "builder", gates: builder, nextLevelGates: stellar };
  }
  return { level: "pre_level_1", gates: [], nextLevelGates: builder };
}

/** Cosmetic 0–1 index: average of ratios to Level 3 targets, capped at 1. */
export function computeCivilizationIndex(metrics: CohortMetrics): number {
  const ratios = [
    metrics.totalMergedPrs / LEVEL_3_TARGETS.totalMergedPrs,
    metrics.uniqueContributors / LEVEL_3_TARGETS.uniqueContributors,
    metrics.mvpFeaturePct / LEVEL_3_TARGETS.mvpFeaturePct,
    // Bugs: 0 open → 1.0; treat 10+ as 0 for cosmetic scale
    Math.max(0, 1 - metrics.criticalBugsOpen / 10),
    metrics.weeklyActivePct / LEVEL_3_TARGETS.weeklyActivePct,
    metrics.dailyActivePct / LEVEL_3_TARGETS.dailyActivePct,
  ].map((r) => Math.min(1, r));

  return ratios.reduce((a, b) => a + b, 0) / ratios.length;
}

/**
 * Civilization Energy — recomputed from current tables (never decreases as data grows).
 * Flag: "Critical bug fixed (+100)" has no event history in the schema, so it is omitted.
 * v1.1: +10 per task in `done` (does not affect gate metrics).
 */
export function computeCivilizationEnergy(input: {
  pullRequests: PullRequest[];
  contributions: Contribution[];
  weeklyActivity: WeeklyActivity[];
  mvp: MvpStatus | null;
  tasks?: Task[];
}): number {
  const merged = input.pullRequests.filter((pr) => pr.status === "merged");
  const reviewUnits = merged.reduce((sum, pr) => sum + pr.reviewer_count, 0);
  const issuesResolved = input.contributions.filter((c) => c.type === "issue_resolved").length;
  const feedback = input.contributions.filter((c) => c.type === "feedback_addressed").length;
  const activeWeeks = input.weeklyActivity.filter((row) => row.active).length;
  const doneTasks = (input.tasks ?? []).filter((t) => t.status === "done").length;

  let energy = 0;
  energy += merged.length * 50;
  energy += reviewUnits * 20;
  energy += issuesResolved * 15;
  energy += feedback * 40;
  energy += activeWeeks * 25;
  energy += doneTasks * 10;

  if (input.mvp?.e2e_flow_implemented) energy += 75; // Feature delivered (proxy)
  if (Number(input.mvp?.feature_completion_pct ?? 0) >= 100) energy += 250; // MVP deployed

  return energy;
}

/** Monday–Sunday ISO date bounds for "this week" (UTC, Monday-start). */
export function weekDateBounds(date = new Date()): { start: string; end: string } {
  const start = startOfWeek(date);
  const endDate = new Date(`${start}T00:00:00.000Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 6);
  return { start, end: endDate.toISOString().slice(0, 10) };
}

export type DueUrgency = "none" | "soon" | "overdue";

export function dueUrgency(dueDate: string | null, today = new Date()): DueUrgency {
  if (!dueDate) return "none";
  const todayStr = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
    .toISOString()
    .slice(0, 10);
  if (dueDate < todayStr) return "overdue";
  const limit = new Date(`${todayStr}T00:00:00.000Z`);
  limit.setUTCDate(limit.getUTCDate() + 2);
  const limitStr = limit.toISOString().slice(0, 10);
  if (dueDate <= limitStr) return "soon";
  return "none";
}

export function badgesForLevel(level: CohortLevel): string[] {
  const badges: string[] = [];
  if (level === "builder" || level === "stellar" || level === "galactic") {
    badges.push("Type I Founder");
  }
  if (level === "stellar" || level === "galactic") {
    badges.push("Stellar Recognition");
  }
  if (level === "galactic") {
    badges.push("Full Adoption");
  }
  return badges;
}
