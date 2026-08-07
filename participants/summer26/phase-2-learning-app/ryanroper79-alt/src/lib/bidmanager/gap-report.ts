import type { ExtractedRequirement } from './extract-requirements';

export type EvidenceCoverage = 'full' | 'partial' | 'gap';

export type RequirementEvidenceRow = {
  requirementId: string;
  coverage: EvidenceCoverage;
  evidenceId?: string;
  note?: string;
};

export type GapReportRow = {
  requirementId: string;
  ref: string;
  category: string;
  text: string;
  isMandatory: boolean;
  weightPct: number;
  coverage: EvidenceCoverage;
  humanVerified: boolean;
  rankScore: number;
};

/** Rank gaps by mandatory flag and weight — partial before full gaps for action order. */
export function buildGapReport(
  requirements: (Omit<ExtractedRequirement, 'humanVerified'> & { id: string; humanVerified: boolean })[],
  links: RequirementEvidenceRow[]
): GapReportRow[] {
  const rows: GapReportRow[] = [];

  for (const req of requirements) {
    const link = links.find((l) => l.requirementId === req.id);
    const coverage = link?.coverage ?? 'gap';
    if (coverage === 'full') continue;

    const weightPct = req.isMandatory ? 100 : req.weightPct ?? 50;
    const rankScore =
      (req.isMandatory ? 1000 : 0) +
      weightPct +
      (coverage === 'gap' ? 50 : 25) +
      (req.humanVerified ? 0 : 10);

    rows.push({
      requirementId: req.id,
      ref: req.ref,
      category: req.category,
      text: req.text,
      isMandatory: req.isMandatory,
      weightPct,
      coverage,
      humanVerified: req.humanVerified,
      rankScore,
    });
  }

  return rows.sort((a, b) => b.rankScore - a.rankScore);
}

export function gapReportSummary(rows: GapReportRow[]): {
  totalGaps: number;
  mandatoryGaps: number;
  unverifiedRequirements: number;
} {
  return {
    totalGaps: rows.length,
    mandatoryGaps: rows.filter((r) => r.isMandatory).length,
    unverifiedRequirements: rows.filter((r) => !r.humanVerified).length,
  };
}
