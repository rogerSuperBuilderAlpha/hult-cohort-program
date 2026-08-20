import { describe, expect, it } from 'vitest';
import {
  suggestAuditLevel,
  estimateEndUseBreakdown,
  buildConservationMeasures,
} from '@/lib/energy/audit-spec';

describe('suggestAuditLevel', () => {
  it('suggests Level 1 for minimal residential data', () => {
    const level = suggestAuditLevel(
      {
        jurisdiction: 'jamaica',
        propertyType: 'residential',
        monthlyExpenditureUsd: 150,
        monthlyKwh: 300,
        floorAreaSqm: 80,
        weeklyOperatingHours: 20,
        majorLoads: [],
        efficiencyMeasures: [],
      },
      40
    );
    expect(level.level).toBe(1);
  });

  it('suggests Level 2 for commercial mid-size sites', () => {
    const level = suggestAuditLevel(
      {
        jurisdiction: 'barbados',
        propertyType: 'commercial',
        monthlyExpenditureUsd: 800,
        monthlyKwh: 900,
        floorAreaSqm: 400,
        weeklyOperatingHours: 60,
        majorLoads: ['air_conditioning', 'lighting'],
        efficiencyMeasures: [],
      },
      65
    );
    expect(level.level).toBe(2);
    expect(level.deliverables.length).toBeGreaterThan(0);
  });
});

describe('estimateEndUseBreakdown', () => {
  it('allocates shares across selected loads', () => {
    const rows = estimateEndUseBreakdown(12000, ['air_conditioning', 'lighting']);
    expect(rows).toHaveLength(2);
    expect(rows.reduce((s, r) => s + r.sharePct, 0)).toBe(100);
  });
});

describe('buildConservationMeasures', () => {
  it('includes payback for operational ECM', () => {
    const measures = buildConservationMeasures(
      {
        jurisdiction: 'jamaica',
        propertyType: 'commercial',
        monthlyExpenditureUsd: 1000,
        monthlyKwh: 800,
        floorAreaSqm: 200,
        weeklyOperatingHours: 50,
        majorLoads: ['lighting'],
        efficiencyMeasures: [],
      },
      9600,
      0.25
    );
    const ops = measures.find((m) => m.id === 'operational');
    expect(ops).toBeDefined();
    expect(ops!.paybackMonths.max).toBeGreaterThan(0);
    expect(ops!.estimatedAnnualUsdSaved.max).toBeGreaterThan(0);
  });
});
