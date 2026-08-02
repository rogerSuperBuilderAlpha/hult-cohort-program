/** Digital/AI solution catalog for partners — no capital metrics on-site. */

export type PartnerSolution = {
  slug: string;
  title: string;
  summary: string;
  needs: string[];
  domain: 'digital-ai' | 'energy' | 'infrastructure' | 'evidence';
};

export const partnerSolutions: PartnerSolution[] = [
  {
    slug: 'ai-delivery-platforms',
    title: 'AI-native project delivery platforms',
    summary:
      'Custom PM, evidence, and field-ops surfaces built with modern AI tooling — scoped for Caribbean infrastructure owners who need audit trails, not slide decks.',
    needs: ['Sponsor', 'Hire builder', 'Pilot organization'],
    domain: 'digital-ai',
  },
  {
    slug: 'grid-renewable-monitoring',
    title: 'Grid & renewable asset monitoring',
    summary:
      'Software for interconnection visibility, generation profiles, and operator dashboards — supporting energy transition without importing every line of code.',
    needs: ['Data partner', 'Pilot organization', 'Investor'],
    domain: 'energy',
  },
  {
    slug: 'resilient-infra-evidence',
    title: 'Resilient infrastructure evidence surfaces',
    summary:
      'Public showcases, verification APIs, and partner-facing README pipelines — the same pattern operating on this site, applied to your program.',
    needs: ['Investor', 'Sponsor', 'Technical collaborator'],
    domain: 'evidence',
  },
  {
    slug: 'digital-transformation-sprints',
    title: 'One-week digital transformation sprints',
    summary:
      'Fund a named Caribbean or SIDS problem; the cohort ships a working HTTPS deploy with public PR evidence inside a single pilot cycle.',
    needs: ['Sponsor', 'Pilot organization'],
    domain: 'digital-ai',
  },
  {
    slug: 'energy-sovereignty-analytics',
    title: 'Energy sovereignty analytics & insight',
    summary:
      'Data analytics and AI-assisted feasibility workflows — combining engineering judgment with decision support for regional energy policy gaps.',
    needs: ['Investor', 'Data partner', 'Research partner'],
    domain: 'energy',
  },
  {
    slug: 'cohort-comms-pm-stack',
    title: 'Cohort PM + comms stack integration',
    summary:
      'Extend operating Week 1 PM and Week 2 comms platforms with your identity, workflows, and Caribbean operator requirements.',
    needs: ['Technical collaborator', 'Pilot organization'],
    domain: 'infrastructure',
  },
];

export const interestTypes = [
  { value: 'investor', label: 'Investor — digital/AI for infrastructure decisions' },
  { value: 'sponsor', label: 'Sponsor — fund a one-week sprint' },
  { value: 'pilot', label: 'Pilot organization — co-develop a prototype' },
  { value: 'hire', label: 'Hire a builder — contract or full-time' },
  { value: 'data-partner', label: 'Data partner' },
  { value: 'technical', label: 'Technical collaborator' },
  { value: 'research', label: 'Research partner' },
  { value: 'distribution', label: 'Distribution partner' },
  { value: 'general', label: 'General enquiry' },
] as const;

export type InterestType = (typeof interestTypes)[number]['value'];

export const problemDomains = [
  { value: 'renewable-energy', label: 'Renewable energy & grid integration' },
  { value: 'resilient-infrastructure', label: 'Resilient infrastructure' },
  { value: 'digital-ai', label: 'Digital / AI platforms' },
  { value: 'energy-transition', label: 'Energy transition policy & analytics' },
  { value: 'public-evidence', label: 'Public evidence & partner surfaces' },
  { value: 'other', label: 'Other Caribbean / SIDS problem' },
] as const;

export type ProblemDomain = (typeof problemDomains)[number]['value'];
