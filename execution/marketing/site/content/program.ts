export type ProgramProject = {
  slug: string;
  phase: 'onboarding' | 'phase-1' | 'phase-2';
  phaseLabel: string;
  title: string;
  weeks: string;
  summary: string;
  voteWeek: boolean;
  expectations: string[];
  submission: {
    repoPattern: string;
    prTitle: string;
    prBodyMustInclude: string[];
    deadlineNote: string;
  };
  reviews?: {
    count: number;
    artifact: string;
    dueNote: string;
  };
  passGate: string[];
};

export const programProjects: ProgramProject[] = [
  {
    slug: 'onboarding',
    phase: 'onboarding',
    phaseLabel: 'Week 1 · Onboarding',
    title: 'Agent setup, GitHub workflow, tooling',
    weeks: 'Week 1',
    summary:
      'Verify tooling, learn the PR loop, and complete bootstrap work on Discord before cohort-owned platforms exist.',
    voteWeek: false,
    expectations: [
      'Cursor + Claude Code active ($400/mo combined)',
      'GitHub account linked; org invite accepted',
      'Complete repo-exploration workshop',
      'Attend live kickoffs; refund window ends Friday 5pm',
    ],
    submission: {
      repoPattern: '{org}/roster',
      prTitle: '[Onboarding] Tooling checklist — {handle}',
      prBodyMustInclude: [
        'Tooling verification checklist (Cursor, Claude Code, GitHub SSH)',
        'Expectations Acknowledgment signed',
        'Agent workflow dry-run noted',
      ],
      deadlineNote: 'Roster locked Sep 12 after refund window (Fri week 1, 17:00)',
    },
    passGate: ['100% tooling verification', 'Expectations Acknowledgment signed'],
  },
  {
    slug: 'phase-1-project-1',
    phase: 'phase-1',
    phaseLabel: 'Phase 1 · Project 1',
    title: 'Project management platform',
    weeks: 'Weeks 2–4',
    summary:
      'Build a production PM platform for 30 developers. Winner operates the cohort PM system for the rest of the semester.',
    voteWeek: true,
    expectations: [
      'Build solo in public repo `pm-{handle}` in the cohort org',
      'Deploy to production HTTPS before deadline',
      'Support ≥30 accounts, projects, tasks, assignments, status workflow',
      'Complete 29 peer reviews during review week',
      'Cast ranked-choice ballot (top 3 merged builds)',
      'If you lose: become developer/user on the winning platform (≥2 PRs/cycle)',
    ],
    submission: {
      repoPattern: '{org}/pm-{handle}',
      prTitle: '[Project 1] Submission — {handle}',
      prBodyMustInclude: [
        'Production URL',
        'Setup steps verified on fresh clone',
        'Architecture summary',
        'Known limitations',
        'Agent usage summary',
      ],
      deadlineNote: 'PR merged to main by Thu week 4, 17:00 — unmerged PRs ineligible for ballot',
    },
    reviews: {
      count: 29,
      artifact: 'GitHub issue `Review by @{you}` on each peer repo (see peer-review-system.md)',
      dueNote: 'Fri week 4, 14:00',
    },
    passGate: ['Submission PR merged or eligible miss documented', '29/29 reviews', 'Vote submitted'],
  },
  {
    slug: 'phase-1-project-2',
    phase: 'phase-1',
    phaseLabel: 'Phase 1 · Project 2',
    title: 'Internal comms platform',
    weeks: 'Weeks 5–6',
    summary: 'Build the comms stack the cohort lives in after Discord bootstrap ends.',
    voteWeek: true,
    expectations: [
      'Build in `comms-{handle}`; integrate with winning PM platform where sensible',
      'Real-time or async comms for 30+ users',
      '29 peer reviews + ranked-choice vote on merged submissions',
    ],
    submission: {
      repoPattern: '{org}/comms-{handle}',
      prTitle: '[Project 2] Submission — {handle}',
      prBodyMustInclude: ['Production URL', 'PM platform integration notes', 'Agent usage'],
      deadlineNote: 'PR merged by Thu week 6, 17:00',
    },
    reviews: { count: 29, artifact: 'GitHub review issue per peer', dueNote: 'Fri week 6, 14:00' },
    passGate: ['Merged submission PR', '29/29 reviews', 'Vote submitted'],
  },
  {
    slug: 'phase-1-project-3',
    phase: 'phase-1',
    phaseLabel: 'Phase 1 · Project 3',
    title: 'Public showcase platform',
    weeks: 'Weeks 7–8',
    summary: 'Build the hiring-partner-facing showcase. Winner operates public profiles for the cohort.',
    voteWeek: true,
    expectations: [
      'Build in `showcase-{handle}`',
      'Public profiles linking GitHub trail for every cohort member',
      '29 reviews + vote; winners begin ecosystem unification',
    ],
    submission: {
      repoPattern: '{org}/showcase-{handle}',
      prTitle: '[Project 3] Submission — {handle}',
      prBodyMustInclude: ['Production URL', 'Sample profile URLs', 'Partner-facing README'],
      deadlineNote: 'PR merged by Thu week 8, 17:00',
    },
    reviews: { count: 29, artifact: 'GitHub review issue per peer', dueNote: 'Fri week 8, 14:00' },
    passGate: ['Merged submission PR', '29/29 reviews', 'Vote submitted'],
  },
  {
    slug: 'phase-1-unification',
    phase: 'phase-1',
    phaseLabel: 'Phase 1 · Unification',
    title: 'Ecosystem unification',
    weeks: 'Week 8',
    summary: 'Three winners merge PM + comms + showcase into one linked ecosystem.',
    voteWeek: false,
    expectations: [
      'Winners collaborate in `ecosystem-integration` repo',
      'Single sign-on or deep links between platforms',
      'PRs reviewed by all three operator teams',
    ],
    submission: {
      repoPattern: '{org}/ecosystem-integration',
      prTitle: '[Unification] Integration PR — {team}',
      prBodyMustInclude: ['Demo URL', 'Migration/cutover plan'],
      deadlineNote: 'Before Phase 2 kickoff',
    },
    passGate: ['Integration demo passes staff smoke test'],
  },
  {
    slug: 'phase-2-learning-app',
    phase: 'phase-2',
    phaseLabel: 'Phase 2 · Project 1',
    title: 'Learning app on Ludwitt/Hult',
    weeks: 'Weeks 9–11',
    summary: 'Individual app on any topic. Success = ≥25 external users counted by platform API.',
    voteWeek: false,
    expectations: [
      'Register app via Ludwitt/Hult API; JWT + events working',
      'Promote to real users — platform counts, you do not self-report',
      'Submit proof-of-work PR with listing URL and metrics snapshot',
    ],
    submission: {
      repoPattern: '{org}/learning-{handle}',
      prTitle: '[P2-L1] Submission — {handle}',
      prBodyMustInclude: [
        'Ludwitt/Hult app ID',
        'Production listing URL',
        'Metrics API snapshot (date-stamped)',
        'Promotion channels used',
      ],
      deadlineNote: 'PR merged by Fri week 11 — metrics snapshot on that date',
    },
    passGate: ['≥25 qualified external users on platform snapshot'],
  },
  {
    slug: 'phase-2-venture',
    phase: 'phase-2',
    phaseLabel: 'Phase 2 · Project 2',
    title: 'Venture',
    weeks: 'Weeks 12–15',
    summary: 'Market research, business plan, investor materials, and production app with ≥25 users.',
    voteWeek: false,
    expectations: [
      'Venture docs and app in `venture-{handle}`',
      '≥1 investor touch documented in PR',
      'Same user metric bar as learning app',
    ],
    submission: {
      repoPattern: '{org}/venture-{handle}',
      prTitle: '[P2-Venture] Submission — {handle}',
      prBodyMustInclude: [
        'Investor deck link (in repo)',
        'Business plan path',
        'App URL + user metrics',
        'Investor touch log (redact PII)',
      ],
      deadlineNote: 'PR merged by Fri week 15',
    },
    passGate: ['≥25 users', '≥1 investor touch', 'Complete doc set in repo'],
  },
  {
    slug: 'phase-2-open-source',
    phase: 'phase-2',
    phaseLabel: 'Phase 2 · Project 3',
    title: 'Open source contribution',
    weeks: 'Weeks 9–16 (continuous)',
    summary: '≥1 merged PR to a qualified repo (≥1k stars). Tracked via cohort PR, not a form.',
    voteWeek: false,
    expectations: [
      'Target repo from qualified list or staff-approved equivalent',
      'Open tracking PR in cohort org linking upstream PR',
      'Update tracking PR when upstream merges',
    ],
    submission: {
      repoPattern: '{org}/oss-{handle} (tracking) + external upstream',
      prTitle: '[P2-OSS] Tracking — {handle}',
      prBodyMustInclude: [
        'Upstream repo URL',
        'Upstream PR URL',
        'Merge status',
        'Contribution summary',
      ],
      deadlineNote: 'Upstream merge required before cohort end',
    },
    passGate: ['≥1 merged upstream PR in qualified repo'],
  },
];

export function getProject(slug: string): ProgramProject | undefined {
  return programProjects.find((p) => p.slug === slug);
}
