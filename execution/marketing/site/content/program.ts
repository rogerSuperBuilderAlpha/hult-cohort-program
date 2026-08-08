/**
 * Messaging standards (canonical vocabulary for participant-facing copy):
 * - "Review week" (not "vote week") for Phase 1 assessment mechanics
 * - Review on GitHub; optional public Vote: up in the same issue (or abstain)
 * - "Peer" (not "classmate"); "required" (not "mandatory")
 * - Post-admission state: "Enrolled" (admission moment only on /apply)
 * - Money: ~$400/mo tooling; ~$800 (~2 months) combined for the Summer Pilot
 * - Tone: serious, professional, academic — no sales language or insider jargon
 *
 * Summer Pilot 2026 week map (source of truth):
 * 1 PM platform · 2 Comms · 3 Vibe marketing · 4 Ludwitt learning · 5 Startup · 6 OSS swarm
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
    /** Target branch for merged submission PRs (derived from cohort + slug at runtime). */
    baseBranchPattern: string;
    /** Participant working branch pattern (derived from cohort + slug + handle). */
    headBranchPattern: string;
    prBodyMustInclude: string[];
    deadlineNote: string;
  };
  reviews?: {
    artifact: string;
    dueNote: string;
  };
  passGate: string[];
};

/**
 * Six sequential weeks. Cohort start Mon Jul 13, 2026 (ET).
 * Vote weeks: merge by Sunday 17:00 ET; review window through Monday 17:00 ET.
 */
export const programProjects: ProgramProject[] = [
  {
    slug: 'phase-1-project-1',
    phase: 'phase-1',
    phaseLabel: 'Week 1 · Project management',
    title: 'Project management platform',
    weeks: 'Week 1',
    summary:
      'Build the project management platform the cohort will use to track work, deadlines, and motivation for the rest of the pilot.',
    description:
      'Week 1 is the first contest. Each participant builds and deploys a production project management platform in one week. Motivation is the key variable: the system must be a solid snapshot of where someone — and the cohort — stands, and it must inspire people to work hard and deliver their best. The selected submission becomes live cohort infrastructure. Non-winners contribute pull requests to the winning build in later weeks.',
    voteWeek: true,
    schedule: {
      submissionOpens: '2026-07-13T13:00:00.000Z',
      submissionCloses: '2026-07-19T21:00:00.000Z',
      reviewOpens: '2026-07-19T21:00:00.000Z',
      /** Mon Jul 20, 2026 · 17:00 Eastern — aligned with participant comms (was 14:00 ET / closed early). */
      reviewCloses: '2026-07-20T21:00:00.000Z',
    },
    expectations: [
      'Cursor and Claude Code active (~$400/mo); Expectations Acknowledgment signed on the dashboard',
      'Build individually; deploy to production over HTTPS before the deadline',
      'Design for motivation — progress visibility, clear next actions, and signals that make people want to ship',
      'Ship multi-user auth and project/task workflows sized for the enrolled cohort (capacity — you do not need real cohort signups before merging)',
      'File a written technical review on each peer submission (optional Vote: up in the issue, or abstain)',
      'The submission with the most votes after review closes operates the cohort PM stack',
      'Non-winners contribute fixes and improvements to the winning platform',
    ],
    submission: {
      repoPattern: '{repo}',
      prTitle: '[Project 1] Submission — {handle}',
      baseBranchPattern: 'projects/{cohortId}/{slug}',
      headBranchPattern: 'participants/{cohortId}/{slug}/{handle}',
      prBodyMustInclude: [
        'Production URL',
        'Setup steps verified on fresh clone',
        'Architecture summary',
        'Motivation / engagement design notes',
        'Known limitations',
        'Agent usage summary',
      ],
      deadlineNote:
        'Merge bar: fill every required PR body section below, then merge by Sunday week 1, 17:00 Eastern Time. You do not need real cohort signups first — unmerged PRs are ineligible for review.',
    },
    reviews: {
      artifact:
        'Written technical review on each peer submission (GitHub issue); optional Vote: up or abstain',
      dueNote: 'Monday week 2, 17:00 Eastern Time (review window closes)',
    },
    passGate: [
      'Submission pull request merged or eligible miss documented',
      '{peerCount}/{peerCount} written reviews',
      'Optional upvotes via Vote: up in each review issue (abstain allowed)',
    ],
  },
  {
    slug: 'phase-1-project-2',
    phase: 'phase-1',
    phaseLabel: 'Week 2 · Internal communications',
    title: 'Internal communications platform',
    weeks: 'Week 2',
    summary:
      'Build the internal communications platform that replaces Discord as the cohort\'s primary channel.',
    description:
      'Week 2 contest: a production communications platform for the cohort — channels, direct messages, notifications, or asynchronous threads. It must support every enrolled participant and integrate with the selected project management platform where appropriate (deep links, shared authentication, task notifications). The winning submission operates cohort communications for the remainder of the pilot.',
    voteWeek: true,
    schedule: {
      submissionOpens: '2026-07-20T13:00:00.000Z',
      submissionCloses: '2026-07-26T21:00:00.000Z',
      reviewOpens: '2026-07-26T21:00:00.000Z',
      /** Mon Jul 27, 2026 · 17:00 Eastern — reviews close 17:00 ET, not 14:00 (matches Project 1). */
      reviewCloses: '2026-07-27T21:00:00.000Z',
    },
    expectations: [
      'Build and deploy a communications platform; integrate with the winning PM platform where appropriate',
      'Ship multi-user messaging sized for the enrolled cohort (capacity — you do not need real cohort signups before merging)',
      'File a written technical review on each peer submission (optional Vote: up in the issue, or abstain)',
      'Non-winners contribute to the winning communications platform',
    ],
    submission: {
      repoPattern: '{repo}',
      prTitle: '[Project 2] Submission — {handle}',
      baseBranchPattern: 'projects/{cohortId}/{slug}',
      headBranchPattern: 'participants/{cohortId}/{slug}/{handle}',
      prBodyMustInclude: ['Production URL', 'PM platform integration notes', 'Agent usage'],
      deadlineNote:
        'Merge bar: fill every required PR body section, then merge by Sunday week 2, 17:00 Eastern Time. No real cohort signup quota before merge.',
    },
    reviews: {
      artifact:
        'Written technical review per peer (GitHub issue); optional Vote: up or abstain',
      dueNote: 'Monday week 3, 17:00 Eastern Time (review window closes)',
    },
    passGate: [
      'Merged submission pull request',
      '{peerCount}/{peerCount} written reviews',
      'Optional upvotes via Vote: up in each review issue (abstain allowed)',
    ],
  },
  {
    slug: 'phase-1-project-3',
    phase: 'phase-1',
    phaseLabel: 'Week 3 · Vibe marketing',
    title: 'Vibe marketing platform',
    weeks: 'Week 3',
    summary:
      'Build a vibe marketing platform that presents the cohort — and each participant\'s work — with energy that attracts attention and partners.',
    description:
      'Week 3 contest: a public-facing vibe marketing platform for the cohort. This is not a dry portfolio dump — it should make the work feel alive, credible, and worth following. Include participant profiles, project evidence, deployment links, and partner-facing narrative. The winning submission becomes the cohort\'s public marketing surface for the rest of the pilot.',
    voteWeek: true,
    schedule: {
      submissionOpens: '2026-07-27T13:00:00.000Z',
      submissionCloses: '2026-08-02T21:00:00.000Z',
      reviewOpens: '2026-08-02T21:00:00.000Z',
      reviewCloses: '2026-08-03T21:00:00.000Z',
    },
    expectations: [
      'Ship a production marketing site with strong visual and narrative vibe',
      'Profiles and project evidence for enrolled participants (placeholders OK at merge if roster still filling)',
      'Partner-facing documentation and clear calls to engage',
      'Written technical review on each peer submission (optional Vote: up, or abstain)',
    ],
    submission: {
      repoPattern: '{repo}',
      prTitle: '[Project 3] Submission — {handle}',
      baseBranchPattern: 'projects/{cohortId}/{slug}',
      headBranchPattern: 'participants/{cohortId}/{slug}/{handle}',
      prBodyMustInclude: [
        'Production URL',
        'Sample profile URLs',
        'Vibe / positioning notes',
        'Partner-facing README',
      ],
      deadlineNote:
        'Merge bar: fill every required PR body section, then merge by Sunday week 3, 17:00 Eastern Time. No signup quota before merge.',
    },
    reviews: {
      artifact:
        'Written technical review per peer (GitHub issue); optional Vote: up or abstain',
      dueNote: 'Monday week 4, 17:00 Eastern Time (review window closes)',
    },
    passGate: [
      'Merged submission pull request',
      '{peerCount}/{peerCount} written reviews',
      'Optional upvotes via Vote: up in each review issue (abstain allowed)',
    ],
  },
  {
    slug: 'phase-2-learning-app',
    phase: 'phase-2',
    phaseLabel: 'Week 4 · Ludwitt learning',
    title: 'Learning engineer integration to Ludwitt',
    weeks: 'Week 4',
    summary:
      'Build a learning application and integrate it with Ludwitt; success is a working, registered, instrumented app.',
    description:
      'Week 4: act as a learning engineer. Choose a subject — algorithms, finance, language, interview prep, or another topic — and ship a production learning application registered on the Ludwitt/Hult platform. Two integration routes are accepted, and they work differently. The hosted platform at ludwitt.com/developers (same portal as pitchrise.ludwitt.com) uses OAuth 2.0 with PKCE: users sign in with their Ludwitt account, and your app reads them back from the userinfo endpoint. The reference implementation in execution/ludwitt-hult-api uses an HS256 launch token passed to your /launch route. Wire whichever one you registered against, and make sure sessions produce real events. If the hosted portal will not open for you, that is the ALC unlock gate — Ludwitt gates /developers behind its Developer Training track, and it also offers a paid bypass that nobody here should buy; use the reference API instead and say so in your pull request. Note also that Ludwitt publishes no public app directory, so "production listing URL" means your own deployed app URL. The week 4 bar is the integration itself: a registered app, a working sign-in or launch flow, and events landing. There is no user-count condition on this week — external adoption is measured later in the program, from the platform snapshot, and is not something you must clear to merge on Sunday.',
    voteWeek: false,
    schedule: {
      submissionOpens: '2026-08-03T13:00:00.000Z',
      submissionCloses: '2026-08-09T21:00:00.000Z',
    },
    expectations: [
      'Register the application — hosted portal at ludwitt.com/developers (OAuth 2.0 + PKCE), or your own instance of the reference API (HS256 launch token). Both count.',
      'Verify the integration end to end — a real sign-in or launch token completes, invalid ones fail closed, and at least one non-heartbeat event lands per session',
      'Submit a proof-of-work pull request with the app ID and listing URL filled in the PR template',
    ],
    submission: {
      repoPattern: '{repo}',
      prTitle: '[P2-L1] Submission — {handle}',
      baseBranchPattern: 'projects/{cohortId}/{slug}',
      headBranchPattern: 'participants/{cohortId}/{slug}/{handle}',
      prBodyMustInclude: [
        'Ludwitt/Hult app ID',
        'Production listing URL',
        'Integration evidence (sign-in or launch flow + events firing)',
      ],
      deadlineNote:
        'Merge bar: fill every required PR body section, then merge by Sunday week 4, 17:00 Eastern Time. No user-count condition applies to this merge — a registered, working, instrumented app is the bar.',
    },
    passGate: [
      'Registered Ludwitt/Hult app with a working sign-in or launch flow and event tracking',
      'Merged proof-of-work pull request',
    ],
  },
  {
    slug: 'phase-2-venture',
    phase: 'phase-2',
    phaseLabel: 'Week 5 · Startup',
    title: 'Startup / entrepreneurship',
    weeks: 'Week 5',
    summary:
      'Ship a venture package: investor materials, business plan, and a production application with external-user evidence.',
    description:
      'Week 5: entrepreneurship sprint. Prepare a venture as you would for a real startup — market research, business plan, investor materials, and a production application with ≥25 verified external users. Document at least one investor engagement (pitch email, call, or meeting — redact PII in the pull request). Track pass-gate evidence through a merged proof-of-work pull request to `{repo}`.',
    voteWeek: false,
    schedule: {
      submissionOpens: '2026-08-10T13:00:00.000Z',
      submissionCloses: '2026-08-16T21:00:00.000Z',
    },
    expectations: [
      'Venture documentation and production application — proof via merged pull request to `{repo}`',
      'At least one investor engagement documented in the pull request',
      '≥25 qualified external users on the platform snapshot — cohort members and user ids containing your own handle do not count',
    ],
    submission: {
      repoPattern: '{repo}',
      prTitle: '[P2-Venture] Submission — {handle}',
      baseBranchPattern: 'projects/{cohortId}/{slug}',
      headBranchPattern: 'participants/{cohortId}/{slug}/{handle}',
      prBodyMustInclude: [
        'Investor deck link (in repo)',
        'Business plan path',
        'App URL + user metrics',
        'Investor touch log (redact PII)',
      ],
      deadlineNote: 'Pull request merged by Sunday week 5, 17:00 Eastern Time',
    },
    passGate: ['≥25 users', '≥1 investor touch', 'Complete doc set in repo'],
  },
  {
    slug: 'phase-2-open-source',
    phase: 'phase-2',
    phaseLabel: 'Week 6 · Open source swarm',
    title: 'Open source swarm',
    weeks: 'Week 6',
    summary:
      'Contribute as a swarm: land at least one merged pull request in a qualified open-source project before pilot end.',
    description:
      'Week 6: open source swarm. Select an upstream repository, submit a pull request, and get it merged. Track progress through a pull request to `{repo}` linking upstream work.\n\n**Suggested starting targets:**\n- [cursorboston.com](https://cursorboston.com) — community site; suitable for a first merge\n- [algorithmacy.org](https://algorithmacy.org) — research and education; docs, server-side, or repo-only work\n\nYou may also target major repositories (≥1,000 stars) or staff-approved equivalents. The pass gate is one merged upstream pull request before the pilot closes.',
    voteWeek: false,
    schedule: {
      submissionOpens: '2026-08-17T13:00:00.000Z',
      submissionCloses: '2026-08-23T21:00:00.000Z',
    },
    expectations: [
      'Open a tracking pull request in `{repo}` linking the upstream repository and pull request',
      'cursorboston.com and algorithmacy.org are suggested starting targets for an early merge',
      'Upstream contributions may be UI, server-side, CLI, or documentation — follow the repo\'s contribution model',
      'Update the tracking pull request when the upstream merge is confirmed',
    ],
    submission: {
      repoPattern: '{repo}',
      prTitle: '[P2-OSS] Tracking — {handle}',
      baseBranchPattern: 'projects/{cohortId}/{slug}',
      headBranchPattern: 'participants/{cohortId}/{slug}/{handle}',
      prBodyMustInclude: [
        'Upstream repo URL',
        'Upstream PR URL',
        'Merge status',
        'Contribution summary',
      ],
      deadlineNote: 'Upstream merge required by Sunday week 6, 17:00 Eastern Time',
    },
    passGate: ['≥1 merged upstream PR in qualified repo'],
  },
];

export function getProject(slug: string): ProgramProject | undefined {
  return programProjects.find((p) => p.slug === slug);
}

/** Participant-facing admissions dates (single source for marketing copy). */
export const cohortMarketing = {
  label: 'Summer 2026',
  applicationsOpen: 'June 15, 2026',
  applicationDeadline: 'July 12, 2026',
  cohortStart: 'July 13, 2026',
} as const;

/** Live cohort session — shown in the site header for accepted participants. */
export const cohortLiveSession = {
  label: 'Week 3 winner + Week 4 kickoff',
  when: 'Mon Aug 3 · 6:00 PM ET',
  zoomUrl: 'https://bentley.zoom.us/j/91058003725',
  meetingId: '910 5800 3725',
  agendaUrl: '',
} as const;
