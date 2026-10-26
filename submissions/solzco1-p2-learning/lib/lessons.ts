export type Lesson = {
  id: string;
  title: string;
  durationMin: number;
  body: string[];
  keyTakeaways: string[];
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const MODULE_TITLE =
  "Winning High-Value B2B Clients & Enterprise Contracts";

export const LESSONS: Lesson[] = [
  {
    id: "discovery",
    title: "Enterprise Discovery That Surfaces Budget & Authority",
    durationMin: 12,
    body: [
      "Enterprise deals stall when reps pitch before they map the buying committee. Start every conversation by identifying economic buyer, technical evaluator, and champion.",
      "Use MEDDPICC-lite framing: Metrics (what numbers move if they buy?), Economic buyer (who signs?), Decision process (procurement steps?), Pain (cost of status quo).",
      "Ask for a mutual action plan before demo #2 — dates, owners, and success criteria written down signal a real evaluation, not a free consulting session.",
    ],
    keyTakeaways: [
      "Map committee before pitching",
      "Quantify pain in their metrics",
      "Mutual action plan = real deal",
    ],
  },
  {
    id: "value-case",
    title: "Building a CFO-Ready Business Case",
    durationMin: 15,
    body: [
      "Enterprise buyers fund outcomes, not features. Translate your solution into revenue gained, cost removed, or risk reduced — with ranges, not fairy-tale ROI.",
      "Structure: Current state cost → Future state benefit → Implementation cost → Payback period. Include sensitivity analysis (best / expected / conservative).",
      "Attach customer proof: logo, quote, and one metric from a similar segment. Anonymous case studies beat generic claims.",
    ],
    keyTakeaways: [
      "Outcome > feature list",
      "Show payback with ranges",
      "Segment-specific proof wins",
    ],
  },
  {
    id: "negotiation",
    title: "Multi-Stakeholder Negotiation & Contract Close",
    durationMin: 14,
    body: [
      "Never negotiate with procurement alone — loop your champion before conceding on terms. Trade concessions for commitments (reference, case study, multi-year).",
      "Standard enterprise levers: payment terms, SLA tiers, security review timeline, pilot scope, exit clauses. Know your walk-away on each.",
      "Close with a summary email: agreed scope, pricing, timeline, next legal step, and named owners. Silence after verbal yes kills more deals than competition.",
    ],
    keyTakeaways: [
      "Trade concessions for commitments",
      "Know walk-away levers",
      "Written summary closes the gap",
    ],
  },
];

export const QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Before a second demo, what artifact best signals a real enterprise evaluation?",
    options: [
      "A longer slide deck",
      "A mutual action plan with dates and owners",
      "A discount request",
      "An NDA only",
    ],
    correctIndex: 1,
    explanation:
      "A mutual action plan proves aligned process; NDAs alone are table stakes.",
  },
  {
    id: "q2",
    prompt: "What should a CFO-ready business case prioritize?",
    options: [
      "Feature parity vs competitors",
      "Outcome metrics with payback ranges",
      "Your company's founding story",
      "Number of integrations",
    ],
    correctIndex: 1,
    explanation: "Economic buyers fund measurable outcomes and payback.",
  },
  {
    id: "q3",
    prompt: "When procurement asks for a discount, the best first move is:",
    options: [
      "Match their number immediately",
      "Loop your champion and trade for a commitment",
      "Escalate to your CEO",
      "Offer unlimited support for free",
    ],
    correctIndex: 1,
    explanation:
      "Concessions should be exchanged for references, term, or scope clarity.",
  },
];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
