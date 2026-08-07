import { randomUUID } from 'crypto';
import { scoreRelevance } from '../bidmanager/relevance';
import { qualifyOpportunity } from '../bidmanager/qualify';
import { extractRequirementsFromText, type ExtractedRequirement } from '../bidmanager/extract-requirements';
import { buildGapReport, gapReportSummary, type RequirementEvidenceRow } from '../bidmanager/gap-report';
import { loadHardGateConfig, loadQualConfig } from '../bidmanager/config';
import { DEFAULT_PROFILE_KEYWORDS, PUBLIC_TENDER_SEEDS } from '../bidmanager/seed-public';
import { SOURCE_REGISTRY } from '../bidmanager/sources';
import type {
  DashboardMetrics,
  OpportunityStatus,
  QualDimension,
  QualRecommendation,
} from '../bidmanager/types';

export type StoredOpportunity = {
  id: string;
  orgId: string;
  sourceId: string;
  externalRef: string;
  title: string;
  issuingBody: string;
  funder: string;
  country: string;
  sector: string;
  estimatedValueUsd: number;
  stage: 'plan' | 'notice' | 'eoi' | 'rfp' | 'closed';
  publishedAt: string;
  submissionDeadline?: string;
  expectedBidDate?: string;
  rawText: string;
  relevanceScore: number;
  relevanceRationale: string;
  status: OpportunityStatus;
  discoveredAt: string;
  qualification?: {
    totalScore: number;
    recommendation: QualRecommendation;
    hardFailReason?: string;
    memo: string[];
    dimensionScores: Record<QualDimension, number>;
    decision?: QualRecommendation;
    overrideReason?: string;
    scoredAt: string;
  };
  outcome?: {
    result: 'won' | 'lost' | 'no_award' | 'cancelled';
    debriefComplete: boolean;
  };
};

export type StoredEvent = {
  id: string;
  orgId: string;
  userId: string;
  eventName: string;
  payload: Record<string, unknown>;
  sessionId: string;
  emittedAt: string;
};

export type StoredRequirement = Omit<ExtractedRequirement, 'humanVerified'> & {
  id: string;
  opportunityId: string;
  humanVerified: boolean;
  verifiedBy?: string;
};

type StoreState = {
  orgId: string;
  orgName: string;
  opportunities: Map<string, StoredOpportunity>;
  requirements: Map<string, StoredRequirement>;
  requirementEvidence: RequirementEvidenceRow[];
  evidence: never[];
  configSeeded: boolean;
  events: StoredEvent[];
  sourcePollState: Map<string, { lastPolledAt?: string; lastSuccessAt?: string }>;
};

const g = globalThis as unknown as { __bidStore?: StoreState };

function getState(): StoreState {
  if (!g.__bidStore) {
    const orgId = 'org-public-demo';
    g.__bidStore = {
      orgId,
      orgName: 'Demo Organization',
      opportunities: new Map(),
      requirements: new Map(),
      requirementEvidence: [],
      evidence: [],
      configSeeded: true,
      events: [],
      sourcePollState: new Map(),
    };
    seedConfigTables();
    seedPublicOpportunities(g.__bidStore);
  }
  return g.__bidStore;
}

function seedConfigTables() {
  void loadQualConfig();
  void loadHardGateConfig();
}

function attachRequirements(state: StoreState, opportunityId: string, rawText: string) {
  const extracted = extractRequirementsFromText(rawText);
  for (const req of extracted) {
    const id = randomUUID();
    state.requirements.set(id, {
      ...req,
      id,
      opportunityId,
      humanVerified: false,
    });
    state.requirementEvidence.push({
      requirementId: id,
      coverage: 'gap',
      note: 'No verified evidence in public demo library',
    });
  }
}

function seedPublicOpportunities(state: StoreState) {
  const config = loadQualConfig();
  for (const seed of PUBLIC_TENDER_SEEDS) {
    const rel = scoreRelevance(
      { title: seed.title, sector: seed.sector, rawText: seed.rawText, funder: seed.funder, country: seed.country },
      DEFAULT_PROFILE_KEYWORDS
    );
    const id = randomUUID();
    state.opportunities.set(id, {
      id,
      orgId: state.orgId,
      sourceId: seed.sourceId,
      externalRef: seed.externalRef,
      title: seed.title,
      issuingBody: seed.issuingBody,
      funder: seed.funder,
      country: seed.country,
      sector: seed.sector,
      estimatedValueUsd: seed.estimatedValueUsd,
      stage: seed.stage,
      publishedAt: seed.publishedAt,
      submissionDeadline: seed.submissionDeadline,
      expectedBidDate: seed.expectedBidDate,
      rawText: seed.rawText,
      relevanceScore: rel.score,
      relevanceRationale: rel.rationale,
      status: rel.score >= config.relevanceThreshold ? 'screening' : 'new',
      discoveredAt: new Date().toISOString(),
    });
    attachRequirements(state, id, seed.rawText);
  }
}

export function getOrg() {
  const s = getState();
  return { id: s.orgId, name: s.orgName };
}

export function listOpportunities(filter?: { stage?: string; status?: string }) {
  let items = [...getState().opportunities.values()];
  if (filter?.stage) items = items.filter((o) => o.stage === filter.stage);
  if (filter?.status) items = items.filter((o) => o.status === filter.status);
  return items.sort((a, b) => b.discoveredAt.localeCompare(a.discoveredAt));
}

export function getOpportunity(id: string) {
  return getState().opportunities.get(id);
}

export function listSources() {
  const state = getState();
  return SOURCE_REGISTRY.map((src) => {
    const poll = state.sourcePollState.get(src.id);
    return {
      ...src,
      lastPolledAt: poll?.lastPolledAt ?? null,
      lastSuccessAt: poll?.lastSuccessAt ?? null,
    };
  });
}

export function recordSourcePoll(sourceId: string, success: boolean) {
  const now = new Date().toISOString();
  const state = getState();
  const prev = state.sourcePollState.get(sourceId) ?? {};
  state.sourcePollState.set(sourceId, {
    lastPolledAt: now,
    lastSuccessAt: success ? now : prev.lastSuccessAt,
  });
}

export function appendEvent(entry: Omit<StoredEvent, 'id' | 'emittedAt'>) {
  const state = getState();
  state.events.push({
    ...entry,
    id: randomUUID(),
    emittedAt: new Date().toISOString(),
  });
}

export function saveQualification(
  opportunityId: string,
  input: {
    dimensionScores: Record<QualDimension, number>;
    memberCountryEligible: boolean;
    decision?: QualRecommendation;
    overrideReason?: string;
  }
) {
  const opp = getState().opportunities.get(opportunityId);
  if (!opp) throw new Error('Opportunity not found');

  const config = loadQualConfig();
  const result = qualifyOpportunity({
    opportunityId,
    stage: opp.stage,
    submissionDeadline: opp.submissionDeadline,
    minTurnaroundDays: config.minTurnaroundDays,
    memberCountryEligible: input.memberCountryEligible,
    dimensionScores: input.dimensionScores,
    requirements: [
      {
        id: 'req-eligibility',
        text: `${opp.funder} borrowing member / registration requirement`,
        isMandatory: true,
        category: 'eligibility',
      },
    ],
    requirementEvidence: [
      {
        requirementId: 'req-eligibility',
        coverage: input.memberCountryEligible ? 'full' : 'gap',
      },
    ],
    evidence: [],
    weights: config.weights,
    bands: config.bands,
  });

  const decision = input.decision ?? result.recommendation;
  opp.qualification = {
    totalScore: result.weightedTotal,
    recommendation: result.recommendation,
    hardFailReason: result.hardGate.reason,
    memo: result.memo,
    dimensionScores: result.dimensionScores,
    decision,
    overrideReason: input.overrideReason,
    scoredAt: new Date().toISOString(),
  };
  opp.status =
    decision === 'no_bid' ? 'no_bid' : decision === 'partner_only' ? 'screening' : 'bidding';

  getState().opportunities.set(opportunityId, opp);
  return { opportunity: opp, result };
}

export function createManualOpportunity(data: {
  title: string;
  funder: string;
  country: string;
  sector: string;
  stage: StoredOpportunity['stage'];
  estimatedValueUsd: number;
  rawText: string;
  submissionDeadline?: string;
  expectedBidDate?: string;
}) {
  const state = getState();
  const config = loadQualConfig();
  const rel = scoreRelevance(
    { title: data.title, sector: data.sector, rawText: data.rawText, funder: data.funder, country: data.country },
    DEFAULT_PROFILE_KEYWORDS
  );
  const id = randomUUID();
  const opp: StoredOpportunity = {
    id,
    orgId: state.orgId,
    sourceId: 'src-manual',
    externalRef: `MAN-${Date.now()}`,
    title: data.title,
    issuingBody: 'Manual entry',
    funder: data.funder,
    country: data.country,
    sector: data.sector,
    estimatedValueUsd: data.estimatedValueUsd,
    stage: data.stage,
    publishedAt: new Date().toISOString(),
    submissionDeadline: data.submissionDeadline,
    expectedBidDate: data.expectedBidDate,
    rawText: data.rawText,
    relevanceScore: rel.score,
    relevanceRationale: rel.rationale,
    status: 'new',
    discoveredAt: new Date().toISOString(),
  };
  if (rel.score >= config.relevanceThreshold && data.stage !== 'plan') {
    opp.status = 'screening';
  }
  state.opportunities.set(id, opp);
  attachRequirements(state, id, data.rawText);
  return opp;
}

export function listRequirements(opportunityId: string) {
  return [...getState().requirements.values()].filter((r) => r.opportunityId === opportunityId);
}

export function listVerificationQueue() {
  return [...getState().requirements.values()].filter((r) => !r.humanVerified);
}

/** Only UI verification path may set humanVerified true. */
export function verifyRequirement(requirementId: string, verifiedBy: string) {
  const req = getState().requirements.get(requirementId);
  if (!req) throw new Error('Requirement not found');
  req.humanVerified = true;
  req.verifiedBy = verifiedBy;
  getState().requirements.set(requirementId, req);
  return req;
}

export function getGapReportForOpportunity(opportunityId: string) {
  const reqs = listRequirements(opportunityId);
  const links = getState().requirementEvidence.filter((l) =>
    reqs.some((r) => r.id === l.requirementId)
  );
  const rows = buildGapReport(reqs, links);
  return { rows, summary: gapReportSummary(rows) };
}

export function overrideStats() {
  const opps = [...getState().opportunities.values()];
  const overrides = opps.filter(
    (o) => o.qualification?.overrideReason && o.qualification.overrideReason.length > 0
  );
  return {
    total: overrides.length,
    forcedBid: overrides.filter((o) => o.qualification?.decision === 'bid').length,
    forcedNoBid: overrides.filter((o) => o.qualification?.decision === 'no_bid').length,
  };
}

export function dashboardMetrics(): DashboardMetrics {
  const opps = [...getState().opportunities.values()];
  const decided = opps.filter((o) => o.qualification?.decision);
  const declined = decided.filter((o) => o.qualification?.decision === 'no_bid').length;
  const submitted = opps.filter((o) => ['submitted', 'won', 'lost'].includes(o.status));
  const won = opps.filter((o) => o.status === 'won' || o.outcome?.result === 'won').length;
  const withOutcome = opps.filter((o) => o.outcome);
  const debriefComplete = withOutcome.filter((o) => o.outcome?.debriefComplete).length;

  return {
    debriefCompletenessPct:
      withOutcome.length > 0 ? Math.round((debriefComplete / withOutcome.length) * 100) : 0,
    bidsDeclined: declined,
    winRateOnSubmittedPct:
      submitted.length > 0 ? Math.round((won / submitted.length) * 1000) / 10 : 0,
    opportunitiesDiscovered: opps.length,
    pendingDebrief: withOutcome.filter((o) => !o.outcome?.debriefComplete).length,
  };
}

/** Simulate Finder poll — returns newly screened count. */
export function runFinderPoll(): { screened: number; discovered: number } {
  const state = getState();
  let screened = 0;
  for (const src of SOURCE_REGISTRY.filter((s) => s.enabled && s.kind !== 'manual')) {
    recordSourcePoll(src.id, true);
  }
  for (const opp of state.opportunities.values()) {
    if (opp.status === 'new' && opp.relevanceScore >= loadQualConfig().relevanceThreshold) {
      opp.status = 'screening';
      screened++;
    }
  }
  return { screened, discovered: state.opportunities.size };
}

export function _resetStoreForTests() {
  delete g.__bidStore;
}
