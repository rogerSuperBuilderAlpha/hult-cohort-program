export type GitHubIssue = {
  number: number;
  title: string;
  html_url: string;
  labels: string[];
};

export async function fetchGoodFirstIssues(): Promise<GitHubIssue[]> {
  const repo = process.env.GITHUB_ISSUES_REPO?.trim() ?? 'ryanroper79-alt/hult-cohort-program';
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'hult-cohort-showcase',
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/issues?labels=good-first-issue&state=open&per_page=10`,
      { headers, next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      number: number;
      title: string;
      html_url: string;
      labels: Array<{ name: string }>;
      pull_request?: unknown;
    }>;
    return data
      .filter((item) => !item.pull_request)
      .map((item) => ({
        number: item.number,
        title: item.title,
        html_url: item.html_url,
        labels: item.labels.map((l) => l.name),
      }));
  } catch {
    return [];
  }
}

export const goodFirstIssuesFallbackUrl =
  'https://github.com/ryanroper79-alt/hult-cohort-program/issues?q=label%3Agood-first-issue+is%3Aopen';
