import { listRfpCases, type RfpCase } from './rfp-cases';

export type PortfolioStats = {
  totalSubmitted: number;
  won: number;
  lost: number;
  winRatePct: number;
  targetWinRatePct: number;
  gapToTargetPct: number;
};

/** Firm-wide stats including historical submissions beyond the learning set. */
export function portfolioStats(): PortfolioStats {
  const historicalSubmitted = 48;
  const historicalWon = 4;
  const winRatePct = Math.round((historicalWon / historicalSubmitted) * 1000) / 10;
  const targetWinRatePct = 10;
  return {
    totalSubmitted: historicalSubmitted,
    won: historicalWon,
    lost: historicalSubmitted - historicalWon,
    winRatePct,
    targetWinRatePct,
    gapToTargetPct: Math.round((targetWinRatePct - winRatePct) * 10) / 10,
  };
}

export function learningSetStats(cases: RfpCase[] = listRfpCases()): PortfolioStats {
  const won = cases.filter((c) => c.outcome === 'won').length;
  const total = cases.length;
  const winRatePct = total ? Math.round((won / total) * 1000) / 10 : 0;
  return {
    totalSubmitted: total,
    won,
    lost: total - won,
    winRatePct,
    targetWinRatePct: 10,
    gapToTargetPct: Math.round((10 - winRatePct) * 10) / 10,
  };
}

export type WinPattern = {
  theme: string;
  seenInWins: number;
  recommendation: string;
};

export function extractWinPatterns(): WinPattern[] {
  const wins = listRfpCases().filter((c) => c.outcome === 'won');
  const themes: Record<string, { count: number; rec: string }> = {
    'Compliance mapping': {
      count: 0,
      rec: 'Auto-map every RFP evaluation criterion to a labeled response section before agent draft.',
    },
    'Local / equity partners': {
      count: 0,
      rec: 'Name community, workforce, or Justice40 partners in executive summary.',
    },
    'Risk-reducing commercial terms': {
      count: 0,
      rec: 'Use banded pricing, discovery sprints, or M&V guarantees instead of bare lump-sum.',
    },
    'Agent-assisted quality': {
      count: 0,
      rec: 'Attach agent red-team QA memo and reuse anonymized winning section library.',
    },
    'Buyer-specific tailoring': {
      count: 0,
      rec: 'Quote issuer disclosure language (10-K, climate plan, scoring rubric) in opening bullets.',
    },
  };

  for (const win of wins) {
    const text = [...win.strategicInclusions, ...win.outcomeAnalysis].join(' ').toLowerCase();
    if (/nevi|compliance|checklist|mapped/.test(text)) themes['Compliance mapping'].count++;
    if (/local|justice40|community|workforce|equity/.test(text)) themes['Local / equity partners'].count++;
    if (/band|contingency|discovery|m&v|guarantee/.test(text)) themes['Risk-reducing commercial terms'].count++;
    if (/agent|template|red-team|library/.test(text)) themes['Agent-assisted quality'].count++;
    if (/csrd|10-k|scoring|rubric|issuer/.test(text)) themes['Buyer-specific tailoring'].count++;
  }

  return Object.entries(themes)
    .filter(([, v]) => v.count > 0)
    .map(([theme, v]) => ({
      theme,
      seenInWins: v.count,
      recommendation: v.rec,
    }))
    .sort((a, b) => b.seenInWins - a.seenInWins);
}

export type LossLesson = {
  theme: string;
  seenInLosses: number;
  avoid: string;
};

export function extractLossLessons(): LossLesson[] {
  const losses = listRfpCases().filter((c) => c.outcome === 'lost');
  const themes: Record<string, { count: number; avoid: string }> = {
    'Missing compliance appendices': {
      count: 0,
      avoid: 'Never submit federal or healthcare RFPs without Section 508, Buy America, or ICRA appendices.',
    },
    'Pricing structure mismatch': {
      count: 0,
      avoid: 'Validate fee model (fixed vs T&M vs cap) against RFP instructions before agent finalizes.',
    },
    'Weak past performance fit': {
      count: 0,
      avoid: 'Only cite references matching sector, scale, and building/program type.',
    },
    'No quantified value': {
      count: 0,
      avoid: 'Quantify resilience, savings, or outage-avoidance value — avoid purely qualitative claims.',
    },
  };

  for (const loss of losses) {
    const text = [...loss.outcomeAnalysis, ...loss.agentTakeaways].join(' ').toLowerCase();
    if (/508|buy america|icra|m&v|cyber|nevi|nepa/.test(text)) themes['Missing compliance appendices'].count++;
    if (/lump-sum|t&m|budget cap|pricing|fixed/.test(text)) themes['Pricing structure mismatch'].count++;
    if (/reference|outpatient|acute|scale|comparable/.test(text)) themes['Weak past performance fit'].count++;
    if (/qualitative|quantif|outage|resilience value/.test(text)) themes['No quantified value'].count++;
  }

  return Object.entries(themes)
    .filter(([, v]) => v.count > 0)
    .map(([theme, v]) => ({
      theme,
      seenInLosses: v.count,
      avoid: v.avoid,
    }))
    .sort((a, b) => b.seenInLosses - a.seenInLosses);
}

/** Agent recommendations for the next RFP draft. */
export function agentRecommendationsForNextRfp(): string[] {
  const wins = extractWinPatterns();
  const losses = extractLossLessons();
  const recs = [
    ...wins.map((w) => w.recommendation),
    ...losses.map((l) => `Avoid: ${l.avoid}`),
    'Run agent full-draft pass only after win/loss library retrieval for matching sector.',
    'Target 10% portfolio win rate: prioritize issuers where ≥3 win patterns apply.',
  ];
  return [...new Set(recs)];
}
