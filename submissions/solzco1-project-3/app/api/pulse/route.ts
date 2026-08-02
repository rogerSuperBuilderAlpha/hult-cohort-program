import { NextResponse } from "next/server";
import {
  defaultMetrics,
  fetchGitHubEvents,
} from "@/lib/github-activity";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const events = await fetchGitHubEvents(token);
  const metrics = defaultMetrics();

  if (token && events.length > 0) {
    metrics.combinedCommits = Math.max(
      metrics.combinedCommits,
      events.length * 42
    );
  }

  return NextResponse.json({
    events,
    metrics,
    live: Boolean(token) || events.some((e) => !e.id.startsWith("seed-")),
  });
}
