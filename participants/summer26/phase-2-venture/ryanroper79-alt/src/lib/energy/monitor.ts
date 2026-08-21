export type MonitorDevice = {
  id: string;
  label: string;
  watts: number;
  on: boolean;
  essential: boolean;
};

export type MonitorPlan = {
  devices: MonitorDevice[];
  estimatedMonthlyKwh: number;
  estimatedMonthlyUsd: number;
  targetMonthlyUsd: number;
  withinTarget: boolean;
  suggestedChanges: string[];
};

export function simulateUsageMonitor(
  devices: MonitorDevice[],
  hoursPerDay: number,
  effectiveRateUsdPerKwh: number,
  targetMonthlyUsd: number
): MonitorPlan {
  const hours = Math.max(0, Math.min(hoursPerDay, 24));
  const rate = Math.max(0.01, effectiveRateUsdPerKwh);

  const monthlyKwh = devices.reduce((sum, d) => {
    if (!d.on) return sum;
    return sum + (d.watts * hours * 30) / 1000;
  }, 0);

  const estimatedMonthlyUsd = monthlyKwh * rate;
  const withinTarget = estimatedMonthlyUsd <= targetMonthlyUsd;

  const suggestedChanges: string[] = [];
  if (!withinTarget) {
    const nonEssential = devices.filter((d) => d.on && !d.essential).sort((a, b) => b.watts - a.watts);
    for (const d of nonEssential.slice(0, 3)) {
      suggestedChanges.push(`Schedule off or reduce runtime: ${d.label} (~${d.watts} W).`);
    }
    if (suggestedChanges.length === 0) {
      suggestedChanges.push('All active loads marked essential — review setpoints or target budget.');
    }
  } else {
    suggestedChanges.push('Current simulated schedule is within target — monitor seasonality.');
  }

  return {
    devices,
    estimatedMonthlyKwh: Math.round(monthlyKwh * 10) / 10,
    estimatedMonthlyUsd: Math.round(estimatedMonthlyUsd),
    targetMonthlyUsd,
    withinTarget,
    suggestedChanges,
  };
}

export const DEFAULT_MONITOR_DEVICES: MonitorDevice[] = [
  { id: 'ac', label: 'AC unit', watts: 1500, on: true, essential: true },
  { id: 'fridge', label: 'Refrigerator', watts: 150, on: true, essential: true },
  { id: 'lights', label: 'Lighting circuit', watts: 400, on: true, essential: false },
  { id: 'pool', label: 'Pool pump', watts: 750, on: false, essential: false },
  { id: 'water_heater', label: 'Water heater', watts: 4500, on: false, essential: false },
];
