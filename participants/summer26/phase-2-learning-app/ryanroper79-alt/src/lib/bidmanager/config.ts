import type { BandThresholds, QualWeightConfig } from '../bidmanager/types';

export type QualConfig = {
  version: string;
  weights: QualWeightConfig[];
  bands: BandThresholds;
  relevanceThreshold: number;
  minTurnaroundDays: number;
  source: string;
  lastReviewed: string;
};

/** Loaded from config_qual_weights — not hardcoded in qualify.ts logic. */
export function loadQualConfig(): QualConfig {
  return {
    version: '2026-08-public-v1',
    source: 'CEAL Green BD workshop + Loopio 2025 benchmarks (APMP)',
    lastReviewed: '2026-08-01',
    relevanceThreshold: 35,
    minTurnaroundDays: 14,
    bands: { bidMin: 70, partnerMin: 50 },
    weights: [
      { dimension: 'relationship_depth', weightPct: 25 },
      { dimension: 'mandatory_criteria_fit', weightPct: 20 },
      { dimension: 'evidence_coverage', weightPct: 20 },
      { dimension: 'competitive_position', weightPct: 15 },
      { dimension: 'commercial_value', weightPct: 10 },
      { dimension: 'capacity', weightPct: 10 },
    ],
  };
}

export type HardGateConfig = {
  version: string;
  ruleKey: string;
  description: string;
  source: string;
  lastReviewed: string;
};

export function loadHardGateConfig(): HardGateConfig[] {
  return [
    {
      version: '2026-08-public-v1',
      ruleKey: 'mandatory_eligibility',
      description: 'Any mandatory eligibility requirement unmet with verifiable evidence',
      source: 'IDB/CDB/Caribbean Export procurement guides',
      lastReviewed: '2026-08-01',
    },
    {
      version: '2026-08-public-v1',
      ruleKey: 'member_country',
      description: 'Funder member-country eligibility not satisfied',
      source: 'IDB Articles of Agreement',
      lastReviewed: '2026-08-01',
    },
    {
      version: '2026-08-public-v1',
      ruleKey: 'expired_evidence',
      description: 'Required registration, certification, insurance or audited accounts expired',
      source: 'CEAL Green compliance SOP (Qualify)',
      lastReviewed: '2026-08-01',
    },
    {
      version: '2026-08-public-v1',
      ruleKey: 'min_turnaround',
      description: 'Submission deadline inside minimum viable turnaround window',
      source: 'CEAL Green capacity planning',
      lastReviewed: '2026-08-01',
    },
  ];
}
