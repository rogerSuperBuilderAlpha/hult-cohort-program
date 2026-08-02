export const runtime = 'nodejs';
export const revalidate = 300;

type Commit = {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
};

export async function GET() {
  const repo = process.env.COMMITS_REPO?.trim() ?? 'rogerSuperBuilderAlpha/hult-cohort-program';
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'hult-cohort-ship-ticker',
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=10`, {
      headers,
      next: { revalidate: 300 },
    });
    if (!res.ok) return Response.json({ commits: [] });
    const data = (await res.json()) as Array<{
      sha: string;
      commit: { message: string; author?: { name?: string }; committer?: { date?: string } };
      html_url: string;
    }>;

    const commits: Commit[] = data.map((item) => ({
      sha: item.sha,
      message: item.commit.message.split('\n')[0],
      author: item.commit.author?.name ?? 'unknown',
      date: item.commit.committer?.date ?? '',
      url: item.html_url,
    }));

    return Response.json({ commits });
  } catch {
    return Response.json({ commits: [] });
  }
}
