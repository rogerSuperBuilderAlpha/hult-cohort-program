export type RfpOutcome = 'won' | 'lost';

export type RfpCase = {
  id: string;
  client: string;
  project: string;
  sector: string;
  outcome: RfpOutcome;
  submittedDate: string;
  contractValue?: string;
  summary: string;
  strategicInclusions: string[];
  outcomeAnalysis: string[];
  agentTakeaways: string[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
  };
};

/** cEAL Green historical RFP portfolio — sample data for learning loop. Replace with firm records. */
export const rfpPortfolio: RfpCase[] = [
  {
    id: 'won-municipal-solar-2025-q1',
    client: 'City of Lowell',
    project: 'Municipal solar + storage feasibility',
    sector: 'Public sector · Clean energy',
    outcome: 'won',
    submittedDate: '2025-01-14',
    contractValue: '$485K',
    summary:
      'Full-scope feasibility, interconnection modeling, and workforce development plan for a 12 MW municipal solar portfolio with battery storage.',
    strategicInclusions: [
      'Local hire covenant: 40% of labor hours within 25-mile radius',
      'Triple-bottom-line scoring matrix aligned to issuer evaluation rubric',
      'Phase-gate cost model with ±8% contingency bands (not single-point pricing)',
      'Past performance: three comparable MW-scale municipal installs cited with refs',
      'Community benefits appendix co-authored with Lowell Green Jobs Coalition',
    ],
    outcomeAnalysis: [
      'Evaluators scored local workforce plan highest among five bidders.',
      'Contingency-band pricing reduced perceived risk vs. fixed-price competitors.',
      'Community partner letter differentiated cEAL Green from national EPC firms.',
    ],
    agentTakeaways: [
      'Always mirror issuer scoring weights in executive summary bullets.',
      'Include named local workforce partners before final draft.',
      'Use banded pricing when scope has interconnection uncertainty.',
    ],
    quiz: {
      question: 'Which inclusion most differentiated this winning municipal solar RFP?',
      options: [
        'Lowest fixed price regardless of scope',
        'Local hire covenant + community benefits appendix',
        'Generic sustainability mission statement',
        'Appendix omitted to reduce page count',
      ],
      correctIndex: 1,
    },
  },
  {
    id: 'lost-hospital-retrofit-2024-q4',
    client: 'Regional Health Network',
    project: 'Hospital campus HVAC + envelope retrofit',
    sector: 'Healthcare · Energy efficiency',
    outcome: 'lost',
    submittedDate: '2024-11-02',
    summary:
      'Deep retrofit proposal covering three acute-care buildings, ASHRAE Level II audits, and guaranteed savings performance contract.',
    strategicInclusions: [
      'Technical approach with equipment specs',
      'Single lump-sum price',
      'Generic healthcare references (non-comparable scale)',
      '12-month implementation timeline',
    ],
    outcomeAnalysis: [
      'Winner included ISO 50001-aligned measurement & verification plan — we did not.',
      'Debrief: our lump-sum price looked cheaper but carried no M&V guarantee.',
      'Hospital required infection-control protocols during construction — missing from our plan.',
      'Reference projects were outpatient clinics, not acute-care campuses.',
    ],
    agentTakeaways: [
      'Healthcare RFPs require explicit ICRA / infection-control construction protocols.',
      'Always include M&V methodology when issuer mentions guaranteed savings.',
      'Match reference project scale and building type to the solicitation.',
    ],
    quiz: {
      question: 'Primary debrief reason for losing the hospital retrofit RFP?',
      options: [
        'Font choice in the cover letter',
        'Missing M&V plan and acute-care construction protocols',
        'Proposal was too long',
        'Submitted one day early',
      ],
      correctIndex: 1,
    },
  },
  {
    id: 'lost-federal-transit-2024-q3',
    client: 'Federal Transit Administration (subrecipient)',
    project: 'Bus depot electrification + microgrid',
    sector: 'Federal · Transportation',
    outcome: 'lost',
    submittedDate: '2024-08-19',
    summary:
      'Depot charging infrastructure, demand management, and resilience microgrid for a 120-bus fleet transition.',
    strategicInclusions: [
      'Technical design narrative',
      'Budget by line item',
      'SAM.gov registration noted',
      'Diversity statement ( boilerplate )',
    ],
    outcomeAnalysis: [
      'Winner documented Buy America compliance traceability per component — we referenced it generically.',
      'Section 508 accessibility for deliverable formats was absent.',
      'Past performance did not use federal contract numbers required in attachment template.',
      'Risk register lacked FTA-specific cybersecurity controls ( NIST SP 800-53 mapping ).',
    ],
    agentTakeaways: [
      'Federal templates: paste exact attachment labels and contract numbers.',
      'Auto-generate Buy America traceability table from BOM.',
      'Include Section 508 and cybersecurity mapping appendices by default.',
    ],
    quiz: {
      question: 'Which gap hurt cEAL Green most on the federal transit RFP?',
      options: [
        'Missing Buy America traceability and Section 508 deliverable plan',
        'Cover page color',
        'Too many diagrams',
        'Executive summary length',
      ],
      correctIndex: 0,
    },
  },
  {
    id: 'won-corporate-esg-2025-q2',
    client: 'Fortune 500 industrial manufacturer',
    project: 'Scope 1–3 inventory + supplier engagement program',
    sector: 'Private sector · ESG reporting',
    outcome: 'won',
    submittedDate: '2025-04-03',
    contractValue: '$620K',
    summary:
      'GHG inventory to CSRD alignment, supplier questionnaire rollout, and board-ready quarterly reporting cadence.',
    strategicInclusions: [
      'Agent-assisted draft RFP response library ( prior wins anonymized )',
      'Supplier engagement playbook with tier-1 / tier-2 segmentation',
      'CSRD gap analysis against client’s existing CDP disclosure',
      'Fixed-fee discovery sprint before multi-year implementation',
      'Named partner: verified emissions data platform integration',
    ],
    outcomeAnalysis: [
      'Client cited “agent-ready templates” as speed-to-quality differentiator.',
      'Discovery sprint reduced buyer fear of multi-year lock-in.',
      'CSRD gap analysis showed we read their 10-K climate section specifically.',
    ],
    agentTakeaways: [
      'Lead with agent-assisted drafting capability for repeat issuers.',
      'Offer low-risk discovery sprint on multi-year ESG engagements.',
      'Quote buyer’s own disclosure language in the executive summary.',
    ],
    quiz: {
      question: 'Why did the corporate ESG RFP stand out to the buyer?',
      options: [
        'Lowest hourly rate only',
        'Agent-ready templates + CSRD gap analysis tied to their disclosure',
        'No references provided',
        'Single-page response',
      ],
      correctIndex: 1,
    },
  },
  {
    id: 'lost-university-microgrid-2024-q2',
    client: 'Mid-size state university',
    project: 'Campus resilience microgrid study',
    sector: 'Higher ed · Resilience',
    outcome: 'lost',
    submittedDate: '2024-05-22',
    summary:
      'Feasibility for islandable microgrid serving science quad, including solar, storage, and CHP options.',
    strategicInclusions: [
      'Engineering options analysis',
      'Standard university references',
      'Price proposed as hourly T&M',
    ],
    outcomeAnalysis: [
      'Winner included student learning outcomes / curriculum integration — strategic for public university.',
      'Our T&M pricing failed fixed-budget RFP requirement ($350K cap).',
      'Did not address NEPA / state environmental review pathway.',
      'Resilience benefits were qualitative; winner quantified avoided outage cost.',
    ],
    agentTakeaways: [
      'Public universities: add academic partnership / student workforce module.',
      'Confirm fee structure matches RFP budget cap before submission.',
      'Quantify resilience value ($/hour outage avoided) for campus clients.',
    ],
    quiz: {
      question: 'What structural issue disqualified cEAL Green’s university microgrid bid?',
      options: [
        'T&M pricing vs. required fixed budget cap',
        'Too many references',
        'Submitted in wrong language',
        'Missing cover sheet only',
      ],
      correctIndex: 0,
    },
  },
  {
    id: 'won-state-ev-charging-2024-q4',
    client: 'State DOT / climate office',
    project: 'NEVI-aligned corridor fast-charging siting',
    sector: 'State · EV infrastructure',
    outcome: 'won',
    submittedDate: '2024-10-08',
    contractValue: '$910K',
    summary:
      'Siting analysis, utility coordination, and equity-weighted station placement for interstate corridor compliance.',
    strategicInclusions: [
      'NEVI compliance checklist mapped line-by-line to proposal sections',
      'Equity scoring model with Justice40 overlay maps',
      'Utility interconnection pre-qual letters ( signed LOIs attached )',
      'Operations & maintenance cost model for 10-year horizon',
      'Agent-generated red-team review memo ( internal QA attached as appendix )',
    ],
    outcomeAnalysis: [
      'Line-by-line NEVI mapping saved evaluators time — scored “exceptional responsiveness.”',
      'Justice40 maps proved disadvantaged-community coverage targets.',
      'Pre-qual utility LOIs reduced interconnection risk vs. competitors.',
    ],
    agentTakeaways: [
      'Regulated programs: auto-map response to every compliance checkbox.',
      'Attach equity geospatial analysis when Justice40 is in the solicitation.',
      'Include agent red-team QA memo as credibility signal for public buyers.',
    ],
    quiz: {
      question: 'Winning factor for the state EV charging RFP?',
      options: [
        'NEVI line-by-line compliance map + Justice40 equity analysis',
        'Lowest staff count',
        'No appendices',
        'Verbal-only references',
      ],
      correctIndex: 0,
    },
  },
];

export function getRfpCase(id: string): RfpCase | undefined {
  return rfpPortfolio.find((c) => c.id === id);
}

export function listRfpCases(): RfpCase[] {
  return rfpPortfolio;
}
