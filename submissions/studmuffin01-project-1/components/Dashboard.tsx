"use client";

import { memo, useMemo } from "react";
import { getInitiativeAnchorId, initiatives } from "@/lib/initiatives";
import {
  AllSubmissions,
  calculateCohortSubmissionPercent,
} from "@/lib/cohortSubmissions";
import {
  getOverallHealth,
  HEALTH_LEGEND_DEFINITIONS,
  healthColors,
  healthIndicatorStyle,
  healthLabels,
  type HealthStatus,
} from "@/lib/health";
import { scrollToSection } from "@/lib/scroll";
import { tableClass, tdClass, tdPrimaryClass, thClass } from "@/lib/tableStyles";

interface DashboardProps {
  submissions: AllSubmissions;
}

function ProgressCell({ percent }: { percent: number }) {
  return (
    <div className="flex min-w-[8rem] items-center gap-3">
      <div
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-surface-bg"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${percent}% complete`}
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-800 dark:text-surface-primary">
        {percent.toFixed(1)}%
      </span>
    </div>
  );
}

function HealthLegend() {
  return (
    <div
      aria-label="Overall health colour legend"
      className="rounded border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-surface-border dark:bg-surface-card"
    >
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] leading-tight">
        {HEALTH_LEGEND_DEFINITIONS.map((item) => (
          <li key={item.status} className="flex items-center gap-1.5 text-slate-700 dark:text-surface-secondary">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-offset-1 ring-offset-white dark:ring-offset-surface-card"
              style={{
                backgroundColor: healthColors[item.status].fill,
                boxShadow: `0 0 0 1px ${healthColors[item.status].ring}`,
              }}
              aria-hidden="true"
            />
            <span>
              <span className="tabular-nums">{item.range}</span> {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HealthIndicator({ status }: { status: HealthStatus }) {
  return (
    <div className="flex justify-center">
      <span
        className="inline-block h-6 w-6 rounded-full ring-2 ring-offset-1 ring-offset-white dark:ring-offset-surface-card"
        style={healthIndicatorStyle(status)}
        role="img"
        aria-label={`Overall health: ${healthLabels[status]}`}
        title={healthLabels[status]}
      />
    </div>
  );
}

function Dashboard({ submissions }: DashboardProps) {
  const initiativeStats = useMemo(
    () =>
      initiatives.map((item) => {
        const percent = calculateCohortSubmissionPercent(submissions[item.slug]);
        return {
          ...item,
          percent,
          health: getOverallHealth(percent),
        };
      }),
    [submissions]
  );

  return (
    <section aria-label="Executive summary" className="space-y-6">
      <div className="space-y-3">
        <h2 className="section-heading">Executive Summary</h2>
        <HealthLegend />
      </div>

      <div>
        <table className={tableClass}>
          <caption className="sr-only">Executive Summary</caption>
          <thead>
            <tr>
              <th className={thClass}>Initiative</th>
              <th className={thClass}>Cohort Submissions</th>
              <th className={thClass}>Deadline</th>
              <th className={`${thClass} text-center`}>Overall Health</th>
            </tr>
          </thead>
          <tbody>
            {initiativeStats.map((item) => (
              <tr key={item.slug}>
                <td className={tdPrimaryClass}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(getInitiativeAnchorId(item.slug))}
                    className="text-left text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-500 dark:hover:text-brand-400"
                  >
                    {item.title}
                  </button>
                </td>
                <td className={tdClass}>
                  <ProgressCell percent={item.percent} />
                </td>
                <td className={`${tdClass} whitespace-nowrap`}>{item.deadline}</td>
                <td className={tdClass}>
                  <HealthIndicator status={item.health} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default memo(Dashboard);
