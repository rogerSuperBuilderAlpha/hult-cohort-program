export type QualDimension =
  | 'relationship_depth'
  | 'mandatory_criteria_fit'
  | 'evidence_coverage'
  | 'competitive_position'
  | 'commercial_value'
  | 'capacity';

export type QualRecommendation = 'bid' | 'no_bid' | 'partner_only';

export type OpportunityStage = 'plan' | 'notice' | 'eoi' | 'rfp' | 'closed';

export type OpportunityStatus =
  | 'new'
  | 'screening'
  | 'no_bid'
  | 'bidding'
  | 'submitted'
  | 'shortlisted'
  | 'won'
  | 'lost'
  | 'cancelled'
  | 'no_award';

export type ProfileKeyword = {
  term: string;
  weight: number;
  category?: string;
};

export type OpportunityForRelevance = {
  title: string;
  sector?: string | null;
  rawText?: string | null;
  funder?: string | null;
  country?: string | null;
};

export type QualWeightConfig = {
  dimension: QualDimension;
  weightPct: number;
};

export type BandThresholds = {
  bidMin: number;
  partnerMin: number;
};

export type EvidenceItem = {
  id: string;
  kind: string;
  title: string;
  expiresAt?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
};

export type RequirementItem = {
  id: string;
  text: string;
  isMandatory: boolean;
  category: string;
};

export type RequirementEvidenceLink = {
  requirementId: string;
  coverage: 'full' | 'partial' | 'gap';
};

export type QualifyInput = {
  opportunityId: string;
  stage: OpportunityStage;
  submissionDeadline?: string | null;
  minTurnaroundDays: number;
  memberCountryEligible: boolean;
  dimensionScores: Record<QualDimension, number>;
  requirements: RequirementItem[];
  requirementEvidence: RequirementEvidenceLink[];
  evidence: EvidenceItem[];
  weights: QualWeightConfig[];
  bands: BandThresholds;
  now?: Date;
};

export type HardGateResult = {
  failed: boolean;
  reason?: string;
};

export type QualifyResult = {
  hardGate: HardGateResult;
  dimensionScores: Record<QualDimension, number>;
  weightedTotal: number;
  recommendation: QualRecommendation;
  memo: string[];
};

export type SourceRegistryEntry = {
  id: string;
  kind: 'api' | 'scrape' | 'manual';
  name: string;
  funder: string;
  baseUrl: string;
  tier: 1 | 2 | 3;
  countries: string[];
  pollFrequencyHours: number;
  lastPolledAt?: string | null;
  lastSuccessAt?: string | null;
  enabled: boolean;
  notes?: string;
};

export type PublicOpportunitySeed = {
  externalRef: string;
  sourceId: string;
  title: string;
  issuingBody: string;
  funder: string;
  country: string;
  sector: string;
  estimatedValueUsd: number;
  stage: OpportunityStage;
  publishedAt: string;
  submissionDeadline?: string;
  expectedBidDate?: string;
  rawText: string;
};

export type DashboardMetrics = {
  debriefCompletenessPct: number;
  bidsDeclined: number;
  winRateOnSubmittedPct: number;
  opportunitiesDiscovered: number;
  pendingDebrief: number;
};
