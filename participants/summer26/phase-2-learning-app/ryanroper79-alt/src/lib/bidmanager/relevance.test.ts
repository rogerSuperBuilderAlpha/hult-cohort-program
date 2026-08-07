import { describe, expect, it } from 'vitest';
import { scoreRelevance, relevancePassesThreshold } from './relevance';
import type { ProfileKeyword } from './types';

const cealKeywords: ProfileKeyword[] = [
  { term: 'solar PV', weight: 2, category: 'energy' },
  { term: 'battery energy storage', weight: 2, category: 'energy' },
  { term: 'energy efficiency', weight: 1.5, category: 'energy' },
  { term: 'feasibility study', weight: 1, category: 'consulting' },
  { term: 'owner\'s engineer', weight: 1, category: 'consulting' },
];

describe('scoreRelevance', () => {
  it('scores high when multiple capability terms match', () => {
    const result = scoreRelevance(
      {
        title: 'Solar PV and battery energy storage feasibility study',
        sector: 'Renewable energy',
        rawText: 'Caribbean utility-scale deployment',
      },
      cealKeywords
    );
    expect(result.score).toBeGreaterThan(50);
    expect(result.matchedTerms).toContain('solar PV');
    expect(result.matchedTerms).toContain('battery energy storage');
  });

  it('scores zero when no keywords match', () => {
    const result = scoreRelevance(
      { title: 'Office stationery supply contract', rawText: 'pens and paper' },
      cealKeywords
    );
    expect(result.score).toBe(0);
    expect(result.matchedTerms).toHaveLength(0);
  });

  it('passes threshold at configured cutoff', () => {
    expect(relevancePassesThreshold(45, 40)).toBe(true);
    expect(relevancePassesThreshold(35, 40)).toBe(false);
  });
});
