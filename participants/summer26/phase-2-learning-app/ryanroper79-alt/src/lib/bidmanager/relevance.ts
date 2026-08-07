import type { OpportunityForRelevance, ProfileKeyword } from './types';

export type RelevanceResult = {
  score: number;
  rationale: string;
  matchedTerms: string[];
};

/**
 * Weighted keyword and sector match — triage filter only, not a bid decision.
 */
export function scoreRelevance(
  opportunity: OpportunityForRelevance,
  profileKeywords: ProfileKeyword[]
): RelevanceResult {
  if (profileKeywords.length === 0) {
    return { score: 0, rationale: 'No profile keywords configured.', matchedTerms: [] };
  }

  const haystack = [
    opportunity.title,
    opportunity.sector ?? '',
    opportunity.funder ?? '',
    opportunity.country ?? '',
    opportunity.rawText ?? '',
  ]
    .join(' ')
    .toLowerCase();

  const matchedTerms: string[] = [];
  let weightedHits = 0;
  let maxPossible = 0;

  for (const kw of profileKeywords) {
    const term = kw.term.toLowerCase().trim();
    if (!term) continue;
    maxPossible += kw.weight;
    if (haystack.includes(term)) {
      weightedHits += kw.weight;
      matchedTerms.push(kw.term);
    }
  }

  const score = maxPossible > 0 ? Math.round((weightedHits / maxPossible) * 100) : 0;
  const rationale =
    matchedTerms.length > 0
      ? `Matched ${matchedTerms.length} capability term(s): ${matchedTerms.slice(0, 5).join(', ')}${matchedTerms.length > 5 ? '…' : ''}.`
      : 'No capability vocabulary match — review manually before qualifying.';

  return { score, rationale, matchedTerms };
}

export function relevancePassesThreshold(score: number, threshold: number): boolean {
  return score >= threshold;
}
