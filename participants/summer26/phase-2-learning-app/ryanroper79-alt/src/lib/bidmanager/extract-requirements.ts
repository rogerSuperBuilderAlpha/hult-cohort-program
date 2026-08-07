export type RequirementCategory = 'eligibility' | 'technical' | 'financial' | 'legal' | 'format';

export type ExtractedRequirement = {
  ref: string;
  category: RequirementCategory;
  text: string;
  isMandatory: boolean;
  weightPct?: number;
  sourcePage?: string;
  extractionConfidence: number;
  humanVerified: false;
};

const MANDATORY_PATTERNS = [
  /\bmandatory\b/i,
  /\bmust\b/i,
  /\brequired\b/i,
  /\beligibility\b/i,
  /\bborrowing member\b/i,
  /\bregistration\b/i,
  /\binsurance\b/i,
  /\blocal content\b/i,
];

const CATEGORY_HINTS: { pattern: RegExp; category: RequirementCategory }[] = [
  { pattern: /\beligibility|member|registration|incorporat/i, category: 'eligibility' },
  { pattern: /\bfinancial|audit|turnover|bond/i, category: 'financial' },
  { pattern: /\bformat|page limit|font|submission envelope/i, category: 'format' },
  { pattern: /\blegal|compliance|sanction|debar/i, category: 'legal' },
];

/**
 * Rule-based requirement extraction — always human_verified: false until UI confirms.
 * Pure function; no AI calls in Week 4 public instance.
 */
export function extractRequirementsFromText(rawText: string): ExtractedRequirement[] {
  const sentences = rawText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const results: ExtractedRequirement[] = [];
  let idx = 0;

  for (const sentence of sentences) {
    const isMandatory = MANDATORY_PATTERNS.some((p) => p.test(sentence));
    if (!isMandatory && !/\bshall\b/i.test(sentence)) continue;

    idx += 1;
    let category: RequirementCategory = 'technical';
    for (const hint of CATEGORY_HINTS) {
      if (hint.pattern.test(sentence)) {
        category = hint.category;
        break;
      }
    }

    results.push({
      ref: `R-${String(idx).padStart(2, '0')}`,
      category,
      text: sentence,
      isMandatory,
      extractionConfidence: isMandatory ? 0.75 : 0.55,
      humanVerified: false,
    });
  }

  if (results.length === 0 && rawText.length > 30) {
    results.push({
      ref: 'R-01',
      category: 'eligibility',
      text: 'Review full tender documents for mandatory eligibility criteria (none auto-detected in summary text).',
      isMandatory: true,
      extractionConfidence: 0.4,
      humanVerified: false,
    });
  }

  return results;
}
