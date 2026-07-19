/**
 * The PM integration, behind an interface.
 *
 * "Track it" turns a commitment into a real task in a project manager and links it back to
 * the thread. The concrete backend is GitHub Issues, but everything downstream depends only
 * on this interface — so a different PM (Linear, Jira) is a new adapter, not a rewrite, and
 * tests run against an in-memory fake with no network. Server-only: the GitHub token is not a
 * NEXT_PUBLIC_ value and must never reach a browser.
 *
 * Degradation is a first-class case: with no token/repo configured, resolvePmAdapter returns
 * null and the track route still records the commitment — the task just has no external link.
 * The commitment layer must work with the PM integration entirely absent.
 */

export type PmTask = {
  /** Stable id used to correlate a webhook back to the commitment (e.g. the issue number). */
  externalId: string;
  /** Deep link a human clicks to open the task. */
  url: string;
};

export interface PmAdapter {
  readonly name: string;
  createTask(input: { title: string; body: string }): Promise<PmTask>;
}

/** GitHub Issues adapter. Needs GITHUB_TOKEN (repo scope) + GITHUB_PM_REPO ("owner/repo"). */
export class GitHubIssuesAdapter implements PmAdapter {
  readonly name = 'github';
  constructor(
    private readonly repo: string,
    private readonly token: string,
    private readonly api = 'https://api.github.com',
  ) {}

  async createTask(input: { title: string; body: string }): Promise<PmTask> {
    const res = await fetch(`${this.api}/repos/${this.repo}/issues`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `Bearer ${this.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ title: input.title, body: input.body }),
    });
    if (!res.ok) throw new Error(`github issue create failed: ${res.status}`);
    const issue = (await res.json()) as { number: number; html_url: string };
    return { externalId: String(issue.number), url: issue.html_url };
  }
}

/** Resolve the configured adapter, or null when the PM integration isn't set up. */
export function resolvePmAdapter(): PmAdapter | null {
  const repo = process.env.GITHUB_PM_REPO;
  const token = process.env.GITHUB_TOKEN;
  if (repo && token) return new GitHubIssuesAdapter(repo, token);
  return null;
}
