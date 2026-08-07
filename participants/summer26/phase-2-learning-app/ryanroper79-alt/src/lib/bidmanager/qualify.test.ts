import { describe, expect, it } from 'vitest';
import { evaluateHardGates, qualifyOpportunity, scoreDimensions, computeRecommendation } from './qualify';
import type { QualDimension, QualifyInput, QualWeightConfig } from './types';

const defaultWeights: QualWeightConfig[] = [
  { dimension: 'relationship_depth', weightPct: 25 },
  { dimension: 'mandatory_criteria_fit', weightPct: 20 },
  { dimension: 'evidence_coverage', weightPct: 20 },
  { dimension: 'competitive_position', weightPct: 15 },
  { dimension: 'commercial_value', weightPct: 10 },
  { dimension: 'capacity', weightPct: 10 },
];

const fullScores: Record<QualDimension, number> = {
  relationship_depth: 80,
  mandatory_criteria_fit: 90,
  evidence_coverage: 75,
  competitive_position: 70,
  commercial_value: 65,
  capacity: 80,
};

function baseInput(overrides: Partial<QualifyInput> = {}): QualifyInput {
  return {
    opportunityId: 'opp-1',
    stage: 'rfp',
    submissionDeadline: new Date(Date.now() + 30 * 86400000).toISOString(),
    minTurnaroundDays: 14,
    memberCountryEligible: true,
    dimensionScores: fullScores,
    requirements: [
      { id: 'r1', text: 'IDB borrowing member registration', isMandatory: true, category: 'eligibility' },
    ],
    requirementEvidence: [{ requirementId: 'r1', coverage: 'full' }],
    evidence: [
      {
        id: 'e1',
        kind: 'certification',
        title: 'Professional indemnity insurance',
        expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
        verifiedAt: '2025-01-01',
        verifiedBy: 'admin',
      },
    ],
    weights: defaultWeights,
    bands: { bidMin: 70, partnerMin: 50 },
    now: new Date('2026-08-01'),
    ...overrides,
  };
}

describe('evaluateHardGates', () => {
  it('fails plan-stage opportunities', () => {
    const gate = evaluateHardGates(baseInput({ stage: 'plan' }));
    expect(gate.failed).toBe(true);
    expect(gate.reason).toMatch(/watchlist/i);
  });

  it('fails when mandatory requirement has gap coverage', () => {
    const gate = evaluateHardGates(
      baseInput({
        requirementEvidence: [{ requirementId: 'r1', coverage: 'gap' }],
      })
    );
    expect(gate.failed).toBe(true);
    expect(gate.reason).toMatch(/Mandatory eligibility/);
  });

  it('fails when evidence is expired', () => {
    const gate = evaluateHardGates(
      baseInput({
        evidence: [
          {
            id: 'e1',
            kind: 'insurance',
            title: 'PI insurance',
            expiresAt: '2020-01-01',
          },
        ],
      })
    );
    expect(gate.failed).toBe(true);
    expect(gate.reason).toMatch(/expired/);
  });
});

describe('qualifyOpportunity', () => {
  it('hard gate overrides a high dimension score', () => {
    const result = qualifyOpportunity(
      baseInput({
        memberCountryEligible: false,
        dimensionScores: { ...fullScores, relationship_depth: 95 },
      })
    );
    expect(result.hardGate.failed).toBe(true);
    expect(result.recommendation).toBe('no_bid');
    expect(result.weightedTotal).toBeGreaterThan(70);
  });

  it('recommends bid when score exceeds bid threshold', () => {
    const result = qualifyOpportunity(baseInput());
    expect(result.recommendation).toBe('bid');
    expect(result.weightedTotal).toBeGreaterThanOrEqual(70);
  });

  it('recommends partner_only in middle band', () => {
    const lowScores: Record<QualDimension, number> = {
      relationship_depth: 55,
      mandatory_criteria_fit: 60,
      evidence_coverage: 55,
      competitive_position: 50,
      commercial_value: 50,
      capacity: 55,
    };
    const result = qualifyOpportunity(baseInput({ dimensionScores: lowScores }));
    expect(result.recommendation).toBe('partner_only');
  });

  it('scoreDimensions respects weights', () => {
    const total = scoreDimensions(fullScores, defaultWeights);
    expect(total).toBeGreaterThan(70);
    expect(total).toBeLessThanOrEqual(100);
  });

  it('computeRecommendation uses band thresholds', () => {
    expect(computeRecommendation(75, { bidMin: 70, partnerMin: 50 })).toBe('bid');
    expect(computeRecommendation(55, { bidMin: 70, partnerMin: 50 })).toBe('partner_only');
    expect(computeRecommendation(40, { bidMin: 70, partnerMin: 50 })).toBe('no_bid');
  });
});
