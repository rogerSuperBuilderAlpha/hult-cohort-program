/** Overall health indicator derived from cohort submission progress. */

export type HealthStatus = "red" | "orange" | "green";

export interface HealthColor {
  fill: string;
  ring: string;
}

export const HEALTH_LEGEND_DEFINITIONS: {
  status: HealthStatus;
  range: string;
  label: string;
}[] = [
  { status: "green", range: "≥80%", label: "Healthy" },
  { status: "orange", range: "≥40%", label: "Moderate" },
  { status: "red", range: "<40%", label: "At risk" },
];

export const healthColors: Record<HealthStatus, HealthColor> = {
  green: { fill: "#22C55E", ring: "#86EFAC" },
  orange: { fill: "#FB923C", ring: "#FED7AA" },
  red: { fill: "#991B1B", ring: "#FECACA" },
};

export const healthLabels: Record<HealthStatus, string> = {
  red: "At risk",
  orange: "Moderate",
  green: "Healthy",
};

export function healthIndicatorStyle(status: HealthStatus): {
  backgroundColor: string;
  boxShadow: string;
} {
  const { fill, ring } = healthColors[status];
  return {
    backgroundColor: fill,
    boxShadow: `0 0 0 2px ${ring}`,
  };
}

export function getOverallHealth(cohortPercent: number): HealthStatus {
  if (cohortPercent >= 80) return "green";
  if (cohortPercent >= 40) return "orange";
  return "red";
}
