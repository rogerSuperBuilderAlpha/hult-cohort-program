/** Public copy for /start — newcomer intro (single source of truth). */

export const programIntro = {
  eyebrow: 'CS for Business · Summer Pilot 2026',
  title: 'What is this program?',
  lead:
    'A six-week, for-credit pilot where students build production-grade software using professional frameworks, deployment practices, review workflows, and operational expectations. Peers review the systems; external users and maintainers evaluate the final sprint.',
  electiveNote:
    'Offered within the Hult Computer Science for Business undergraduate degree. Tuition and academic policies follow your degree enrollment—not a separate commercial cohort product.',
  dualEnrollment:
    'You need both: register for the course through Hult, and complete platform onboarding (apply, take-home, staff approval) to unlock project pages and submissions.',
  toolingNote:
    'Cursor and Claude Code are required from week 1 (~$400/month combined). Students work in modern development environments and production delivery workflows.',
  ctaApply: 'Apply for Summer Pilot',
  ctaProgram: 'Project list',
} as const;

export type TimelineSegment = {
  id: string;
  label: string;
  weeks: string;
  detail: string;
};

export const introTimeline: TimelineSegment[] = [
  {
    id: 'onboard',
    label: 'Onboarding',
    weeks: 'Week 1',
    detail: 'Tooling, development environment setup, and the first structured code submission.',
  },
  {
    id: 'p1',
    label: 'Phase 1',
    weeks: 'Weeks 2–4',
    detail: 'Three platforms: PM, comms, showcase. Same build → review → vote loop each time.',
  },
  {
    id: 'uni',
    label: 'Unification',
    weeks: 'Week 5',
    detail: 'Winning builds merge into one cohort stack.',
  },
  {
    id: 'p2',
    label: 'Phase 2',
    weeks: 'Week 6',
    detail: 'Learning app, venture package, and open-source contribution in the final sprint.',
  },
];

export type LoopStep = {
  step: number;
  title: string;
  body: string;
};

export const phase1Loop: LoopStep[] = [
  {
    step: 1,
    title: 'Build & deploy',
    body: 'Ship a production application with deployment notes and operating documentation.',
  },
  {
    step: 2,
    title: 'Review every peer',
    body: 'File a structured technical review for each peer system; record it on the platform.',
  },
  {
    step: 3,
    title: 'Private vote',
    body: 'After your written review, cast 👍 or 👎 (not public).',
  },
  {
    step: 4,
    title: 'Operate the winner',
    body: 'The selected system operates for the cohort; everyone else contributes fixes and improvements.',
  },
];

export const introFaq: { q: string; a: string }[] = [
  {
    q: 'How is it graded?',
    a: 'Pass/fail on published program criteria—no letter grades on the platform. See your course syllabus for credit.',
  },
  {
    q: 'What engineering experience is expected?',
    a: 'You should be ready to learn standard repository, branch, review, deployment, and debugging workflows. Week 1 covers the cohort process before project delivery begins.',
  },
  {
    q: 'Can I use the platform without registering for the course?',
    a: 'No. Dual enrollment: Hult course registration plus platform apply/admit.',
  },
];
