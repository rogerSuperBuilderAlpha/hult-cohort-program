import { programProjects } from '@/content/program';

export const runtime = 'nodejs';

/** Public program index for agents, MCP, and integrations. */
export async function GET() {
  const projects = programProjects.map((p) => ({
    slug: p.slug,
    phase: p.phase,
    phaseLabel: p.phaseLabel,
    title: p.title,
    weeks: p.weeks,
    summary: p.summary,
    description: p.description,
    voteWeek: p.voteWeek,
    hasPeerReviews: Boolean(p.reviews),
    reviewsDueNote: p.reviews?.dueNote ?? null,
    submissionRepoPattern: p.submission.repoPattern,
    submissionPrTitle: p.submission.prTitle,
    passGate: p.passGate,
  }));

  return Response.json({ projects });
}
