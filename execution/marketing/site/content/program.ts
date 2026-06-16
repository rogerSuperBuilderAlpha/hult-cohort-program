/**
 * Messaging standards (canonical vocabulary for participant-facing copy):
 * - "Review week" (not "vote week") for Phase 1 contest mechanics
 * - Always pair "review → vote": file a written GitHub review, then cast a private 👍/👎
 * - "Peer" (not "classmate"); "required" (not "mandatory")
 * - Post-admission state: "Enrolled" (admission moment only on /apply)
 * - Money: ~$400/mo tooling; ~$1,600 (~4 months) combined
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
    title: 'Agent setup, GitHub workflow, tooling',
    weeks: 'Week 1',
    summary:
      'Verify tooling, learn the PR loop, and complete bootstrap work on Discord before cohort-owned platforms exist.',
    description:
      'Week 1 is setup — not a build contest. You confirm Cursor + Claude Code, accept your GitHub org invite, and complete your first PR in the cohort roster repo. After the refund window closes, the roster locks and Phase 1 begins.',
    voteWeek: false,
    schedule: {
      submissionOpens: '2026-09-08T12:00:00.000Z',
      submissionCloses: '2026-09-12T21:00:00.000Z',
    },
    expectations: [
      'Cursor + Claude Code active (~$400/mo combined)',
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
    phaseLabel: 'Project 1 · Weeks 2–4',
    title: 'Project management platform',
    weeks: 'Weeks 2–4',
    summary:
      'Build the PM tool the entire cohort will use to track projects, tasks, and assignments for the rest of the semester.',
    description:
      'Every student builds their own production project-management platform in `pm-{handle}`. The winner becomes the live system the cohort runs on — real accounts for every enrolled student, real projects, real deadlines. You are not building a demo for a portfolio; you are building infrastructure your peers will depend on. After review week, the repo with the most private 👍 votes operates the cohort PM stack until Phase 2.',
    voteWeek: true,
    schedule: {
      submissionOpens: '2026-09-15T12:00:00.000Z',
      submissionCloses: '2026-10-02T21:00:00.000Z',
      reviewOpens: '2026-10-02T21:00:00.000Z',
      reviewCloses: '2026-10-03T18:00:00.000Z',
    },
    expectations: [
      'Build solo in public repo `pm-{handle}` in the cohort org',
      'Deploy to production HTTPS before deadline',
      'Support all enrolled accounts, projects, tasks, assignments, status workflow',
      'File a written review (GitHub issue) on each peer repo, then cast a private 👍 or 👎 vote',
      'Winner = repo with the most thumbs up after review week',
      'Votes unlock only after your written review is on file for that peer',
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
      deadlineNote: 'PR merged to main by Thu week 4, 17:00 — unmerged PRs ineligible for review week',
    },
    reviews: {
      artifact: 'Written review (GitHub issue) `Review by @{you}` on each peer repo, then private 👍/👎 here',
      dueNote: 'Fri week 4, 14:00',
    },
    passGate: [
      'Submission PR merged or eligible miss documented',
      '{peerCount}/{peerCount} written reviews',
      '{peerCount}/{peerCount} private votes',
    ],
  },
  {
    slug: 'phase-1-project-2',
    phase: 'phase-1',
    phaseLabel: 'Project 2 · Weeks 5–6',
    title: 'Internal comms platform',
    weeks: 'Weeks 5–6',
    summary:
      'Build how the cohort communicates as a group — replacing Discord with a production comms stack you own.',
    description:
      'Discord gets you through week 1. Project 2 is the comms platform the cohort actually lives in: channels, DMs, notifications, or async threads — your design, but it must work for every enrolled student. Integrate with the winning PM platform where it makes sense (deep links, shared auth, task notifications). Winner operates cohort comms for the rest of the semester.',
    voteWeek: true,
    schedule: {
      submissionOpens: '2026-10-06T12:00:00.000Z',
      submissionCloses: '2026-10-16T21:00:00.000Z',
      reviewOpens: '2026-10-16T21:00:00.000Z',
      reviewCloses: '2026-10-17T18:00:00.000Z',
    },
    expectations: [
      'Build in `comms-{handle}`; integrate with winning PM platform where sensible',
      'Real-time or async comms for all enrolled users',
      'File a written review (GitHub issue) on each peer, then cast a private 👍/👎 vote (most 👍 wins)',
    ],
    submission: {
      repoPattern: '{org}/comms-{handle}',
      prTitle: '[Project 2] Submission — {handle}',
      prBodyMustInclude: ['Production URL', 'PM platform integration notes', 'Agent usage'],
      deadlineNote: 'PR merged by Thu week 6, 17:00',
    },
    reviews: {
      artifact: 'Written review (GitHub issue) per peer, then private 👍/👎',
      dueNote: 'Fri week 6, 14:00',
    },
    passGate: [
      'Merged submission PR',
      '{peerCount}/{peerCount} written reviews',
      '{peerCount}/{peerCount} private votes',
    ],
  },
  {
    slug: 'phase-1-project-3',
    phase: 'phase-1',
    phaseLabel: 'Project 3 · Weeks 7–8',
    title: 'Public showcase platform',
    weeks: 'Weeks 7–8',
    summary:
      'Build the public-facing website that promotes the cohort to hiring partners and the world.',
    description:
      'This is the cohort’s storefront. Every student gets a public profile linking their GitHub trail, projects, and deploy URLs. Hiring partners browse here before week-16 showcase. Winner operates the public showcase — the face of the cohort outside the org. Profiles must cover every enrolled member; partner-facing README and sample URLs required in your submission PR.',
    voteWeek: true,
    schedule: {
      submissionOpens: '2026-10-20T12:00:00.000Z',
      submissionCloses: '2026-10-30T21:00:00.000Z',
      reviewOpens: '2026-10-30T21:00:00.000Z',
      reviewCloses: '2026-10-31T18:00:00.000Z',
    },
    expectations: [
      'Build in `showcase-{handle}`',
      'Public profiles linking GitHub trail for every cohort member',
      'Written review (GitHub issue) + private vote per peer; most 👍 wins',
    ],
    submission: {
      repoPattern: '{org}/showcase-{handle}',
      prTitle: '[Project 3] Submission — {handle}',
      prBodyMustInclude: ['Production URL', 'Sample profile URLs', 'Partner-facing README'],
      deadlineNote: 'PR merged by Thu week 8, 17:00',
    },
    reviews: {
      artifact: 'Written review (GitHub issue) per peer, then private 👍/👎',
      dueNote: 'Fri week 8, 14:00',
    },
    passGate: [
      'Merged submission PR',
      '{peerCount}/{peerCount} written reviews',
      '{peerCount}/{peerCount} private votes',
    ],
  },
  {
    slug: 'phase-1-unification',
    phase: 'phase-1',
    phaseLabel: 'Phase 1 · Unification',
    title: 'Ecosystem unification',
    weeks: 'Week 8',
    summary: 'Three winners merge PM + comms + showcase into one linked ecosystem.',
    description:
      'The three Phase 1 winners collaborate to unify PM, comms, and showcase into a single linked ecosystem — shared navigation, SSO or deep links, and a cutover plan for the rest of the cohort. Everyone else contributes PRs to the winning platforms as developer/users.',
    voteWeek: false,
    schedule: {
      submissionOpens: '2026-10-27T12:00:00.000Z',
      submissionCloses: '2026-11-07T21:00:00.000Z',
    },
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
    phaseLabel: 'Project 4 · Weeks 9–11',
    title: 'Learning application',
    weeks: 'Weeks 9–11',
    summary:
      'Build a learning app that helps real people learn a topic you choose — success is measured by external users.',
    description:
      'Pick any topic — algorithms, finance, language, interview prep — and ship a production learning app registered on the Ludwitt/Hult platform. The bar is real usage: ≥25 external users counted by the platform API on deadline day, not self-reported numbers. Promote it; the market judges whether anyone actually learns from what you built.',
    voteWeek: false,
    schedule: {
      submissionOpens: '2026-11-10T12:00:00.000Z',
      submissionCloses: '2026-11-21T22:00:00.000Z',
    },
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
    phaseLabel: 'Project 5 · Weeks 12–15',
    title: 'Startup venture',
    weeks: 'Weeks 12–15',
    summary:
      'Full startup package: investor deck, business plan, and a production-grade platform ready for real users.',
    description:
      'Treat this like founding a company. Market research, business plan, investor materials, and a production app with ≥25 real users — same metrics bar as Project 4. Document at least one investor touch (pitch email, call, or meeting — redact PII in your PR). The repo is `venture-{handle}`; everything lives in GitHub, not a slide deck sent over email.',
    voteWeek: false,
    schedule: {
      submissionOpens: '2026-12-01T12:00:00.000Z',
      submissionCloses: '2026-12-18T22:00:00.000Z',
    },
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
    phaseLabel: 'Project 6 · Weeks 9–16',
    title: 'Open source contribution',
    weeks: 'Weeks 9–16 (continuous)',
    summary:
      'Get at least one PR merged into a qualified open-source project — tracked via a cohort tracking PR.',
    description:
      'Contribute to open source the way professionals do: pick an upstream repo, open a real PR, get it merged. Track progress in `oss-{handle}` in the cohort org with links to your upstream PR.\n\n**Starter targets** (good while you work toward larger platforms):\n- [cursorboston.com](https://cursorboston.com) — community site with a GUI; approachable first merge\n- [algorithmacy.org](https://algorithmacy.org) — research/education project; contributions may be docs, server-side code, or repo-only — not everything has a web UI\n\nYou can also target major repos (≥1k stars) or staff-approved equivalents. Not all open source is a website: libraries, CLIs, APIs, and research repos count. The pass gate is one merged upstream PR before cohort end.',
    voteWeek: false,
    schedule: {
      submissionOpens: '2026-11-10T12:00:00.000Z',
      submissionCloses: '2026-12-18T22:00:00.000Z',
    },
    expectations: [
      'Open tracking PR in cohort org linking upstream repo + PR',
      'Consider cursorboston.com or algorithmacy.org for an early merge while pursuing larger targets',
      'Upstream may be GUI, server-side, CLI, or docs-only — match the repo’s contribution model',
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
