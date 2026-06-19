/** Project slugs — keep in sync with content/program.ts */

export const PROJECT_SLUGS = [
  'onboarding',
  'phase-1-project-1',
  'phase-1-project-2',
  'phase-1-project-3',
  'phase-1-unification',
  'phase-2-learning-app',
  'phase-2-venture',
  'phase-2-open-source',
];

export const SEED_PROJECTS = [
  { slug: 'onboarding', prTitle: (h) => `[Onboarding] Tooling checklist — ${h}`, ballot: false },
  { slug: 'phase-1-project-1', prTitle: (h) => `[Project 1] Submission — ${h}`, ballot: true },
  { slug: 'phase-1-project-2', prTitle: (h) => `[Project 2] Submission — ${h}`, ballot: true },
  { slug: 'phase-1-project-3', prTitle: (h) => `[Project 3] Submission — ${h}`, ballot: true },
  { slug: 'phase-2-learning-app', prTitle: (h) => `[P2-L1] Submission — ${h}`, ballot: false },
  { slug: 'phase-2-venture', prTitle: (h) => `[P2-Venture] Submission — ${h}`, ballot: false },
  { slug: 'phase-2-open-source', prTitle: (h) => `[P2-OSS] Tracking — ${h}`, ballot: false },
];
