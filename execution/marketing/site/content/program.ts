/**
 * Messaging standards (canonical vocabulary for participant-facing copy):
 * - "Review week" (not "vote week") for Phase 1 assessment mechanics
 * - Always pair "review → vote": file a written GitHub review, then cast a private vote
 * - "Peer" (not "classmate"); "required" (not "mandatory")
 * - Post-admission state: "Enrolled" (admission moment only on /apply)
 * - Money: ~$400/mo tooling; ~$800 (~2 months) combined for the Summer Pilot
 * - Tone: serious, professional, academic — no sales language or insider jargon
 */
export type ProjectSchedule = {
  submissionOpens: string;
  submissionCloses: string;
  reviewOpens?: string;
  reviewCloses?: string;
};

export type ProgramProject = {
  slug: string;
  phase: 'onboarding' | 'phase-1' | 'phase-2';
  phaseLabel: string;
  title: string;
  weeks: string;
  summary: string;
  /** Longer narrative shown at top of project page */
  description: string;
  voteWeek: boolean;
  expectations: string[];
  schedule: ProjectSchedule;
  submission: {
    repoPattern: string;
    prTitle: string;
    prBodyMustInclude: string[];
    deadlineNote: string;
  };
  reviews?: {
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
    title: 'Development environment and workflow setup',
    weeks: 'Week 1',
    summary:
      'Configure required tooling, establish the pull-request workflow, and complete orientation activities before cohort platforms are available.',
    description:
      'Week 1 focuses on preparation rather than project development. Participants confirm Cursor and Claude Code subscriptions, obtain write access to the cohort repository, and submit their first pull request to `hult-cohort-program`. Following the refund window, the roster is finalized and the six-week Summer Pilot moves into Phase 1.',
    voteWeek: false,
    schedule: {
      submissionOpens: '2026-07-09T13:00:00.000Z',
      submissionCloses: '2026-07-15T21:00:00.000Z',
    },
    expectations: [
      'Cursor and Claude Code active (~$400/mo combined)',
      'GitHub account linked; collaborator access on cohort repository (or fork workflow)',
      'Complete repository exploration workshop',
      'Attend live orientation sessions; refund window closes at 17:00 Eastern Time',
    ],
    submission: {
      repoPattern: '{repo}',
      prTitle: '[Onboarding] Tooling checklist — {handle}',
      prBodyMustInclude: [
        'Tooling verification checklist (Cursor, Claude Code, GitHub SSH)',
        'Expectations Acknowledgment signed',
        'Agent workflow dry-run noted',
      ],
      deadlineNote: 'Cohort roster finalized July 15, following the week 1 refund window (17:00 Eastern Time)',
    },
    passGate: ['100% tooling verification', 'Expectations Acknowledgment signed'],
  },
  {
    slug: 'phase-1-project-1',
    phase: 'phase-1',
    phaseLabel: 'Project 1 · Week 2',
    title: 'Project management platform',
    weeks: 'Week 2',
    summary:
      'Develop a project management platform that the cohort will use to track projects, tasks, and assignments for the remainder of the pilot.',
    description:
      'Each participant builds and deploys a production project management platform in one week. Submit a merged pull request to `{repo}` containing your deploy URL and supporting documentation. The selected submission becomes the live system for the cohort — supporting accounts for every enrolled participant, with real projects and deadlines. This is operational infrastructure, not a portfolio demonstration. Following review, the submission with the most private votes operates the cohort project management stack for the rest of the pilot.',
    voteWeek: true,
    schedule: {
      submissionOpens: '2026-07-16T13:00:00.000Z',
      submissionCloses: '2026-07-22T21:00:00.000Z',
      reviewOpens: '2026-07-22T21:00:00.000Z',
      reviewCloses: '2026-07-23T18:00:00.000Z',
    },
    expectations: [
      'Build individually; deploy to production over HTTPS before the deadline',
      'Submit merged pull request to `{repo}` with production URL in the body',
      'Support all enrolled accounts, projects, tasks, assignments, and status workflows',
      'File a written review (GitHub issue) on each peer repository, then cast a private vote',
      'The submission with the most votes after review closes is selected to operate the platform',
      'Private votes are available only after the written review is recorded for that peer',
      'Participants whose submissions are not selected contribute to the winning platform (minimum 2 pull requests per cycle)',
    ],
    submission: {
      repoPattern: '{repo}',
      prTitle: '[Project 1] Submission — {handle}',
      prBodyMustInclude: [
        'Production URL',
        'Setup steps verified on fresh clone',
        'Architecture summary',
        'Known limitations',
        'Agent usage summary',
      ],
      deadlineNote: 'Pull request merged to main by Wednesday week 2, 17:00 Eastern Time — unmerged pull requests are ineligible for review',
    },
    reviews: {
      artifact:
        'Written review (GitHub issue titled `Review by @{you}`) on each peer repository, then a private vote on this platform',
      dueNote: 'Thursday week 2, 14:00 Eastern Time',
    },
    passGate: [
      'Submission pull request merged or eligible miss documented',
      '{peerCount}/{peerCount} written reviews',
      '{peerCount}/{peerCount} private votes',
    ],
  },
  {
    slug: 'phase-1-project-2',
    phase: 'phase-1',
    phaseLabel: 'Project 2 · Week 3',
    title: 'Internal communications platform',
    weeks: 'Week 3',
    summary:
      'Develop an internal communications platform to replace Discord as the cohort\'s primary communication channel.',
    description:
      'Discord serves as the interim channel during week 1. Project 2 requires a production communications platform for the cohort: channels, direct messages, notifications, or asynchronous threads — the design is at the participant\'s discretion, but the platform must support every enrolled participant. Integration with the selected project management platform is required where appropriate (deep links, shared authentication, task notifications). The winning submission operates cohort communications for the remainder of the pilot.',
    voteWeek: true,
    schedule: {
      submissionOpens: '2026-07-23T13:00:00.000Z',
      submissionCloses: '2026-07-29T21:00:00.000Z',
      reviewOpens: '2026-07-29T21:00:00.000Z',
      reviewCloses: '2026-07-30T18:00:00.000Z',
    },
    expectations: [
      'Build and deploy a communications platform; integrate with the selected project management platform where appropriate',
      'Support real-time or asynchronous communication for all enrolled participants',
      'File a written review (GitHub issue) on each peer submission, then cast a private vote',
    ],
    submission: {
      repoPattern: '{repo}',
      prTitle: '[Project 2] Submission — {handle}',
      prBodyMustInclude: ['Production URL', 'PM platform integration notes', 'Agent usage'],
      deadlineNote: 'Pull request merged by Wednesday week 3, 17:00 Eastern Time',
    },
    reviews: {
      artifact: 'Written review (GitHub issue) per peer, then a private vote',
      dueNote: 'Thursday week 3, 14:00 Eastern Time',
    },
    passGate: [
      'Merged submission pull request',
      '{peerCount}/{peerCount} written reviews',
      '{peerCount}/{peerCount} private votes',
    ],
  },
  {
    slug: 'phase-1-project-3',
    phase: 'phase-1',
    phaseLabel: 'Project 3 · Week 4',
    title: 'Public showcase platform',
    weeks: 'Week 4',
    summary:
      'Develop a public-facing website presenting the cohort to hiring partners and external audiences.',
    description:
      'This project produces the cohort\'s public presence. Each participant\'s submission includes a profile page linking to their GitHub contributions, projects, and deploy URLs. Hiring partners review this platform before the final showcase. The winning submission operates the public showcase for the cohort. Profiles must cover every enrolled participant; the submission pull request must include a partner-facing README and sample profile URLs.',
    voteWeek: true,
    schedule: {
      submissionOpens: '2026-07-30T13:00:00.000Z',
      submissionCloses: '2026-08-05T21:00:00.000Z',
      reviewOpens: '2026-08-05T21:00:00.000Z',
      reviewCloses: '2026-08-06T18:00:00.000Z',
    },
    expectations: [
      'Submit merged pull request to `{repo}` with production URL and sample profile links',
      'Public profiles linking GitHub contributions for every cohort member',
      'Written review (GitHub issue) and private vote for each peer submission',
    ],
    submission: {
      repoPattern: '{repo}',
      prTitle: '[Project 3] Submission — {handle}',
      prBodyMustInclude: ['Production URL', 'Sample profile URLs', 'Partner-facing README'],
      deadlineNote: 'Pull request merged by Wednesday week 4, 17:00 Eastern Time',
    },
    reviews: {
      artifact: 'Written review (GitHub issue) per peer, then a private vote',
      dueNote: 'Thursday week 4, 14:00 Eastern Time',
    },
    passGate: [
      'Merged submission pull request',
      '{peerCount}/{peerCount} written reviews',
      '{peerCount}/{peerCount} private votes',
    ],
  },
  {
    slug: 'phase-1-unification',
    phase: 'phase-1',
    phaseLabel: 'Phase 1 · Week 5',
    title: 'Ecosystem unification',
    weeks: 'Week 5',
    summary:
      'The three Phase 1 winning platforms are integrated into a single linked ecosystem.',
    description:
      'The three Phase 1 winning teams collaborate to unify the project management, communications, and showcase platforms into a single linked ecosystem — with shared navigation, single sign-on or deep links, and a migration plan for the remainder of the cohort. All other participants contribute pull requests to the winning platforms.',
    voteWeek: false,
    schedule: {
      submissionOpens: '2026-08-06T13:00:00.000Z',
      submissionCloses: '2026-08-12T21:00:00.000Z',
    },
    expectations: [
      'Winning teams collaborate via pull requests to `{repo}`',
      'Single sign-on or deep links between platforms',
      'Pull requests reviewed by all three operator teams',
    ],
    submission: {
      repoPattern: '{repo}',
      prTitle: '[Unification] Integration PR — {handle}',
      prBodyMustInclude: ['Demo URL', 'Migration/cutover plan'],
      deadlineNote: 'Before Phase 2 begins',
    },
    passGate: ['Integration demonstration passes staff verification'],
  },
  {
    slug: 'phase-2-learning-app',
    phase: 'phase-2',
    phaseLabel: 'Project 4 · Week 6',
    title: 'Learning application',
    weeks: 'Week 6',
    summary:
      'Develop and launch a learning application on a topic of your choice; success is measured by external user adoption during the final sprint.',
    description:
      'Participants select a subject area — algorithms, finance, language, interview preparation, or another topic — and develop a production learning application registered on the Ludwitt/Hult platform during the week 6 sprint. The assessment criterion is verified external usage: a minimum of 25 external users recorded by the platform API on the deadline date. Self-reported metrics are not accepted. External user adoption determines whether the application meets the standard.',
    voteWeek: false,
    schedule: {
      submissionOpens: '2026-08-13T13:00:00.000Z',
      submissionCloses: '2026-08-19T21:00:00.000Z',
    },
    expectations: [
      'Register application via Ludwitt/Hult API; JWT authentication and event tracking operational',
      'Acquire external users — the platform records usage; self-reporting is not accepted',
      'Submit proof-of-work pull request with listing URL and date-stamped metrics snapshot',
    ],
    submission: {
      repoPattern: '{repo}',
      prTitle: '[P2-L1] Submission — {handle}',
      prBodyMustInclude: [
        'Ludwitt/Hult app ID',
        'Production listing URL',
        'Metrics API snapshot (date-stamped)',
        'Promotion channels used',
      ],
      deadlineNote: 'Pull request merged by Wednesday week 6, 17:00 Eastern Time — metrics snapshot taken on that date',
    },
    passGate: ['≥25 qualified external users on platform snapshot'],
  },
  {
    slug: 'phase-2-venture',
    phase: 'phase-2',
    phaseLabel: 'Project 5 · Week 6',
    title: 'Startup venture',
    weeks: 'Week 6',
    summary:
      'Develop a venture package: investor materials, business plan, and a production application with external-user evidence.',
    description:
      'Participants prepare a venture as they would for a startup: market research, business plan, investor materials, and a production application with a minimum of 25 verified external users — the same metric standard as Project 4. At least one documented investor engagement (pitch email, call, or meeting — redact personally identifiable information in the pull request) is required. The application may be built in any repository; pass-gate tracking is conducted through a merged proof-of-work pull request to `{repo}` containing deck paths, application URL, and metrics. This work runs inside the week 6 sprint.',
    voteWeek: false,
    schedule: {
      submissionOpens: '2026-08-13T13:00:00.000Z',
      submissionCloses: '2026-08-19T21:00:00.000Z',
    },
    expectations: [
      'Venture documentation and application — submit proof via merged pull request to `{repo}`',
      'At least one investor engagement documented in the pull request',
      'Same external user metric standard as the learning application project',
    ],
    submission: {
      repoPattern: '{repo}',
      prTitle: '[P2-Venture] Submission — {handle}',
      prBodyMustInclude: [
        'Investor deck link (in repo)',
        'Business plan path',
        'App URL + user metrics',
        'Investor touch log (redact PII)',
      ],
      deadlineNote: 'Pull request merged by Wednesday week 6, 17:00 Eastern Time',
    },
    passGate: ['≥25 users', '≥1 investor touch', 'Complete doc set in repo'],
  },
  {
    slug: 'phase-2-open-source',
    phase: 'phase-2',
    phaseLabel: 'Project 6 · Week 6',
    title: 'Open source contribution',
    weeks: 'Week 6',
    summary:
      'Contribute at least one merged pull request to a qualified open-source project, tracked through the final sprint.',
    description:
      'Participants contribute to established open-source projects following standard professional practice: select an upstream repository, submit a pull request, and obtain a merge. Progress is tracked through a pull request to `{repo}` linking upstream work.\n\n**Suggested starting targets** (suitable for an early contribution while working toward larger repositories):\n- [cursorboston.com](https://cursorboston.com) — community site with a graphical interface; suitable for a first merge\n- [algorithmacy.org](https://algorithmacy.org) — research and education project; contributions may include documentation, server-side code, or repository-only work\n\nParticipants may also target major repositories (≥1,000 stars) or staff-approved equivalents. Contributions to libraries, command-line tools, APIs, and research repositories are accepted. The pass gate requires one merged upstream pull request before the pilot closes.',
    voteWeek: false,
    schedule: {
      submissionOpens: '2026-08-13T13:00:00.000Z',
      submissionCloses: '2026-08-19T21:00:00.000Z',
    },
    expectations: [
      'Open tracking pull request in `{repo}` linking upstream repository and pull request',
      'cursorboston.com and algorithmacy.org are suggested starting targets for an early merge',
      'Upstream contributions may be graphical, server-side, command-line, or documentation — follow the repository\'s contribution model',
      'Update tracking pull request when upstream merge is confirmed',
    ],
    submission: {
      repoPattern: '{repo}',
      prTitle: '[P2-OSS] Tracking — {handle}',
      prBodyMustInclude: [
        'Upstream repo URL',
        'Upstream PR URL',
        'Merge status',
        'Contribution summary',
      ],
      deadlineNote: 'Upstream merge required by Wednesday week 6, 17:00 Eastern Time',
    },
    passGate: ['≥1 merged upstream PR in qualified repo'],
  },
];

export function getProject(slug: string): ProgramProject | undefined {
  return programProjects.find((p) => p.slug === slug);
}
