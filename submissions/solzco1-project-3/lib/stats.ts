import type { PulseMetrics } from "./types";

export type StatCard = {
  id: string;
  label: string;
  value: number;
  delta: string;
  deltaPositive: boolean;
  accent: "indigo" | "emerald" | "violet" | "cyan";
};

export function buildStatCards(metrics: PulseMetrics): StatCard[] {
  return [
    {
      id: "ships",
      label: "Total ships",
      value: metrics.totalShips,
      delta: "▲ +12% this week",
      deltaPositive: true,
      accent: "indigo",
    },
    {
      id: "commits",
      label: "Combined commits",
      value: metrics.combinedCommits,
      delta: "▲ +847 this week",
      deltaPositive: true,
      accent: "emerald",
    },
    {
      id: "active",
      label: "Active projects",
      value: metrics.activeProjects,
      delta: `● ${metrics.cohortVelocity}% velocity`,
      deltaPositive: true,
      accent: "violet",
    },
    {
      id: "deploys",
      label: "Live deployments",
      value: metrics.liveDeployments,
      delta: "▲ +6 this week",
      deltaPositive: true,
      accent: "cyan",
    },
  ];
}
