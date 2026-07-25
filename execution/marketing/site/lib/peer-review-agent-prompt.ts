import type { ProgramProject } from '@/content/program';
import type { CohortStats } from './cohort-stats-types';
import { cohortId, cohortSubmissionRepo, projectBranch } from './cohort-config';
import { cohortRepoUrl } from './github-urls';
import { reviewIssueTitle } from './written-reviews-format';

function resolveCohortId(stats?: CohortStats | null): string {
  return stats?.cohortId?.trim() || cohortId();
}

/**
 * Reviewer-side agent harness prompt for review week. The participant pastes
 * this into Cursor / Claude Code; the agent then either reviews a single repo
 * they name, or auto-discovers every merged submission and drafts a filed-ready
 * GitHub review issue (with optional `Vote: up`) for each one.
 */
export function buildPeerReviewAgentPrompt(
  project: ProgramProject,
  handle: string,
  _org: string,
  stats?: CohortStats | null,
  reviewTarget?: number | null
): string {
  const repo = cohortSubmissionRepo();
  const activeCohortId = resolveCohortId(stats);
  const baseBranch = projectBranch(activeCohortId, project.slug);
  const titleExample = reviewIssueTitle(handle, 'peer-handle');
  const reviewCount =
    typeof reviewTarget === 'number' && reviewTarget > 0
      ? `${reviewTarget} peers (everyone with a merged submission except you)`
      : 'every peer with a merged submission (not yourself)';

  const lines: string[] = [
    `You are my peer-review agent for the Hult Cohort Developer Program — ${project.phaseLabel}: ${project.title}, review week.`,
    ``,
    `## Goal of these reviews`,
    `A peer review does two things at once, and you must respect both:`,
    `1. **Feedback** — a genuinely useful written critique that helps the builder improve their product. Cite specific files and describe what you actually saw when you ran it.`,
    `2. **A vote** — the review issue is also the ballot. Adding \`Vote: up\` in the issue body upvotes that submission; leaving it out abstains. There are NO downvotes. The submission with the most upvotes wins and operates the platform for the cohort.`,
    `Write reviews you would be proud to have public — they are, on GitHub, under my name (\`@${handle}\`).`,
    ``,
    `## My identity (do not change these)`,
    `- My GitHub handle: \`${handle}\` — I must be signed into GitHub / \`gh\` as this account for a review to count.`,
    `- Cohort repo (submissions live here): \`${repo}\` — ${cohortRepoUrl()}`,
    `- Submissions branch: \`${baseBranch}\``,
    `- I must review: ${reviewCount}. I cannot review or vote on my own submission.`,
    ``,
    `## Step 1 — ask me which mode I want`,
    `Ask me to pick ONE, then proceed:`,
    `- **(A) One peer** — I give you a GitHub repo (or a handle). You review just that one.`,
    `- **(B) All peers (batch)** — you discover every merged submission yourself (Step 2), review each, and hand me a list of ready-to-file review issues.`,
    `- **(C) All peers, and post them for me** — same as B, but after I approve the drafts you create the issues on GitHub via \`gh\` on my behalf.`,
    `If I pick A, also ask me for the repo/handle now. If I pick B or C, go straight to Step 2.`,
    ``,
    `## Step 2 — discover the submissions (modes B and C)`,
    `Enumerate the submission files on the cohort repo, then resolve each peer's app repo + live URL:`,
    `- List \`submissions/\` on branch \`${baseBranch}\` of \`${repo}\`. Prefer \`gh\`:`,
    `  \`gh api "repos/${repo}/contents/submissions?ref=${baseBranch}" -q '.[].name'\``,
    `  (No \`gh\`? Fetch the same via the GitHub web UI / raw contents API.)`,
    `- Each file is named for a participant handle (e.g. \`someones-handle-project-1.md\`). Read each file — it contains that peer's **app repository URL** and **production URL**. Skip my own file (\`${handle}\`).`,
    `- Build a working list: \`{ handle, appRepo, productionUrl, submissionFile }\`. Show it to me before reviewing so I can trim it.`,
    ``,
    `## Step 3 — review each peer`,
    `For every peer on the list (or the single one in mode A):`,
    `1. **Run the product.** Open the production URL; sign up / sign in; exercise the core flow (for a PM platform: create a project, create a task, assign it, move it across statuses, filter the list). Note what worked and what broke.`,
    `2. **Read the code.** Clone or browse the app repo. Read the README and the key source files. Cite real paths in your notes.`,
    `3. **Score the rubric** honestly (1–5 each): Production readiness, Core functionality, Code quality, Ecosystem thinking, UX / polish. Total out of 25.`,
    `4. **Draft the review issue** using the exact template in Step 4.`,
    `Do not fabricate anything — if the deploy is down or you cannot run a flow, say so plainly in the review instead of inventing a result.`,
    ``,
    `## Step 4 — the review issue (exact format)`,
    `File the issue **on the peer's app repository** (the one linked in their submission), NOT on the cohort monorepo.`,
    `- **Title (do not deviate — the platform matches this pattern exactly):**`,
    `  \`${titleExample}\`  → replace \`peer-handle\` with the peer's GitHub handle, keep \`@${handle}\` as the reviewer.`,
    `- **Body template:**`,
    `\`\`\`markdown`,
    `## ${titleExample}`,
    `**Deployment tested:** yes/no — URL: <their production URL>`,
    `**Time spent:** ~X min`,
    ``,
    `### Repo exploration (cite files)`,
    `- \`path/to/file\`: what you observed`,
    ``,
    `### Rubric`,
    `| Dimension | Score (1-5) | Note |`,
    `|-----------|-------------|------|`,
    `| Production readiness | | |`,
    `| Core functionality | | |`,
    `| Code quality | | |`,
    `| Ecosystem thinking | | |`,
    `| UX / polish | | |`,
    `| **Total** | /25 | |`,
    ``,
    `### One actionable suggestion`,
    ``,
    `### Recommendation`,
    `merge-ready / needs-work / incoherent`,
    ``,
    `## Vote (optional)`,
    `Keep the next line to upvote this submission, or delete this whole section to abstain.`,
    ``,
    `Vote: up`,
    `\`\`\``,
    `**The vote line matters:** to upvote, keep \`Vote: up\` on its very own line. To abstain, delete the entire "Vote (optional)" section. Never add a "Vote: down" — downvotes do not exist and will be ignored.`,
    ``,
    `## Step 5 — deliver`,
    `- **Mode A / B:** return each review as (1) the exact issue title, (2) the full issue body, and (3) a one-click "new issue" link of the form`,
    `  \`https://github.com/<peer-app-repo>/issues/new?title=<url-encoded-title>&body=<url-encoded-body>\``,
    `  so I can open it pre-filled, eyeball it, and click "Submit new issue". I must be signed into GitHub as \`@${handle}\`.`,
    `- **Mode C:** after I approve the drafts, create each issue with`,
    `  \`gh issue create --repo <peer-app-repo> --title "<title>" --body-file <file>\``,
    `  using my authenticated \`gh\`. Print the resulting issue URLs. Never edit or close a peer's other issues.`,
    ``,
    `## Rules`,
    `- Only ever touch peer repositories to CREATE my review issue — no PRs, no edits to their code, no closing issues.`,
    `- One issue per peer. If I re-run, update the draft rather than filing duplicates.`,
    `- Keep every review specific and honest. A one-line "looks good" is not a review and will not earn goodwill or upvotes back.`,
    ``,
    `Start with Step 1: ask me which mode I want.`,
  ];

  return lines.join('\n');
}

export function buildPublicPeerReviewAgentPrompt(
  project: ProgramProject,
  stats?: CohortStats | null
): string {
  return buildPeerReviewAgentPrompt(project, '{handle}', '{org}', stats);
}
