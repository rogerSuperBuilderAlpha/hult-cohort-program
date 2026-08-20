import type { JurisdictionId } from '@/lib/energy/tariffs';
import { compareJurisdictions } from '@/lib/energy/tariffs';
import {
  getCurrencyInfo,
  localToUsd,
  usdToLocal,
  type LocalCurrencyInfo,
} from '@/lib/energy/currency';
import {
  buildPriorityInterventions,
  buildReductionTargetPlan,
  type PriorityIntervention,
  type ReductionTargetPlan,
} from '@/lib/energy/interventions';
import {
  suggestAuditLevel,
  estimateEndUseBreakdown,
  buildConservationMeasures,
  buildReadingGuide,
  AUDIT_BUSINESS_CASE,
  AUDIT_LITERATURE_NOTE,
  type AuditLevelInfo,
  type ReadingGuideItem,
  type EndUseSlice,
  type ConservationMeasure,
} from '@/lib/energy/audit-spec';

export type PropertyType = 'residential' | 'commercial' | 'institutional';

export type MajorLoad =
  | 'air_conditioning'
  | 'refrigeration'
  | 'lighting'
  | 'motors_pumps'
  | 'water_heating'
  | 'it_servers'
  | 'pool_equipment';

export type EfficiencyMeasure =
  | 'led_lighting'
  | 'efficient_ac'
  | 'solar_pv'
  | 'building_controls'
  | 'power_factor_correction';

export type CalculatorInput = {
  jurisdiction: JurisdictionId;
  propertyType: PropertyType;
  monthlyExpenditureUsd: number;
  monthlyKwh: number | null;
  floorAreaSqm: number | null;
  weeklyOperatingHours: number;
  majorLoads: MajorLoad[];
  efficiencyMeasures: EfficiencyMeasure[];
};

export type SavingsScenario = {
  label: 'low' | 'medium' | 'high';
  annualKwhSaved: { min: number; max: number };
  annualUsdSaved: { min: number; max: number };
  description: string;
};

export type RecommendedAction = {
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
};

export type CurrencySummary = LocalCurrencyInfo & {
  monthlyExpenditureLocal: number;
  annualExpenditureLocal: number;
};

export type ParsedBill = {
  kwh: number | null;
  amountLocal: number | null;
  amountUsd: number | null;
  currencyCode: string | null;
  billingDays: number | null;
  /** Normalized to ~30-day month when billing period is known */
  monthlyKwh: number | null;
  monthlyAmountLocal: number | null;
  hints: string[];
};

export type CalculatorResult = {
  monthlyKwh: number;
  annualKwh: number;
  monthlyExpenditureUsd: number;
  annualExpenditureUsd: number;
  effectiveRateUsdPerKwh: number | null;
  energyUseIntensityKwhPerSqmYear: number | null;
  savingsScenarios: SavingsScenario[];
  auditReadinessScore: number;
  recommendedActions: RecommendedAction[];
  pursueProfessionalAudit: boolean;
  auditRationale: string;
  assumptions: string[];
  jurisdictionComparison: ReturnType<typeof compareJurisdictions>;
  suggestedAuditLevel: AuditLevelInfo;
  readingGuide: ReadingGuideItem[];
  auditBusinessCase: string[];
  endUseBreakdown: EndUseSlice[];
  conservationMeasures: ConservationMeasure[];
  auditLiteratureNote: string;
  currency: CurrencySummary;
  priorityInterventions: PriorityIntervention[];
  reductionTarget: ReductionTargetPlan;
};

const LOAD_INTENSITY: Record<MajorLoad, number> = {
  air_conditioning: 1.25,
  refrigeration: 1.1,
  lighting: 1.05,
  motors_pumps: 1.15,
  water_heating: 1.12,
  it_servers: 1.2,
  pool_equipment: 1.18,
};

const MEASURE_REDUCTION: Record<EfficiencyMeasure, number> = {
  led_lighting: 0.04,
  efficient_ac: 0.08,
  solar_pv: 0.12,
  building_controls: 0.06,
  power_factor_correction: 0.03,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function deriveMonthlyKwh(input: CalculatorInput): { kwh: number; assumptions: string[] } {
  const assumptions: string[] = [];

  if (input.monthlyKwh != null && input.monthlyKwh > 0) {
    assumptions.push('Monthly kWh taken from user entry (preferred).');
    return { kwh: input.monthlyKwh, assumptions };
  }

  if (input.monthlyExpenditureUsd <= 0) {
    assumptions.push('Insufficient spend data — using minimal placeholder consumption.');
    return { kwh: 0, assumptions };
  }

  const propertyFactor =
    input.propertyType === 'residential' ? 1 : input.propertyType === 'commercial' ? 1.35 : 1.2;
  const hoursFactor = clamp(input.weeklyOperatingHours / 40, 0.5, 2.5);
  const areaFactor =
    input.floorAreaSqm && input.floorAreaSqm > 0
      ? clamp(input.floorAreaSqm / 120, 0.6, 4)
      : 1;

  let inferredRate = 0.25;
  assumptions.push(
    `Monthly kWh inferred from spend using illustrative effective rate (~$${inferredRate.toFixed(2)}/kWh) — enter kWh for better accuracy.`
  );

  let kwh = (input.monthlyExpenditureUsd / inferredRate) * propertyFactor * hoursFactor * areaFactor;

  for (const load of input.majorLoads) {
    kwh *= LOAD_INTENSITY[load];
  }

  return { kwh: Math.round(kwh), assumptions };
}

function computeAuditReadinessScore(input: CalculatorInput, monthlyKwh: number): number {
  let score = 0;
  if (input.monthlyExpenditureUsd > 0) score += 20;
  if (input.monthlyKwh != null && input.monthlyKwh > 0) score += 15;
  if (input.floorAreaSqm != null && input.floorAreaSqm > 0) score += 10;
  if (input.weeklyOperatingHours > 0) score += 10;
  if (input.majorLoads.length >= 2) score += 15;
  if (input.efficiencyMeasures.length === 0) score += 10;
  if (input.monthlyExpenditureUsd >= 200) score += 10;
  if (input.propertyType !== 'residential') score += 10;
  if (monthlyKwh >= 800) score += 10;
  return clamp(score, 0, 100);
}

function buildSavingsScenarios(
  annualKwh: number,
  effectiveRate: number | null
): SavingsScenario[] {
  const rate = effectiveRate ?? 0.25;
  const base = [
    { label: 'low' as const, pctMin: 0.05, pctMax: 0.1, description: 'Behaviour and scheduling changes' },
    { label: 'medium' as const, pctMin: 0.1, pctMax: 0.18, description: 'Equipment upgrades and controls' },
    { label: 'high' as const, pctMin: 0.15, pctMax: 0.25, description: 'Comprehensive retrofit (illustrative upper band)' },
  ];

  return base.map((b) => {
    const minKwh = Math.round(annualKwh * b.pctMin);
    const maxKwh = Math.round(annualKwh * b.pctMax);
    return {
      label: b.label,
      annualKwhSaved: { min: minKwh, max: maxKwh },
      annualUsdSaved: {
        min: Math.round(minKwh * rate),
        max: Math.round(maxKwh * rate),
      },
      description: b.description,
    };
  });
}

function buildRecommendedActions(
  input: CalculatorInput,
  score: number
): RecommendedAction[] {
  const actions: RecommendedAction[] = [];

  if (!input.efficiencyMeasures.includes('led_lighting') && input.majorLoads.includes('lighting')) {
    actions.push({
      title: 'Lighting efficiency review',
      detail: 'Survey fixture types and operating hours; plan LED replacements where payback is favourable.',
      priority: 'high',
    });
  }

  if (input.majorLoads.includes('air_conditioning')) {
    actions.push({
      title: 'HVAC operating schedule audit',
      detail: 'Review setpoints, maintenance, and runtime — often a large share of Caribbean commercial loads.',
      priority: 'high',
    });
  }

  if (input.monthlyKwh == null || input.monthlyKwh <= 0) {
    actions.push({
      title: 'Obtain interval or monthly kWh data',
      detail: 'Use utility bills or a sub-meter to replace spend-only estimates.',
      priority: 'high',
    });
  }

  if (actions.length < 3 && score >= 60) {
    actions.push({
      title: 'Commission a professional energy audit',
      detail: 'On-site assessment to validate end-use breakdown and investment-grade savings ranges.',
      priority: 'medium',
    });
  }

  if (actions.length < 3) {
    actions.push({
      title: 'Compare tariff bands and operating hours',
      detail: 'Cross-check published utility tariffs and shift discretionary loads where safe.',
      priority: 'low',
    });
  }

  return actions.slice(0, 3);
}

export function runEnergyCalculator(input: CalculatorInput): CalculatorResult {
  const sanitized = {
    ...input,
    monthlyExpenditureUsd: clamp(input.monthlyExpenditureUsd, 0, 1_000_000),
    monthlyKwh:
      input.monthlyKwh != null ? clamp(input.monthlyKwh, 0, 1_000_000) : null,
    floorAreaSqm:
      input.floorAreaSqm != null ? clamp(input.floorAreaSqm, 0, 1_000_000) : null,
    weeklyOperatingHours: clamp(input.weeklyOperatingHours, 0, 168),
  };

  const { kwh: monthlyKwh, assumptions: kwhAssumptions } = deriveMonthlyKwh(sanitized);
  const annualKwh = monthlyKwh * 12;

  const monthlyExpenditureUsd = sanitized.monthlyExpenditureUsd;
  const annualExpenditureUsd = monthlyExpenditureUsd * 12;

  const effectiveRateUsdPerKwh =
    monthlyKwh > 0 && monthlyExpenditureUsd > 0
      ? monthlyExpenditureUsd / monthlyKwh
      : null;

  let measureReduction = 0;
  for (const m of sanitized.efficiencyMeasures) {
    measureReduction += MEASURE_REDUCTION[m];
  }
  measureReduction = clamp(measureReduction, 0, 0.35);

  const adjustedAnnualKwh = Math.round(annualKwh * (1 - measureReduction));

  const energyUseIntensityKwhPerSqmYear =
    sanitized.floorAreaSqm && sanitized.floorAreaSqm > 0
      ? Math.round((adjustedAnnualKwh / sanitized.floorAreaSqm) * 10) / 10
      : null;

  const auditReadinessScore = computeAuditReadinessScore(sanitized, monthlyKwh);
  const pursueProfessionalAudit = auditReadinessScore >= 55;
  const suggestedAuditLevel = suggestAuditLevel(sanitized, auditReadinessScore);
  const auditRationale = pursueProfessionalAudit
    ? `Your data supports a ${suggestedAuditLevel.name}. ${suggestedAuditLevel.summary}`
    : `Add kWh, floor area, or load detail to progress toward ${suggestedAuditLevel.name}. ${suggestedAuditLevel.summary}`;

  const rateForEcm = effectiveRateUsdPerKwh ?? 0.25;
  const endUseBreakdown = estimateEndUseBreakdown(adjustedAnnualKwh, sanitized.majorLoads);
  const conservationMeasures = buildConservationMeasures(
    sanitized,
    adjustedAnnualKwh,
    rateForEcm
  );
  const currencyInfo = getCurrencyInfo(sanitized.jurisdiction);
  const monthlyExpenditureLocal = usdToLocal(monthlyExpenditureUsd, sanitized.jurisdiction);
  const annualExpenditureLocal = usdToLocal(annualExpenditureUsd, sanitized.jurisdiction);
  const readingGuide = buildReadingGuide({
    monthlyKwh,
    annualKwh: adjustedAnnualKwh,
    monthlySpend: monthlyExpenditureUsd,
    annualSpend: annualExpenditureUsd,
    monthlySpendLocal: monthlyExpenditureLocal,
    annualSpendLocal: annualExpenditureLocal,
    currencyLabel: `${currencyInfo.symbol} ${currencyInfo.code}`,
    effectiveRate: effectiveRateUsdPerKwh,
    eui: energyUseIntensityKwhPerSqmYear,
    readinessScore: auditReadinessScore,
    auditLevel: suggestedAuditLevel,
  });
  const priorityInterventions = buildPriorityInterventions(
    sanitized,
    adjustedAnnualKwh,
    rateForEcm,
    sanitized.jurisdiction
  );
  const reductionTarget = buildReductionTargetPlan(
    monthlyExpenditureLocal,
    sanitized.jurisdiction
  );

  const assumptions = [
    ...kwhAssumptions,
    `Local currency display uses illustrative ${currencyInfo.code} rate (${currencyInfo.usdToLocalRate} per USD) — verify FX at payment time.`,
    'Savings scenarios and ECM paybacks show illustrative ranges — not guaranteed outcomes.',
    'Existing efficiency measures reduce inferred consumption proportionally using generic factors.',
    'Tariff comparisons use published reference rates where available; verify at utility sources.',
    AUDIT_LITERATURE_NOTE,
  ];

  if (measureReduction > 0) {
    assumptions.push(
      `Applied generic reduction (~${Math.round(measureReduction * 100)}%) for reported efficiency measures.`
    );
  }

  return {
    monthlyKwh,
    annualKwh: adjustedAnnualKwh,
    monthlyExpenditureUsd,
    annualExpenditureUsd,
    effectiveRateUsdPerKwh,
    energyUseIntensityKwhPerSqmYear,
    savingsScenarios: buildSavingsScenarios(adjustedAnnualKwh, effectiveRateUsdPerKwh),
    auditReadinessScore,
    recommendedActions: buildRecommendedActions(sanitized, auditReadinessScore),
    pursueProfessionalAudit,
    auditRationale,
    assumptions,
    jurisdictionComparison: compareJurisdictions(
      monthlyKwh,
      sanitized.jurisdiction,
      effectiveRateUsdPerKwh
    ),
    suggestedAuditLevel,
    readingGuide,
    auditBusinessCase: AUDIT_BUSINESS_CASE,
    endUseBreakdown,
    conservationMeasures,
    auditLiteratureNote: AUDIT_LITERATURE_NOTE,
    currency: {
      ...currencyInfo,
      monthlyExpenditureLocal,
      annualExpenditureLocal,
    },
    priorityInterventions,
    reductionTarget,
  };
}

function parseNumber(raw: string): number | null {
  const n = parseFloat(raw.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function normalizeToMonthly(value: number, billingDays: number): number {
  if (billingDays <= 0) return value;
  return Math.round((value * 30) / billingDays);
}

/** Parse bill text for kWh and amount — supports T&TEC-style commercial bills; user confirms values. */
export function parseBillText(text: string, jurisdiction?: JurisdictionId): ParsedBill {
  const hints: string[] = [];
  const normalized = text.replace(/\s+/g, ' ');

  const billingDaysMatch =
    normalized.match(/(\d+)\s*days?\b/i) ||
    normalized.match(/billing\s*period[^0-9]*(\d+)/i);
  const billingDays = billingDaysMatch ? parseInt(billingDaysMatch[1], 10) : null;

  let currencyCode: string | null = null;
  if (/\bttd\b|t\s*&\s*tec|trinidad/i.test(normalized)) currencyCode = 'TTD';
  else if (/\bjmd\b|jamaica\b/i.test(normalized)) currencyCode = 'JMD';
  else if (/\bbbd\b|bds\b|barbados\b/i.test(normalized)) currencyCode = 'BBD';
  else if (/\bxcd\b|ec\$|st\.?\s*kitts|skelec/i.test(normalized)) currencyCode = 'XCD';
  else if (/\busd\b/i.test(normalized)) currencyCode = 'USD';

  if (jurisdiction && !currencyCode) {
    currencyCode = getCurrencyInfo(jurisdiction).code;
  }

  let kwh: number | null = null;
  const kwhExplicit = normalized.match(/(\d[\d,]*\.?\d*)\s*kwh/i);
  if (kwhExplicit) {
    kwh = parseNumber(kwhExplicit[1]);
  } else {
    const unitsAtRate = normalized.match(
      /(\d[\d,]*\.?\d*)\s*units?\s*at\s*(?:a\s*)?rate/i
    );
    if (unitsAtRate) {
      kwh = parseNumber(unitsAtRate[1]);
      hints.push('Extracted kWh from T&TEC-style "units at rate" line.');
    } else {
      const difference = normalized.match(/difference[^0-9]*(\d[\d,]*\.?\d*)/i);
      if (difference) {
        kwh = parseNumber(difference[1]);
        hints.push('Extracted kWh from "Difference" column — confirm against your bill.');
      }
    }
  }

  let amountLocal: number | null = null;
  const payAmount =
    normalized.match(/please\s*pay[^$0-9]*\$?\s*(\d[\d,]*\.?\d*)/i) ||
    normalized.match(/amount\s*due[^$0-9]*\$?\s*(\d[\d,]*\.?\d*)/i) ||
    normalized.match(/total\s*current\s*billing[^$0-9]*\$?\s*(\d[\d,]*\.?\d*)/i);
  if (payAmount) {
    amountLocal = parseNumber(payAmount[1]);
    hints.push('Extracted amount due — confirm currency (TT$ on T&TEC bills).');
  } else {
    const amountMatch = normalized.match(
      /\$\s*(\d[\d,]*\.?\d*)|(\d[\d,]*\.?\d*)\s*(?:usd|ttd|tt\$|bds|bbd|jmd|xcd|ec\$)/i
    );
    if (amountMatch) {
      amountLocal = parseNumber(amountMatch[1] || amountMatch[2]);
    }
  }

  let monthlyKwh: number | null = null;
  let monthlyAmountLocal: number | null = null;
  if (billingDays && billingDays > 0 && billingDays !== 30) {
    if (kwh != null) {
      monthlyKwh = normalizeToMonthly(kwh, billingDays);
      hints.push(
        `Billing period is ${billingDays} days — normalized to ~${monthlyKwh} kWh/month.`
      );
    }
    if (amountLocal != null) {
      monthlyAmountLocal = normalizeToMonthly(amountLocal, billingDays);
      hints.push(
        `Normalized bill amount to ~${monthlyAmountLocal} per month (${currencyCode ?? 'local currency'}).`
      );
    }
  } else {
    monthlyKwh = kwh;
    monthlyAmountLocal = amountLocal;
  }

  let amountUsd: number | null = null;
  if (amountLocal != null && jurisdiction && currencyCode !== 'USD') {
    amountUsd = localToUsd(amountLocal, jurisdiction);
  } else if (amountLocal != null && currencyCode === 'USD') {
    amountUsd = amountLocal;
  }

  return {
    kwh,
    amountLocal,
    amountUsd,
    currencyCode,
    billingDays,
    monthlyKwh,
    monthlyAmountLocal,
    hints,
  };
}
