import type { CalculatorInput } from '@/lib/energy/calculator';
import type { JurisdictionId } from '@/lib/energy/tariffs';
import { usdToLocal } from '@/lib/energy/currency';

export type MoneyRangeLocal = { min: number; max: number };

export type PriorityIntervention = {
  id: 'ac_upgrade' | 'refrigeration' | 'remote_sensors';
  title: string;
  headline: string;
  description: string;
  estimatedMonthlySavingsLocal: MoneyRangeLocal;
  estimatedInstallCostLocal: MoneyRangeLocal;
  paybackMonths: { min: number; max: number };
  billSharePct: number;
};

export type PhasedInstallStep = {
  phase: number;
  months: string;
  focus: string;
  measures: string[];
  cumulativeReductionPct: number;
};

export type ReductionTargetPlan = {
  targetPct: number;
  monthlySavingsLocal: number;
  annualSavingsLocal: number;
  currentMonthlyBillLocal: number;
  targetMonthlyBillLocal: number;
  phasedSteps: PhasedInstallStep[];
  cealGreenNote: string;
};

function paybackMonths(costMin: number, costMax: number, saveMin: number, saveMax: number) {
  if (saveMax <= 0) return { min: 0, max: 0 };
  return {
    min: Math.max(1, Math.round((costMin / saveMax) * 12)),
    max: Math.max(1, Math.round((costMax / saveMin) * 12)),
  };
}

function toLocalRange(
  usdMin: number,
  usdMax: number,
  jurisdiction: JurisdictionId
): MoneyRangeLocal {
  return {
    min: Math.round(usdToLocal(usdMin, jurisdiction)),
    max: Math.round(usdToLocal(usdMax, jurisdiction)),
  };
}

export function buildPriorityInterventions(
  input: CalculatorInput,
  annualKwh: number,
  effectiveRateUsdPerKwh: number,
  jurisdiction: JurisdictionId
): PriorityIntervention[] {
  const rate = effectiveRateUsdPerKwh > 0 ? effectiveRateUsdPerKwh : 0.25;
  const annualSpendUsd = annualKwh * rate;
  const monthlySpendUsd = annualSpendUsd / 12;
  const interventions: PriorityIntervention[] = [];

  const hasAc = input.majorLoads.includes('air_conditioning');
  const hasRefrig = input.majorLoads.includes('refrigeration');
  const hasControls = input.efficiencyMeasures.includes('building_controls');
  const hasEfficientAc = input.efficiencyMeasures.includes('efficient_ac');

  if (hasAc && !hasEfficientAc) {
    const hvacShare = 0.42;
    const saveMinUsd = (annualSpendUsd * hvacShare * 0.12) / 12;
    const saveMaxUsd = (annualSpendUsd * hvacShare * 0.22) / 12;
    interventions.push({
      id: 'ac_upgrade',
      title: 'High-efficiency AC & plant optimization',
      headline: 'Often the largest share of Caribbean commercial bills',
      description:
        'Replace aging split units or tune central plant: inverter compressors, coil cleaning, setpoint discipline, and night setback can cut cooling kWh without sacrificing comfort.',
      estimatedMonthlySavingsLocal: toLocalRange(saveMinUsd, saveMaxUsd, jurisdiction),
      estimatedInstallCostLocal: toLocalRange(2000, 28000, jurisdiction),
      paybackMonths: paybackMonths(2000, 28000, saveMinUsd * 12, saveMaxUsd * 12),
      billSharePct: Math.round(hvacShare * 100),
    });
  } else if (hasAc) {
    interventions.push({
      id: 'ac_upgrade',
      title: 'AC maintenance & fine-tuning',
      headline: 'You already report efficient AC — squeeze more from operations',
      description:
        'CEAL engineers can validate refrigerant charge, airflow, and scheduling to protect your existing investment and avoid premature replacement.',
      estimatedMonthlySavingsLocal: toLocalRange(monthlySpendUsd * 0.03, monthlySpendUsd * 0.06, jurisdiction),
      estimatedInstallCostLocal: toLocalRange(300, 3500, jurisdiction),
      paybackMonths: paybackMonths(300, 3500, monthlySpendUsd * 0.03 * 12, monthlySpendUsd * 0.06 * 12),
      billSharePct: 35,
    });
  }

  if (hasRefrig) {
    const refShare = 0.12;
    const saveMinUsd = (annualSpendUsd * refShare * 0.15) / 12;
    const saveMaxUsd = (annualSpendUsd * refShare * 0.28) / 12;
    interventions.push({
      id: 'refrigeration',
      title: 'Refrigeration efficiency package',
      headline: 'Cold rooms & display cases run 24/7 — small fixes add up',
      description:
        'EC fan motors, door seals, anti-sweat heaters, and defrost scheduling reduce compressor runtime. Ideal for retail, hospitality, and food service.',
      estimatedMonthlySavingsLocal: toLocalRange(saveMinUsd, saveMaxUsd, jurisdiction),
      estimatedInstallCostLocal: toLocalRange(800, 15000, jurisdiction),
      paybackMonths: paybackMonths(800, 15000, saveMinUsd * 12, saveMaxUsd * 12),
      billSharePct: Math.round(refShare * 100),
    });
  } else {
    interventions.push({
      id: 'refrigeration',
      title: 'Refrigeration audit (if applicable)',
      headline: 'Add refrigeration loads if you operate cold storage or display cases',
      description:
        'Select refrigeration under major loads above for tailored savings. Walk-in coolers and bar fridges are common hidden loads in Caribbean retail.',
      estimatedMonthlySavingsLocal: toLocalRange(monthlySpendUsd * 0.02, monthlySpendUsd * 0.05, jurisdiction),
      estimatedInstallCostLocal: toLocalRange(500, 8000, jurisdiction),
      paybackMonths: paybackMonths(500, 8000, monthlySpendUsd * 0.02 * 12, monthlySpendUsd * 0.05 * 12),
      billSharePct: 8,
    });
  }

  if (!hasControls) {
    const saveMinUsd = monthlySpendUsd * 0.06;
    const saveMaxUsd = monthlySpendUsd * 0.14;
    interventions.push({
      id: 'remote_sensors',
      title: 'Remote sensors & building controls',
      headline: 'See waste before it hits the bill',
      description:
        'Wireless temperature/humidity sensors, occupancy-based HVAC, and remote monitoring dashboards flag off-hours cooling and failed equipment early.',
      estimatedMonthlySavingsLocal: toLocalRange(saveMinUsd, saveMaxUsd, jurisdiction),
      estimatedInstallCostLocal: toLocalRange(2500, 22000, jurisdiction),
      paybackMonths: paybackMonths(2500, 22000, saveMinUsd * 12, saveMaxUsd * 12),
      billSharePct: 10,
    });
  } else {
    interventions.push({
      id: 'remote_sensors',
      title: 'Expand sensor coverage & analytics',
      headline: 'Build on existing controls with CEAL commissioning',
      description:
        'Additional zones, alert thresholds, and monthly review meetings turn installed hardware into sustained savings.',
      estimatedMonthlySavingsLocal: toLocalRange(monthlySpendUsd * 0.03, monthlySpendUsd * 0.07, jurisdiction),
      estimatedInstallCostLocal: toLocalRange(1200, 12000, jurisdiction),
      paybackMonths: paybackMonths(1200, 12000, monthlySpendUsd * 0.03 * 12, monthlySpendUsd * 0.07 * 12),
      billSharePct: 8,
    });
  }

  return interventions;
}

export function buildReductionTargetPlan(
  monthlyExpenditureLocal: number,
  jurisdiction: JurisdictionId,
  targetPct = 25
): ReductionTargetPlan {
  const monthlySavingsLocal = Math.round(monthlyExpenditureLocal * (targetPct / 100));
  const annualSavingsLocal = monthlySavingsLocal * 12;
  const targetMonthlyBillLocal = Math.max(0, monthlyExpenditureLocal - monthlySavingsLocal);

  return {
    targetPct,
    monthlySavingsLocal,
    annualSavingsLocal,
    currentMonthlyBillLocal: monthlyExpenditureLocal,
    targetMonthlyBillLocal,
    phasedSteps: [
      {
        phase: 1,
        months: 'Months 1–2',
        focus: 'Quick wins & visibility',
        measures: [
          'Remote sensors and scheduling review',
          'Operational setpoint and shutdown checklist',
          'Baseline metering on largest circuits',
        ],
        cumulativeReductionPct: 8,
      },
      {
        phase: 2,
        months: 'Months 3–5',
        focus: 'Cooling & refrigeration capital',
        measures: [
          'Prioritized AC replacements or VRF upgrades within budget',
          'Refrigeration door seals, EC fans, and defrost optimization',
          'LED retrofit where still on legacy lighting',
        ],
        cumulativeReductionPct: 18,
      },
      {
        phase: 3,
        months: 'Months 6–12',
        focus: 'Commission & sustain ≥25%',
        measures: [
          'Commissioning and M&V against utility bills',
          'Phased roll-out of remaining ECMs',
          'Staff training and monthly performance review with CEAL',
        ],
        cumulativeReductionPct: targetPct,
      },
    ],
    cealGreenNote:
      'Illustrative phased plan — CEAL Green engineers provide firm quotes, utility-specific tariff modelling, and a budget-prioritized install schedule at www.cealgreen.com.',
  };
}

export const CEAL_GREEN_BOOKING_URL =
  process.env.NEXT_PUBLIC_CEAL_BOOKING_URL?.trim() || 'https://cealgreen.com/book-now/';
