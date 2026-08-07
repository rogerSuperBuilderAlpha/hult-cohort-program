import { describe, expect, it } from 'vitest';
import { buildGapReport, gapReportSummary } from './gap-report';

describe('buildGapReport', () => {
  it('ranks mandatory gaps highest', () => {
    const rows = buildGapReport(
      [
        {
          id: 'a',
          ref: 'R-01',
          category: 'technical',
          text: 'Optional approach',
          isMandatory: false,
          extractionConfidence: 0.6,
          humanVerified: false,
        },
        {
          id: 'b',
          ref: 'R-02',
          category: 'eligibility',
          text: 'Mandatory registration',
          isMandatory: true,
          extractionConfidence: 0.8,
          humanVerified: false,
        },
      ],
      [
        { requirementId: 'a', coverage: 'partial' },
        { requirementId: 'b', coverage: 'gap' },
      ]
    );
    expect(rows[0].requirementId).toBe('b');
    expect(gapReportSummary(rows).mandatoryGaps).toBe(1);
  });

  it('excludes full coverage requirements', () => {
    const rows = buildGapReport(
      [
        {
          id: 'c',
          ref: 'R-03',
          category: 'eligibility',
          text: 'Met item',
          isMandatory: true,
          extractionConfidence: 0.9,
          humanVerified: true,
        },
      ],
      [{ requirementId: 'c', coverage: 'full' }]
    );
    expect(rows).toHaveLength(0);
  });
});
