import type { ProgramProject } from '@/content/program';
import type { CohortStats } from './cohort-stats-types';
import { cohortOrgUrl } from './cohort-config';
import { personalizeProgramText } from './personalize-program';

function branchName(slug: string, handle: string): string {
  switch (slug) {
    case 'onboarding':
      return `onboarding/${handle}`;
    case 'phase-1-unification':
      return `integration/${handle}`;
    case 'phase-2-open-source':
      return `oss-tracking/${handle}`;
    default:
      return `submission/${handle}`;
  }
}

function extraInterviewQuestions(project: ProgramProject): string[] {
  switch (project.slug) {
    case 'onboarding':
      return [
        'Cursor + Claude Code active and billed?',
        'GitHub org invite accepted for the cohort org?',
        'Expectations Acknowledgment signed — link or doc path?',
        'Agent workflow dry-run completed — what did you run end-to-end?',
      ];
    case 'phase-1-project-1':
      return [
        'Production HTTPS URL?',
        'Stack / hosting (e.g. Vercel + Postgres)?',
        'Fresh-clone setup steps — verified on a clean machine or container?',
        'Known limitations you want called out?',
      ];
    case 'phase-1-project-2':
      return [
        'Production HTTPS URL?',
        'How does it integrate with the winning PM platform (URLs, APIs, deep links)?',
        'Real-time vs async — which did you ship?',
      ];
    case 'phase-1-project-3':
      return [
        'Production HTTPS URL?',
        'Sample profile URLs for at least 3 cohort members?',
        'Partner-facing README path in repo?',
      ];
    case 'phase-1-unification':
      return [
        'Which winning platform(s) are you integrating (PM / comms / showcase)?',
        'Demo URL showing cross-platform flow?',
        'Migration/cutover plan summary?',
      ];
    case 'phase-2-learning-app':
      return [
        'Ludwitt/Hult app ID?',
        'Production listing URL?',
        'Promotion channels used (links or names)?',
        'Date for metrics API snapshot?',
      ];
    case 'phase-2-venture':
      return [
        'Production app URL?',
        'Investor deck file path in repo?',
        'Business plan file path?',
        'Investor touch log (redact PII before paste)?',
      ];
    case 'phase-2-open-source':
      return [
        'Qualified upstream repo URL (≥1k stars or staff-approved)?',
        'Upstream PR URL?',
        'Current merge status?',
        'Contribution summary for reviewers?',
      ];
    default:
      return [];
  }
}

function workflowSteps(project: ProgramProject, handle: string, org: string): string[] {
  const repo = personalizeProgramText(project.submission.repoPattern, handle, org);
  const repoPath = repo.split(' ')[0] ?? repo;
  const branch = branchName(project.slug, handle);
  const prTitle = personalizeProgramText(project.submission.prTitle, handle, org);

  const common = [
    `Confirm I have push access to \`https://github.com/${org}\` (org invite accepted).`,
    `Repo target: \`${repoPath}\` — create it in the org if missing and I confirm.`,
    `Create branch \`${branch}\` from \`main\`.`,
  ];

  switch (project.slug) {
    case 'onboarding':
      return [
        ...common,
        `Add or update my tooling checklist (markdown) under \`participants/${handle}.md\` or as specified in the roster repo README.`,
        'Include Expectations Acknowledgment confirmation and agent workflow notes.',
        `Open PR titled \`${prTitle}\` → \`main\`.`,
        'Push branch and give me the PR URL. Do not merge unless I say so.',
      ];
    case 'phase-2-open-source':
      return [
        ...common,
        'Create tracking repo if needed; README links upstream repo + PR.',
        'Do not push to upstream — only the cohort tracking repo unless I explicitly authorize upstream PR creation.',
        `Open tracking PR titled \`${prTitle}\` → \`main\`.`,
        'Push and return PR URL.',
      ];
    case 'phase-1-unification':
      return [
        ...common,
        'Coordinate integration changes in the ecosystem-integration repo only.',
        `Open PR titled \`${prTitle}\` → \`main\`.`,
        'Push and return PR URL.',
      ];
    default:
      return [
        ...common,
        'Implement or update the project to meet pass-gate requirements.',
        'Deploy to production HTTPS if this project requires a live URL.',
        'Verify fresh-clone setup when applicable (`npm install`, env example, tests).',
        `Open submission PR titled \`${prTitle}\` → \`main\` with a complete PR body.`,
        'Push branch and give me the PR URL. Do not merge unless I say so.',
      ];
  }
}

export function buildProjectAgentPrompt(
  project: ProgramProject,
  handle: string,
  org: string,
  stats?: CohortStats | null
): string {
  const p = (text: string) => personalizeProgramText(text, handle, org, stats);
  const repo = p(project.submission.repoPattern);
  const prTitle = p(project.submission.prTitle);
  const interview = extraInterviewQuestions(project);
  const prBodyItems = project.submission.prBodyMustInclude;
  const workflow = workflowSteps(project, handle, org);

  const lines: string[] = [
    `You are my agent for the Hult Cohort Developer Program (Fall 2026).`,
    ``,
    `## Project`,
    `- **${project.phaseLabel}:** ${project.title}`,
    `- **Summary:** ${project.summary}`,
    `- **Deadline:** ${project.submission.deadlineNote}`,
    ``,
    `## Your job`,
    `1. **Interview me first** — ask for every item in "Required details" below. Do not invent URLs, metrics, or credentials.`,
    `2. **Do the work** — create/use the repo, implement or document the submission, run tests/smoke checks where applicable.`,
    `3. **Open a PR and push** — use the exact title and body structure below. Stop after opening the PR unless I explicitly ask you to merge.`,
    ``,
    `## Identity`,
    `- GitHub handle: \`${handle}\``,
    `- Cohort org: \`${org}\` (${cohortOrgUrl()})`,
    `- Repo: \`${repo}\``,
    `- PR title: \`${prTitle}\``,
    `- Branch: \`${branchName(project.slug, handle)}\``,
    ``,
    `## Required details — ask me for each, then record in the PR body`,
    ...interview.map((q, i) => `${i + 1}. ${q}`),
    ...prBodyItems.map((item, i) => `${interview.length + i + 1}. **PR body section:** ${item}`),
    ``,
    `## PR body must include these sections`,
    ...prBodyItems.map((item) => `- ${item}`),
    ``,
    `## Pass gate (submission must satisfy)`,
    ...project.passGate.map((item) => `- ${p(item)}`),
  ];

  if (project.reviews) {
    const reviewCount =
      stats && stats.enrolledCount > 0
        ? `${stats.peerReviewCount} written GitHub reviews + ${stats.peerReviewCount} private votes`
        : 'Review every peer on GitHub, then vote 👍/👎 on the platform';
    lines.push(
      ``,
      `## Peer review & vote (review week)`,
      `- ${reviewCount}`,
      `- Order: try deploy → read PR → file GitHub issue "Review by @{handle}" → then 👍/👎 here`,
      `- Votes are private; winner = most thumbs up`,
      `- Due: ${project.reviews.dueNote}`
    );
  }

  if (project.voteWeek) {
    lines.push(
      ``,
      `## Winner selection`,
      `- Winner = repo with the most thumbs up after review week closes.`,
      `- Written reviews are public on GitHub; 👍/👎 votes stay private until results.`,
      `- I cannot vote on my own submission.`
    );
  }

  lines.push(
    ``,
    `## Expectations for this project`,
    ...project.expectations.map((item) => `- ${p(item)}`),
    ``,
    `## Workflow — execute in order`,
    ...workflow.map((step, i) => `${i + 1}. ${step}`),
    ``,
    `## PR body template (fill after interviewing me)`,
    `\`\`\`markdown`,
    `## Summary`,
    `[What shipped]`,
    ``,
    ...prBodyItems.flatMap((item) => [`## ${item}`, `[Your answer]`, ``]),
    `## Agent usage`,
    `- Research: [what the agent researched]`,
    `- Dev: [what the agent implemented]`,
    `- QA: [how setup/deploy was verified]`,
    ``,
    `## Test plan`,
    `- [ ] [Smoke test checklist]`,
    `\`\`\``,
    ``,
    `Start by listing which required details you still need from me, then proceed.`
  );

  return lines.join('\n');
}

export function buildPublicAgentPrompt(
  project: ProgramProject,
  stats?: CohortStats | null
): string {
  return buildProjectAgentPrompt(project, '{handle}', '{org}', stats);
}
