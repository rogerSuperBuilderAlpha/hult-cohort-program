import { describe, expect, it } from 'vitest';
import { extractRequirementsFromText } from './extract-requirements';

describe('extractRequirementsFromText', () => {
  it('extracts mandatory eligibility sentences', () => {
    const reqs = extractRequirementsFromText(
      'Mandatory: borrowing member firm registration. Consultants must carry professional indemnity insurance.'
    );
    expect(reqs.length).toBeGreaterThanOrEqual(1);
    expect(reqs.every((r) => r.humanVerified === false)).toBe(true);
    expect(reqs.some((r) => r.isMandatory)).toBe(true);
  });

  it('never sets human_verified true', () => {
    const reqs = extractRequirementsFromText('Required local content participation for Caribbean SMEs.');
    for (const r of reqs) {
      expect(r.humanVerified).toBe(false);
    }
  });
});
