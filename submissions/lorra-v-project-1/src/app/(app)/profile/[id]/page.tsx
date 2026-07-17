import Link from "next/link";
import { castVote } from "@/app/actions/cohort";
import {
  badgesForLevel,
  computeCohortMetrics,
  evaluateCohortLevel,
} from "@/lib/civilization";
import { getCurrentProfile, loadCohortData } from "@/lib/data";
import { buildIndividualStats } from "@/lib/scoring";
import { Panel, buttonClass } from "@/components/ui";
import { notFound } from "next/navigation";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { id } = await params;
  const { error, ok } = await searchParams;
  const me = await getCurrentProfile();
  const data = await loadCohortData();
  const profile = data.profiles.find((p) => p.id === id);
  if (!profile) notFound();

  const votesReceived = data.votes.filter((v) => v.recipient_id === id).length;
  const stats = buildIndividualStats({
    profile,
    pullRequests: data.pullRequests,
    contributions: data.contributions,
    votesReceived,
  });
  const ownPrs = data.pullRequests.filter((pr) => pr.profile_id === id);
  const ownContributions = data.contributions.filter((c) => c.profile_id === id);

  const metrics = computeCohortMetrics(data);
  const { level } = evaluateCohortLevel(metrics);
  const badges = badgesForLevel(level);
  const isSelf = me?.id === id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            {profile.display_name}
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            {profile.github_username ? `@${profile.github_username}` : "No GitHub username set"}
          </p>
        </div>
        {isSelf ? (
          <span className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm text-[var(--muted)]">
            This is you
          </span>
        ) : (
          <form
            action={async () => {
              "use server";
              await castVote(id);
            }}
          >
            <button className={buttonClass} type="submit">
              Cast vote
            </button>
          </form>
        )}
      </div>

      {error ? (
        <p className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}
      {ok === "vote" ? (
        <p className="rounded-lg border border-[var(--success)]/40 bg-[var(--success)]/10 px-3 py-2 text-sm text-[var(--success)]">
          Vote recorded.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel>
          <p className="text-sm text-[var(--muted)]">Individual score</p>
          <p className="mt-1 text-2xl font-semibold">{stats.individualScore.toFixed(1)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            base {stats.baseScore} × {stats.voteMultiplier.toFixed(2)} votes
          </p>
        </Panel>
        <Panel>
          <p className="text-sm text-[var(--muted)]">Merged PRs</p>
          <p className="mt-1 text-2xl font-semibold">{stats.mergedPrs}</p>
        </Panel>
        <Panel>
          <p className="text-sm text-[var(--muted)]">Contributions</p>
          <p className="mt-1 text-2xl font-semibold">{stats.contributions}</p>
        </Panel>
        <Panel>
          <p className="text-sm text-[var(--muted)]">Votes received</p>
          <p className="mt-1 text-2xl font-semibold">{stats.votesReceived}</p>
        </Panel>
      </div>

      <Panel>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Level milestone badges
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Cohort-level badges (display only). Current:{" "}
          <Link href="/ascend" className="text-[var(--accent)] hover:underline">
            see gates
          </Link>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.length ? (
            badges.map((badge) => (
              <span
                key={badge}
                className="rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-1.5 text-sm text-[var(--accent)]"
              >
                {badge}
              </span>
            ))
          ) : (
            <span className="text-sm text-[var(--muted)]">No badges yet — still Pre-Level 1.</span>
          )}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold">
            Pull requests
          </h2>
          <ul className="space-y-3 text-sm">
            {ownPrs.length === 0 ? (
              <li className="text-[var(--muted)]">No PRs yet.</li>
            ) : (
              ownPrs.map((pr) => (
                <li key={pr.id} className="border-b border-[var(--line)] pb-3 last:border-0">
                  <a
                    href={pr.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[var(--accent)] hover:underline"
                  >
                    {pr.title}
                  </a>
                  <p className="text-[var(--muted)]">
                    {pr.status} · {pr.reviewer_count} reviewers
                  </p>
                </li>
              ))
            )}
          </ul>
        </Panel>
        <Panel>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold">
            Contributions
          </h2>
          <ul className="space-y-3 text-sm">
            {ownContributions.length === 0 ? (
              <li className="text-[var(--muted)]">No contributions logged.</li>
            ) : (
              ownContributions.map((c) => (
                <li key={c.id} className="border-b border-[var(--line)] pb-3 last:border-0">
                  <p className="font-medium">{c.description}</p>
                  <p className="text-[var(--muted)]">{c.type}</p>
                </li>
              ))
            )}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
