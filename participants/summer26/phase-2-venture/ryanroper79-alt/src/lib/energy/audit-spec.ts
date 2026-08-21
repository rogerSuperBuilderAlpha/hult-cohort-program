import type { CalculatorInput, MajorLoad, EfficiencyMeasure } from '@/lib/energy/calculator';

export type AuditLevelInfo = {
  level: 1 | 2 | 3;
  name: string;
  summary: string;
  deliverables: string[];
  whenRecommended: string;
};

export type ReadingGuideItem = {
  id: string;
  label: string;
  value: string;
  specification: string;
  howToRead: string;
  businessRelevance: string;
};

export type EndUseSlice = {
  category: string;
  sharePct: number;
  estimatedAnnualKwh: number;
  systems: string;
};

export type ConservationMeasure = {
  id: string;
  title: string;
  phase: 'efficiency-first' | 'renewable-later';
  description: string;
  estimatedAnnualUsdSaved: { min: number; max: number };
  estimatedCostUsd: { min: number; max: number };
  paybackMonths: { min: number; max: number };
  priority: 'high' | 'medium' | 'low';
};

/** ASHRAE-aligned audit level suggestion (public illustrative — not a formal audit). */
export function suggestAuditLevel(input: CalculatorInput, readinessScore: number): AuditLevelInfo {
  const isLarge =
    input.monthlyExpenditureUsd >= 2500 ||
    (input.monthlyKwh != null && input.monthlyKwh >= 1000) ||
    input.propertyType === 'institutional';

  const isMid =
    input.propertyType !== 'residential' &&
    (input.monthlyExpenditureUsd >= 400 || readinessScore >= 55);

  if (isLarge && readinessScore >= 70) {
    return {
      level: 3,
      name: 'Investment-grade audit (ASHRAE Level 3)',
      summary:
        'Deep engineering and financial due diligence — sub-metering, load profiles, and risk analysis to support financing or performance contracts.',
      deliverables: [
        'Sub-metering and time-resolved load profiles',
        'Simulation-backed savings validation',
        'Measurement & verification (M&V) plan for financiers',
        'Renewable sizing against an optimized, audited baseline',
      ],
      whenRecommended:
        'Significant renewable capital (e.g. solar PV at scale), third-party financing, or performance contracting.',
    };
  }

  if (isMid || readinessScore >= 50) {
    return {
      level: 2,
      name: 'Detailed audit (ASHRAE Level 2)',
      summary:
        'Comprehensive data collection, end-use breakdown, and financial analysis of prioritized energy conservation measures (ECMs).',
      deliverables: [
        'End-use energy breakdown by major system',
        'Baseline energy intensity (kWh/m², effective $/kWh)',
        'ECM list with savings, costs, and payback periods',
        'Roadmap sequencing efficiency before renewables',
      ],
      whenRecommended:
        'Commercial or institutional sites planning equipment upgrades or renewable integration.',
    };
  }

  return {
    level: 1,
    name: 'Preliminary / walk-through audit (ASHRAE Level 1)',
    summary:
      'High-level site review and utility bill analysis to identify obvious waste and low-cost improvements.',
    deliverables: [
      'Utility bill and tariff review',
      'Qualitative identification of obvious wastage',
      'Low-cost / no-cost operational opportunities',
      'Decision whether to proceed to Level 2',
    ],
    whenRecommended: 'First step for smaller sites or when baseline data is still being assembled.',
  };
}

const LOAD_SHARE: Record<MajorLoad, { label: string; baseShare: number; systems: string }> = {
  air_conditioning: { label: 'HVAC / cooling', baseShare: 0.42, systems: 'AC plant, chillers, ventilation' },
  refrigeration: { label: 'Refrigeration', baseShare: 0.12, systems: 'Cold rooms, display cases, compressors' },
  lighting: { label: 'Lighting', baseShare: 0.18, systems: 'Interior, exterior, parking, signage' },
  motors_pumps: { label: 'Motors & pumps', baseShare: 0.14, systems: 'Compressed air, water pumps, process drives' },
  water_heating: { label: 'Water heating', baseShare: 0.08, systems: 'Boilers, immersion, solar pre-heat' },
  it_servers: { label: 'IT & servers', baseShare: 0.1, systems: 'Data racks, UPS, network closets' },
  pool_equipment: { label: 'Pool / ancillary', baseShare: 0.06, systems: 'Pumps, heaters, filtration' },
};

export function estimateEndUseBreakdown(
  annualKwh: number,
  majorLoads: MajorLoad[]
): EndUseSlice[] {
  if (majorLoads.length === 0) {
    return [
      {
        category: 'General building loads',
        sharePct: 100,
        estimatedAnnualKwh: annualKwh,
        systems: 'Enter major loads above for a clearer end-use split',
      },
    ];
  }

  const weights = majorLoads.map((l) => LOAD_SHARE[l]);
  const totalWeight = weights.reduce((s, w) => s + w.baseShare, 0);
  return weights.map((w) => {
    const sharePct = Math.round((w.baseShare / totalWeight) * 100);
    return {
      category: w.label,
      sharePct,
      estimatedAnnualKwh: Math.round((annualKwh * w.baseShare) / totalWeight),
      systems: w.systems,
    };
  });
}

function paybackMonths(costMin: number, costMax: number, saveMin: number, saveMax: number) {
  if (saveMax <= 0) return { min: 0, max: 0 };
  return {
    min: Math.max(1, Math.round((costMin / saveMax) * 12)),
    max: Math.max(1, Math.round((costMax / saveMin) * 12)),
  };
}

export function buildConservationMeasures(
  input: CalculatorInput,
  annualKwh: number,
  effectiveRate: number
): ConservationMeasure[] {
  const rate = effectiveRate > 0 ? effectiveRate : 0.25;
  const annualSpend = annualKwh * rate;
  const measures: ConservationMeasure[] = [];

  measures.push({
    id: 'operational',
    title: 'Operational & scheduling improvements',
    phase: 'efficiency-first',
    description:
      'Adjust setpoints, shutdown idling equipment, align run hours with occupancy — often low-cost savings before capital spend.',
    estimatedAnnualUsdSaved: {
      min: Math.round(annualSpend * 0.05),
      max: Math.round(annualSpend * 0.1),
    },
    estimatedCostUsd: { min: 0, max: 1500 },
    paybackMonths: paybackMonths(0, 1500, annualSpend * 0.05, annualSpend * 0.1),
    priority: 'high',
  });

  if (input.majorLoads.includes('lighting') && !input.efficiencyMeasures.includes('led_lighting')) {
    const lightingKwh = annualKwh * 0.18;
    const saveMin = Math.round(lightingKwh * 0.45 * rate);
    const saveMax = Math.round(lightingKwh * 0.65 * rate);
    measures.push({
      id: 'led',
      title: 'LED lighting retrofit',
      phase: 'efficiency-first',
      description: 'Replace high-wattage fixtures; typical 40–65% lighting energy reduction.',
      estimatedAnnualUsdSaved: { min: saveMin, max: saveMax },
      estimatedCostUsd: { min: 800, max: 6000 },
      paybackMonths: paybackMonths(800, 6000, saveMin, saveMax),
      priority: 'high',
    });
  }

  if (input.majorLoads.includes('air_conditioning') && !input.efficiencyMeasures.includes('efficient_ac')) {
    const hvacKwh = annualKwh * 0.4;
    const saveMin = Math.round(hvacKwh * 0.08 * rate);
    const saveMax = Math.round(hvacKwh * 0.18 * rate);
    measures.push({
      id: 'hvac',
      title: 'HVAC optimization & efficient plant',
      phase: 'efficiency-first',
      description:
        'Maintenance, controls, and equipment upgrades — Caribbean commercial sites often see large AC share.',
      estimatedAnnualUsdSaved: { min: saveMin, max: saveMax },
      estimatedCostUsd: { min: 2000, max: 25000 },
      paybackMonths: paybackMonths(2000, 25000, saveMin, saveMax),
      priority: 'high',
    });
  }

  if (input.majorLoads.includes('refrigeration')) {
    const refKwh = annualKwh * 0.12;
    const saveMin = Math.round(refKwh * 0.15 * rate);
    const saveMax = Math.round(refKwh * 0.28 * rate);
    measures.push({
      id: 'refrigeration',
      title: 'Refrigeration efficiency upgrades',
      phase: 'efficiency-first',
      description:
        'EC fan motors, door seals, anti-sweat controls, and defrost scheduling for cold rooms and display cases.',
      estimatedAnnualUsdSaved: { min: saveMin, max: saveMax },
      estimatedCostUsd: { min: 800, max: 15000 },
      paybackMonths: paybackMonths(800, 15000, saveMin, saveMax),
      priority: 'high',
    });
  }

  if (input.majorLoads.includes('motors_pumps')) {
    const motorKwh = annualKwh * 0.14;
    const saveMin = Math.round(motorKwh * 0.1 * rate);
    const saveMax = Math.round(motorKwh * 0.2 * rate);
    measures.push({
      id: 'motors',
      title: 'Motor / compressed-air efficiency',
      phase: 'efficiency-first',
      description: 'Leak repair, variable-speed drives, right-sizing — common audit findings in industry.',
      estimatedAnnualUsdSaved: { min: saveMin, max: saveMax },
      estimatedCostUsd: { min: 1500, max: 12000 },
      paybackMonths: paybackMonths(1500, 12000, saveMin, saveMax),
      priority: 'medium',
    });
  }

  if (!input.efficiencyMeasures.includes('building_controls')) {
    measures.push({
      id: 'controls',
      title: 'Building energy management & controls',
      phase: 'efficiency-first',
      description: 'Scheduling, sensors, and setpoint control to reduce simultaneous peaks and off-hours waste.',
      estimatedAnnualUsdSaved: {
        min: Math.round(annualSpend * 0.04),
        max: Math.round(annualSpend * 0.1),
      },
      estimatedCostUsd: { min: 2500, max: 18000 },
      paybackMonths: paybackMonths(
        2500,
        18000,
        annualSpend * 0.04,
        annualSpend * 0.1
      ),
      priority: 'medium',
    });
  }

  if (!input.efficiencyMeasures.includes('solar_pv')) {
    const rightSizedKwh = Math.round(annualKwh * 0.7);
    measures.push({
      id: 'solar',
      title: 'Solar PV (after efficiency measures)',
      phase: 'renewable-later',
      description:
        'Size PV against a leaner post-audit load — literature cites 10–30% demand reduction before renewables, lowering capex.',
      estimatedAnnualUsdSaved: {
        min: Math.round(rightSizedKwh * 0.15 * rate),
        max: Math.round(rightSizedKwh * 0.35 * rate),
      },
      estimatedCostUsd: { min: 15000, max: 80000 },
      paybackMonths: paybackMonths(
        15000,
        80000,
        rightSizedKwh * 0.15 * rate,
        rightSizedKwh * 0.35 * rate
      ),
      priority: 'low',
    });
  }

  return measures.slice(0, 6);
}

export function buildReadingGuide(params: {
  monthlyKwh: number;
  annualKwh: number;
  monthlySpend: number;
  annualSpend: number;
  monthlySpendLocal: number;
  annualSpendLocal: number;
  currencyLabel: string;
  effectiveRate: number | null;
  eui: number | null;
  readinessScore: number;
  auditLevel: AuditLevelInfo;
}): ReadingGuideItem[] {
  const rate =
    params.effectiveRate != null ? `$${params.effectiveRate.toFixed(3)}/kWh` : 'Not computed (add kWh + spend)';
  return [
    {
      id: 'monthly-kwh',
      label: 'Monthly electricity (kWh)',
      value: `${params.monthlyKwh.toLocaleString()} kWh`,
      specification: 'Utility metered energy — ASHRAE baseline input',
      howToRead: 'Compare to prior bills; rising kWh without production growth signals waste or tariff drift.',
      businessRelevance: 'Drives demand charges, carbon exposure, and renewable sizing.',
    },
    {
      id: 'annual-spend',
      label: 'Annual electricity spend',
      value: `${params.currencyLabel}${params.annualSpendLocal.toLocaleString()} (~$${params.annualSpend.toLocaleString()} USD)`,
      specification: 'Cash operating cost at stated tariff',
      howToRead: 'Multiply monthly spend × 12 unless seasonality is large; verify currency and fuel adjustment clauses.',
      businessRelevance: 'Direct P&L impact; ECM paybacks compare savings against this baseline.',
    },
    {
      id: 'effective-rate',
      label: 'Effective tariff rate',
      value: rate,
      specification: 'Total bill ÷ kWh for the period',
      howToRead: 'Higher than published energy-only rate indicates demand, fixed, or duty charges embedded in spend.',
      businessRelevance: 'Used to translate kWh savings into dollar savings and payback periods.',
    },
    {
      id: 'eui',
      label: 'Energy use intensity (EUI)',
      value:
        params.eui != null ? `${params.eui} kWh/m²/year` : 'Add floor area (m²) to compute',
      specification: 'kWh per square metre per year — performance indicator',
      howToRead: 'Benchmark against similar building types; lower EUI after ECMs proves audit impact.',
      businessRelevance: 'Supports M&V, disclosures, and financier due diligence.',
    },
    {
      id: 'readiness',
      label: 'Audit readiness score',
      value: `${params.readinessScore}/100`,
      specification: 'Data completeness for a credible audit',
      howToRead: 'Higher scores mean bills, kWh, loads, and site context are sufficient for Level 2/3 work.',
      businessRelevance: `Suggested path: ${params.auditLevel.name}.`,
    },
  ];
}

export const AUDIT_BUSINESS_CASE: string[] = [
  'Efficiency first, renewables second — right-size solar and storage against a leaner load (industry guidance cited in APETT Evolve, Eng. Kevin Grant Sr.).',
  'Well-executed audits often find 5–20% savings with paybacks under five years (tariff-dependent) before any renewable capex.',
  'Pre-audit efficiency can cut electricity use 10–30%, reducing PV and storage capital while improving coverage of onsite load.',
  'Audited baselines reduce demand risk for financiers, EPC contracts, and measurement & verification plans.',
  'End-use breakdown turns flat annual consumption into actionable HVAC, lighting, and process priorities.',
];

export const AUDIT_LITERATURE_NOTE =
  'Illustrative ECM costs and paybacks are generic planning bands — not investment-grade. Confirm with a Level 2/3 audit and local quotes.';
