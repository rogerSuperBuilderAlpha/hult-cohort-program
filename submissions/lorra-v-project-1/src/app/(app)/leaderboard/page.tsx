import Link from "next/link";
import { loadCohortData } from "@/lib/data";
import { buildIndividualStats } from "@/lib/scoring";
import { Panel } from "@/components/ui";

type SortKey = "score" | "prs" | "votes" | "contributions";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: sortRaw } = await searchParams;
  const sort = (["score", "prs", "votes", "contributions"].includes(sortRaw ?? "")
    ? sortRaw
    : "score") as SortKey;

  const data = await loadCohortData();
  const voteCounts = new Map<string, number>();
  for (const vote of data.votes) {
    voteCounts.set(vote.recipient_id, (voteCounts.get(vote.recipient_id) ?? 0) + 1);
  }

  const rows = data.profiles.map((profile) =>
    buildIndividualStats({
      profile,
      pullRequests: data.pullRequests,
      contributions: data.contributions,
      votesReceived: voteCounts.get(profile.id) ?? 0,
    }),
  );

  rows.sort((a, b) => {
    if (sort === "prs") return b.mergedPrs - a.mergedPrs;
    if (sort === "votes") return b.votesReceived - a.votesReceived;
    if (sort === "contributions") return b.contributions - a.contributions;
    return b.individualScore - a.individualScore;
  });

  const filters: { key: SortKey; label: string }[] = [
    { key: "score", label: "Score" },
    { key: "prs", label: "PRs" },
    { key: "votes", label: "Votes" },
    { key: "contributions", label: "Contributions" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Leaderboard
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Ranked by individual score (base × vote multiplier), or filter by activity.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={`/leaderboard?sort=${f.key}`}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              sort === f.key
                ? "bg-[var(--accent)] font-semibold text-[#1a1406]"
                : "border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Panel className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--line)] text-[var(--muted)]">
            <tr>
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Score</th>
              <th className="px-5 py-3 font-medium">PRs</th>
              <th className="px-5 py-3 font-medium">Votes</th>
              <th className="px-5 py-3 font-medium">Contributions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.profile.id} className="border-b border-[var(--line)] last:border-0">
                <td className="px-5 py-3 text-[var(--muted)]">{index + 1}</td>
                <td className="px-5 py-3">
                  <Link
                    href={`/profile/${row.profile.id}`}
                    className="font-medium text-[var(--accent)] hover:underline"
                  >
                    {row.profile.display_name}
                  </Link>
                </td>
                <td className="px-5 py-3 font-semibold">{row.individualScore.toFixed(1)}</td>
                <td className="px-5 py-3">{row.mergedPrs}</td>
                <td className="px-5 py-3">{row.votesReceived}</td>
                <td className="px-5 py-3">{row.contributions}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-[var(--muted)]">
                  No cohort members yet. Sign up to seed the board.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
