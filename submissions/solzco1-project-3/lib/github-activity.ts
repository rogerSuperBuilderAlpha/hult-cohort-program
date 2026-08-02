import type { PulseEvent, PulseMetrics } from "./types";
import { publicBuilders } from "./roster";

const EVENT_TEMPLATES: PulseEvent["kind"][] = [
  "commit",
  "deploy",
  "merge",
  "ship",
];

function templateMessage(
  handle: string,
  kind: PulseEvent["kind"],
  project: string
): string {
  switch (kind) {
    case "commit":
      return `@${handle} pushed to ${project}`;
    case "deploy":
      return `@${handle} deployed ${project} to production`;
    case "merge":
      return `@${handle} merged PR on ${project}`;
    case "ship":
      return `@${handle} shipped ${project} milestone`;
  }
}

function minutesAgo(n: number): string {
  if (n < 60) return `${n}m ago`;
  if (n < 1440) return `${Math.floor(n / 60)}h ago`;
  return `${Math.floor(n / 1440)}d ago`;
}

export function seededPulseEvents(): PulseEvent[] {
  const builders = publicBuilders();
  const projects = ["Pulse", "Forth", "Cohort Comms", "Sol PM", "Relay 65"];
  const events: PulseEvent[] = [];

  builders.slice(0, 12).forEach((b, i) => {
    const kind = EVENT_TEMPLATES[i % EVENT_TEMPLATES.length]!;
    events.push({
      id: `seed-${b.handle}-${i}`,
      handle: b.handle,
      message: templateMessage(b.handle, kind, projects[i % projects.length]!),
      when: minutesAgo(3 + i * 7),
      kind,
    });
  });

  return events;
}

export function defaultMetrics(): PulseMetrics {
  return {
    totalShips: 47,
    combinedCommits: 1284,
    activeProjects: 60,
    liveDeployments: 38,
  };
}

export async function fetchGitHubEvents(
  token?: string
): Promise<PulseEvent[]> {
  const handles = publicBuilders()
    .slice(0, 8)
    .map((b) => b.handle);
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "pulse-cohort-showcase",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const events: PulseEvent[] = [];

  for (const handle of handles) {
    try {
      const res = await fetch(
        `https://api.github.com/users/${handle}/events/public?per_page=3`,
        { headers, next: { revalidate: 120 } }
      );
      if (!res.ok) continue;
      const data = (await res.json()) as Array<{
        id: string;
        type: string;
        repo: { name: string };
        created_at: string;
      }>;
      for (const ev of data.slice(0, 2)) {
        const kind: PulseEvent["kind"] =
          ev.type === "PushEvent"
            ? "commit"
            : ev.type === "PullRequestEvent"
              ? "merge"
              : "ship";
        const ago = Math.max(
          1,
          Math.floor(
            (Date.now() - new Date(ev.created_at).getTime()) / 60_000
          )
        );
        events.push({
          id: String(ev.id),
          handle,
          message: templateMessage(
            handle,
            kind,
            ev.repo.name.split("/")[1] ?? "repo"
          ),
          when: minutesAgo(ago),
          kind,
        });
      }
    } catch {
      continue;
    }
  }

  return events.length > 0 ? events.slice(0, 16) : seededPulseEvents();
}
