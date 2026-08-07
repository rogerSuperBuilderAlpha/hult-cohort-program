import type { ProfileKeyword, PublicOpportunitySeed } from '../bidmanager/types';

/** Generic capability vocabulary — tenants override via profile_keywords. */
export const DEFAULT_PROFILE_KEYWORDS: ProfileKeyword[] = [
  { term: 'solar PV', weight: 2, category: 'energy' },
  { term: 'battery energy storage', weight: 2, category: 'energy' },
  { term: 'energy efficiency', weight: 1.5, category: 'energy' },
  { term: 'energy audit', weight: 1.5, category: 'energy' },
  { term: 'net zero', weight: 1.5, category: 'climate' },
  { term: 'AFOLU', weight: 1, category: 'climate' },
  { term: 'climate finance', weight: 1, category: 'climate' },
  { term: 'MRV', weight: 1, category: 'climate' },
  { term: 'resilience', weight: 1, category: 'climate' },
  { term: 'feasibility study', weight: 1, category: 'consulting' },
  { term: 'owner\'s engineer', weight: 1, category: 'consulting' },
  { term: 'PMO', weight: 1, category: 'consulting' },
  { term: 'EPC', weight: 1.5, category: 'engineering' },
  { term: 'civil', weight: 1, category: 'engineering' },
  { term: 'structural', weight: 1, category: 'engineering' },
];

/** Public procurement records only — no CEAL Green corporate data. */
export const PUBLIC_TENDER_SEEDS: PublicOpportunitySeed[] = [
  {
    externalRef: 'IDB-2026-TT-0142',
    sourceId: 'src-idb-notices',
    title: 'Consultancy services for utility-scale solar PV feasibility — Trinidad and Tobago',
    issuingBody: 'Ministry of Energy and Energy Industries',
    funder: 'Inter-American Development Bank',
    country: 'Trinidad and Tobago',
    sector: 'Renewable energy',
    estimatedValueUsd: 850000,
    stage: 'rfp',
    publishedAt: '2026-07-15T00:00:00Z',
    submissionDeadline: '2026-09-20T23:59:00Z',
    rawText:
      'Feasibility study for 40MW solar PV including grid integration, battery energy storage options, and environmental screening. Mandatory: borrowing member firm registration.',
  },
  {
    externalRef: 'IDB-PLAN-BB-2026-08',
    sourceId: 'src-idb-plans',
    title: 'Barbados BESS and grid modernization — planned procurement',
    issuingBody: 'Barbados National Energy Policy Unit',
    funder: 'Inter-American Development Bank',
    country: 'Barbados',
    sector: 'Energy storage',
    estimatedValueUsd: 4200000,
    stage: 'plan',
    publishedAt: '2026-06-01T00:00:00Z',
    expectedBidDate: '2026-11-15',
    rawText:
      'Procurement plan entry: battery energy storage system integration with existing solar PV fleet. Expected RFP Q4 2026. Pre-positioning window open.',
  },
  {
    externalRef: 'CCREEE-2026-JM-003',
    sourceId: 'src-ccree',
    title: 'Caribbean renewable energy and energy efficiency technical assistance',
    issuingBody: 'CCREEE',
    funder: 'Caribbean Centre for Renewable Energy and Energy Efficiency',
    country: 'Jamaica',
    sector: 'Energy efficiency',
    estimatedValueUsd: 320000,
    stage: 'eoi',
    publishedAt: '2026-07-28T00:00:00Z',
    submissionDeadline: '2026-08-30T23:59:00Z',
    rawText:
      'Expression of interest for regional consultants supporting energy audit programmes and net zero roadmap development across SIDS.',
  },
  {
    externalRef: 'CEXP-2026-GY-011',
    sourceId: 'src-caribbean-export',
    title: 'Agro-processing energy efficiency and solar PV for export sectors',
    issuingBody: 'Caribbean Export Development Agency',
    funder: 'Caribbean Export',
    country: 'Guyana',
    sector: 'AFOLU / agro-processing',
    estimatedValueUsd: 275000,
    stage: 'rfp',
    publishedAt: '2026-07-01T00:00:00Z',
    submissionDeadline: '2026-08-25T23:59:00Z',
    rawText:
      'Design and supervise installation of solar PV and energy efficiency measures for agro-processing SMEs. Local content requirements apply.',
  },
  {
    externalRef: 'CDB-2026-LC-007',
    sourceId: 'src-cdb',
    title: 'Climate resilience infrastructure — owner\'s engineer services',
    issuingBody: 'Caribbean Development Bank',
    funder: 'CDB',
    country: 'Saint Lucia',
    sector: 'Resilience / civil',
    estimatedValueUsd: 1100000,
    stage: 'rfp',
    publishedAt: '2026-06-20T00:00:00Z',
    submissionDeadline: '2026-09-05T23:59:00Z',
    rawText:
      'Owner\'s engineer for coastal resilience works. Mandatory eligibility: CDB borrowing member country registration and professional indemnity insurance.',
  },
];
