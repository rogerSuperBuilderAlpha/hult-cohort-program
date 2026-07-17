import type { Contribution, IndividualStats, Profile, PullRequest } from "./types";

/** Individual score: base output × vote quality multiplier (caps at +50%). */
export function computeIndividualScore(input: {
  mergedPrs: number;
  contributions: number;
  issuesResolved: number;
  votesReceived: number;
}): Pick<IndividualStats, "baseScore" | "voteMultiplier" | "individualScore"> {
  const baseScore =
    input.mergedPrs * 50 + input.contributions * 20 + input.issuesResolved * 15;
  const voteMultiplier = 1 + Math.min(0.5, input.votesReceived * 0.05);
  return {
    baseScore,
    voteMultiplier,
    individualScore: baseScore * voteMultiplier,
  };
}

export function buildIndividualStats(input: {
  profile: Profile;
  pullRequests: PullRequest[];
  contributions: Contribution[];
  votesReceived: number;
}): IndividualStats {
  const ownPrs = input.pullRequests.filter((pr) => pr.profile_id === input.profile.id);
  const ownContributions = input.contributions.filter(
    (c) => c.profile_id === input.profile.id,
  );
  const mergedPrs = ownPrs.filter((pr) => pr.status === "merged").length;
  const pendingPrs = ownPrs.filter((pr) => pr.status === "pending").length;
  const issuesResolved = ownContributions.filter((c) => c.type === "issue_resolved").length;
  const scores = computeIndividualScore({
    mergedPrs,
    contributions: ownContributions.length,
    issuesResolved,
    votesReceived: input.votesReceived,
  });

  return {
    profile: input.profile,
    mergedPrs,
    pendingPrs,
    contributions: ownContributions.length,
    issuesResolved,
    votesReceived: input.votesReceived,
    ...scores,
  };
}
