import type {
  EvidenceItem,
  HardGateResult,
  QualDimension,
  QualRecommendation,
  QualWeightConfig,
  QualifyInput,
  QualifyResult,
  RequirementEvidenceLink,
  RequirementItem,
} from './types';

function daysUntil(deadline: string, now: Date): number {
  const end = new Date(deadline).getTime();
  return Math.floor((end - now.getTime()) / (1000 * 60 * 60 * 24));
}

function mandatoryRequirementsMet(
  requirements: RequirementItem[],
  links: RequirementEvidenceLink[]
): { met: boolean; unmet: string[] } {
  const mandatory = requirements.filter((r) => r.isMandatory);
  const unmet: string[] = [];
  for (const req of mandatory) {
    const link = links.find((l) => l.requirementId === req.id);
    if (!link || link.coverage === 'gap') {
      unmet.push(req.text);
    }
  }
  return { met: unmet.length === 0, unmet };
}

function expiredEvidence(evidence: EvidenceItem[], now: Date): string[] {
  return evidence
    .filter((e) => {
      if (!e.expiresAt) return false;
      return new Date(e.expiresAt).getTime() < now.getTime();
    })
    .map((e) => e.title);
}

/** Hard gates override score entirely — evaluated first. */
export function evaluateHardGates(input: QualifyInput): HardGateResult {
  const now = input.now ?? new Date();

  if (input.stage === 'plan') {
    return { failed: true, reason: 'Procurement plan — watchlist only, not qualified yet.' };
  }

  if (!input.memberCountryEligible) {
    return { failed: true, reason: 'Funder member-country eligibility not satisfied.' };
  }

  const mandatory = mandatoryRequirementsMet(input.requirements, input.requirementEvidence);
  if (!mandatory.met) {
    return {
      failed: true,
      reason: `Mandatory eligibility unmet: ${mandatory.unmet.slice(0, 2).join('; ')}`,
    };
  }

  const expired = expiredEvidence(input.evidence, now);
  if (expired.length > 0) {
    return {
      failed: true,
      reason: `Required evidence expired: ${expired.slice(0, 2).join('; ')}`,
    };
  }

  if (input.submissionDeadline) {
    const days = daysUntil(input.submissionDeadline, now);
    if (days < input.minTurnaroundDays) {
      return {
        failed: true,
        reason: `Submission deadline in ${days} days — below minimum viable turnaround (${input.minTurnaroundDays} days).`,
      };
    }
  }

  return { failed: false };
}

/** Weighted dimension total — weights must sum to 100 (caller validates via config). */
export function scoreDimensions(
  dimensionScores: Record<QualDimension, number>,
  weights: QualWeightConfig[]
): number {
  let total = 0;
  for (const w of weights) {
    const raw = dimensionScores[w.dimension] ?? 0;
    const clamped = Math.max(0, Math.min(100, raw));
    total += (clamped * w.weightPct) / 100;
  }
  return Math.round(total * 10) / 10;
}

export function computeRecommendation(
  totalScore: number,
  bands: { bidMin: number; partnerMin: number }
): QualRecommendation {
  if (totalScore >= bands.bidMin) return 'bid';
  if (totalScore >= bands.partnerMin) return 'partner_only';
  return 'no_bid';
}

export function qualifyOpportunity(input: QualifyInput): QualifyResult {
  const hardGate = evaluateHardGates(input);
  const dimensionScores = { ...input.dimensionScores };
  const weightedTotal = scoreDimensions(dimensionScores, input.weights);

  const memo: string[] = [];

  if (hardGate.failed) {
    memo.push(`HARD GATE: ${hardGate.reason}`);
    memo.push('Recommendation forced to no-bid regardless of dimension scores.');
    return {
      hardGate,
      dimensionScores,
      weightedTotal,
      recommendation: 'no_bid',
      memo,
    };
  }

  const recommendation = computeRecommendation(weightedTotal, input.bands);
  memo.push(`Weighted score: ${weightedTotal}/100`);
  memo.push(`Recommendation: ${recommendation.replace('_', ' ')}`);

  const rel = dimensionScores.relationship_depth;
  if (rel < 40) {
    memo.push('Relationship depth below 40 — cold-bid risk (benchmark: ~15% vs 60–90% warm).');
  }

  return { hardGate, dimensionScores, weightedTotal, recommendation, memo };
}
