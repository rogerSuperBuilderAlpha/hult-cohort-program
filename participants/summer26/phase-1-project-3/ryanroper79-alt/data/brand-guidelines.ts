/**
 * CEAL Green Brand Guidelines v0.2 (draft)
 * Source: https://peteranthonygales.craft.me/s3ywHY5a1ppmyU
 * Approved by Ryan · May 7 · Visual identity (Section 5) pending — colours from logo until designer specs ship.
 */

export const brandGuidelinesUrl =
  'https://peteranthonygales.craft.me/s3ywHY5a1ppmyU';

export const brandFoundation = {
  coreProposition:
    'CEAL Green is a Caribbean execution engine for green solutions, built by people who care enough to get them right, and skilled enough to deliver them now.',
  centralPosition:
    'CEAL Green is the execution engine and the trusted bridge between Government, Private Sector, and International Capital.',
  bornGreenBornDigital:
    'CEAL Green was born green and born digital — designed for this era, not retrofitted for it.',
  valuesAcronym: 'DRIVEN',
  values: [
    'Discipline',
    'Respect',
    'Integrity',
    'Value',
    'Excellence',
    'Neutrality',
  ] as const,
} as const;

/** Approved register — use freely in copy */
export const approvedWords = [
  'relief',
  'execution',
  'care',
  'now',
  'capacity',
  'bridging',
  'building',
  'solutions',
  'resilient',
  'structured',
  'bankable',
  'designed',
  'digital',
  'proven',
  'Caribbean',
  'grounded',
  'deliver',
  'operational',
] as const;

/** Avoid in CEAL Green copy */
export const avoidPhrases = [
  'sustainable future',
  'green transition',
  'net zero journey',
  'transition',
  'whoever builds first wins',
  'behind (applied to the Caribbean)',
  'conditions are hard',
  'fight',
  'battle',
  'pushback',
] as const;

export const voiceCharacteristics = [
  'Present — state what we do, not what we intend',
  'Active — declarative, not over-explained',
  'Specific — deliverables and outcomes, not concepts',
  'Warm — care visible, never cold or transactional',
  'Caribbean — region named, never generic',
  'Invitational — pull toward building, never pressure',
] as const;

export const personalityTraits = [
  'Practitioner',
  'Confident',
  'Caring',
  'Caribbean',
  'Constructive',
  'Present',
] as const;

export const buildThemes = [
  { key: 'Build Smart', pillar: 'How to build' },
  { key: 'Build Strong', pillar: 'The execution gap' },
  { key: 'Build Caribbean', pillar: 'Caribbean context' },
  { key: 'Build Solutions', pillar: 'Practical outputs' },
  { key: 'Build Together', pillar: 'The care principle' },
  { key: 'Build Now', pillar: 'Universal close' },
] as const;

/** Editorial constraints — absolute */
export const neverDo = [
  'Defiance or resistance language',
  'Scarcity or race framing',
  'Blame narrative toward government or institutions',
  'Generic green claims without Caribbean context',
  'Abstraction without execution grounding',
  'Policy commentary or political framing',
  'Future promises where present declaration is accurate',
] as const;
