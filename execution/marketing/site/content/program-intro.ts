/** Public copy for /start — newcomer intro (single source of truth). */

export const programIntro = {
  eyebrow: 'Open community · Summer Pilot 2026',
  title: 'What is this program?',
  lead:
    'A six-week, open-access community program where participants build production-grade software using professional frameworks, deployment practices, review workflows, and operational expectations. Peers review the systems; external users and maintainers evaluate the final sprint.',
  communityNote:
    'Anyone can apply. Admission is through a short take-home and staff review—no degree enrollment required for Summer Pilot 2026.',
  enrollmentNote:
    'Complete platform onboarding (apply, take-home, staff approval) to unlock project pages and submissions.',
  toolingNote:
    'Cursor and Claude Code are required from week 1 (~$400/month combined). Participants work in modern development environments and production delivery workflows.',
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
    q: 'How is completion measured?',
    a: 'Pass/fail on published program criteria—no letter grades on the platform. Every pass gate is listed on each project page before you submit.',
  },
  {
    q: 'What engineering experience is expected?',
    a: 'You should be ready to learn standard repository, branch, review, deployment, and debugging workflows. Week 1 covers the cohort process before project delivery begins.',
  },
  {
    q: 'Do I need to be a Hult student?',
    a: 'No for Summer Pilot 2026. Apply on the platform, complete the take-home, and get admitted to the roster. Academic credit and formal certificates are not part of this open-access cohort.',
  },
];
