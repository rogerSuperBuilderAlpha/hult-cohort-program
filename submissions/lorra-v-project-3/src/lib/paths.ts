import { slugify } from "@/lib/slug";

/** Public builder URL — uses profile id (no slug column on profiles). */
export function builderPath(profileId: string): string {
  return `/builders/${profileId}`;
}

export function projectPath(slug: string): string {
  return `/projects/${slug}`;
}

export function partnerInterestPath(options?: {
  participantId?: string;
  projectId?: string;
}): string {
  const params = new URLSearchParams();
  if (options?.participantId) params.set("participant", options.participantId);
  if (options?.projectId) params.set("project", options.projectId);
  const qs = params.toString();
  return qs ? `/partners?${qs}` : "/partners";
}

export function builderDisplaySlug(name: string | null | undefined): string {
  return slugify(name || "builder") || "builder";
}
