import { describe, expect, it } from 'vitest';
import { areaToSqm, localToUsd, usdToLocal } from '@/lib/energy/currency';
import { buildPriorityInterventions, buildReductionTargetPlan } from '@/lib/energy/interventions';
import { runEnergyCalculator, parseBillText } from '@/lib/energy/calculator';
import { compareJurisdictions } from '@/lib/energy/tariffs';
import { estimateLightingRetrofit } from '@/lib/energy/lighting';

describe('currency', () => {
  it('converts TTD to USD and back', () => {
    const ttd = 868.76;
    const usd = localToUsd(ttd, 'trinidad_tobago');
    expect(usd).toBeCloseTo(ttd / 6.78, 1);
    expect(usdToLocal(usd, 'trinidad_tobago')).toBeCloseTo(ttd, 0);
  });

  it('converts floor area ft² to m²', () => {
    expect(areaToSqm(1076.39, 'sqft')).toBeCloseTo(100, 0);
  });
});

describe('parseBillText T&TEC', () => {
  const ttecSample = `1627.00 units at a Rate of $0.4150 per unit
Billing Period 62 Days
Please Pay This Amount 868.76
T&TEC Commercial B`;

  it('extracts kWh, amount, and normalizes to monthly', () => {
    const parsed = parseBillText(ttecSample, 'trinidad_tobago');
    expect(parsed.kwh).toBe(1627);
    expect(parsed.amountLocal).toBe(868.76);
    expect(parsed.currencyCode).toBe('TTD');
    expect(parsed.billingDays).toBe(62);
    expect(parsed.monthlyKwh).toBe(Math.round((1627 * 30) / 62));
    expect(parsed.monthlyAmountLocal).toBeCloseTo((868.76 * 30) / 62, 0);
    expect(parsed.hints.length).toBeGreaterThan(0);
  });
});

describe('runEnergyCalculator', () => {
  it('prefers user-entered kWh over inferred values', () => {
    const result = runEnergyCalculator({
      jurisdiction: 'jamaica',
      propertyType: 'residential',
      monthlyExpenditureUsd: 500,
      monthlyKwh: 600,
      floorAreaSqm: 100,
      weeklyOperatingHours: 40,
      majorLoads: ['air_conditioning'],
      efficiencyMeasures: [],
    });
    expect(result.monthlyKwh).toBe(600);
    expect(result.effectiveRateUsdPerKwh).toBeCloseTo(500 / 600, 2);
    expect(result.currency.code).toBe('JMD');
    expect(result.priorityInterventions.length).toBe(3);
    expect(result.reductionTarget.targetPct).toBe(25);
  });

  it('handles missing kWh safely', () => {
    const result = runEnergyCalculator({
      jurisdiction: 'trinidad_tobago',
      propertyType: 'commercial',
      monthlyExpenditureUsd: 1000,
      monthlyKwh: null,
      floorAreaSqm: null,
      weeklyOperatingHours: 60,
      majorLoads: [],
      efficiencyMeasures: ['led_lighting'],
    });
    expect(result.monthlyKwh).toBeGreaterThan(0);
    expect(result.assumptions.some((a) => a.includes('inferred'))).toBe(true);
    expect(result.currency.code).toBe('TTD');
  });

  it('returns audit readiness score in range', () => {
    const result = runEnergyCalculator({
      jurisdiction: 'barbados',
      propertyType: 'institutional',
      monthlyExpenditureUsd: 3000,
      monthlyKwh: 1200,
      floorAreaSqm: 500,
      weeklyOperatingHours: 80,
      majorLoads: ['air_conditioning', 'lighting', 'refrigeration'],
      efficiencyMeasures: [],
    });
    expect(result.auditReadinessScore).toBeGreaterThanOrEqual(0);
    expect(result.auditReadinessScore).toBeLessThanOrEqual(100);
    expect(result.recommendedActions).toHaveLength(3);
    expect(result.conservationMeasures.some((m) => m.id === 'refrigeration')).toBe(true);
  });
});

describe('interventions', () => {
  it('builds AC, refrigeration, and sensor cards', () => {
    const items = buildPriorityInterventions(
      {
        jurisdiction: 'trinidad_tobago',
        propertyType: 'commercial',
        monthlyExpenditureUsd: 128,
        monthlyKwh: 787,
        floorAreaSqm: 200,
        weeklyOperatingHours: 60,
        majorLoads: ['air_conditioning', 'refrigeration'],
        efficiencyMeasures: [],
      },
      9444,
      0.128,
      'trinidad_tobago'
    );
    expect(items.map((i) => i.id)).toEqual(['ac_upgrade', 'refrigeration', 'remote_sensors']);
    expect(items[0].estimatedMonthlySavingsLocal.max).toBeGreaterThan(0);
  });

  it('plans 25% reduction in local currency', () => {
    const plan = buildReductionTargetPlan(420, 'trinidad_tobago');
    expect(plan.monthlySavingsLocal).toBe(105);
    expect(plan.phasedSteps).toHaveLength(3);
    expect(plan.phasedSteps[2].cumulativeReductionPct).toBe(25);
  });
});

describe('parseBillText generic', () => {
  it('extracts kWh from pasted bill text', () => {
    const parsed = parseBillText('Current reading 450 kWh Total $130.50 USD');
    expect(parsed.kwh).toBe(450);
    expect(parsed.amountLocal).toBe(130.5);
  });
});

describe('compareJurisdictions', () => {
  it('marks cheapest jurisdiction when rates available', () => {
    const rows = compareJurisdictions(500, 'jamaica', 0.29);
    const cheapest = rows.filter((r) => r.isCheapest);
    expect(cheapest.length).toBeGreaterThanOrEqual(1);
    expect(cheapest[0].estimatedMonthlyUsd).not.toBeNull();
  });
});

describe('estimateLightingRetrofit', () => {
  it('computes payback for incandescent to LED', () => {
    const result = estimateLightingRetrofit({
      bulbCount: 20,
      bulbType: 'incandescent_60w',
      hoursPerDay: 5,
      effectiveRateUsdPerKwh: 0.25,
    });
    expect(result.annualKwhSaved).toBeGreaterThan(0);
    expect(result.paybackMonths.max).toBeGreaterThan(0);
  });
});
