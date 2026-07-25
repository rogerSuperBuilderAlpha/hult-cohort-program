/** Public copy for /start — newcomer intro (single source of truth). */

export const programIntro = {
  eyebrow: 'Open community · Summer Pilot 2026',
  title: 'What is this program?',
  lead:
    'A six-week, open-access community program where participants build production-grade software using professional frameworks, deployment practices, review workflows, and operational expectations. Peers review the early platforms; external users, investors, and maintainers judge the later weeks.',
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
    id: 'w1',
    label: 'PM platform',
    weeks: 'Week 1',
    detail: 'Contest: project management platform. Motivation is the key design variable.',
  },
  {
    id: 'w2',
    label: 'Comms',
    weeks: 'Week 2',
    detail: 'Contest: internal communications platform for the cohort.',
  },
  {
    id: 'w3',
    label: 'Vibe marketing',
    weeks: 'Week 3',
    detail: 'Contest: public vibe marketing platform for the cohort.',
  },
  {
    id: 'w4',
    label: 'Ludwitt learning',
    weeks: 'Week 4',
    detail: 'Learning engineer integration to Ludwitt — verified external users.',
  },
  {
    id: 'w5',
    label: 'Startup',
    weeks: 'Week 5',
    detail: 'Venture package: deck, plan, production app, investor touch.',
  },
  {
    id: 'w6',
    label: 'OSS swarm',
    weeks: 'Week 6',
    detail: 'Open source swarm — land a merged upstream pull request.',
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
    title: 'Review every peer on GitHub',
    body: 'On each project’s Peer review tab, open a peer, then use “Open GitHub → write review & submit issue.” That creates an issue on their app repo titled Review by @{you}: @{peer}. Fill the rubric template and click Submit new issue on GitHub.',
  },
  {
    step: 3,
    title: 'Optional upvote (or abstain)',
    body: 'Keep the Vote: up line in the issue body to upvote, or delete that section to abstain. No downvotes. Refresh the site afterward — it tracks your personal status only, not cohort tallies.',
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
    a: 'You should be ready to learn standard repository, branch, review, deployment, and debugging workflows. Week 1 is a full build contest — tooling and Expectations Acknowledgment happen in parallel on the dashboard.',
  },
  {
    q: 'Do I need to be a Hult student?',
    a: 'No for Summer Pilot 2026. Apply on the platform, complete the take-home, and get admitted to the roster. Academic credit and formal certificates are not part of this open-access cohort.',
  },
];
