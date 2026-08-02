import Link from "next/link";
import { notFound } from "next/navigation";
import { BuilderAvatar } from "@/components/showcase/BuilderAvatar";
import { CampaignStoryCards } from "@/components/showcase/CampaignStoryCards";
import { ProjectCard } from "@/components/showcase/ProjectCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { logAnalyticsEvent } from "@/lib/analytics";
import { partnerInterestPath, projectPath } from "@/lib/paths";
import {
  getPublishedBuilder,
  listApprovedCampaignContentForCreator,
  listPublishedProjectsForOwner,
} from "@/lib/showcase";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BuilderDetailPage({ params }: Props) {
  const { slug: id } = await params;
  const builder = await getPublishedBuilder(id);
  if (!builder) notFound();

  void logAnalyticsEvent({
    eventType: "profile_view",
    metadata: { profile_id: builder.id },
  });

  const [projects, campaigns] = await Promise.all([
    listPublishedProjectsForOwner(builder.id),
    listApprovedCampaignContentForCreator(builder.id),
  ]);

  const socialEntries = Object.entries(builder.social_links ?? {}).filter(
    ([, url]) => Boolean(url),
  );

  return (
    <div>
      <section className="border-b border-border/80 bg-[radial-gradient(ellipse_at_top_left,rgba(61,255,181,0.10),transparent_50%)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 md:flex-row md:items-end md:py-20">
          <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background-muted font-display text-3xl font-semibold text-accent md:size-36">
            <BuilderAvatar
              name={builder.name}
              githubProfileUrl={builder.github_profile_url}
              avatarUrl={builder.avatar_url}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-foreground-muted">
                Builder
              </p>
              <h1 className="mt-2 break-words font-display text-4xl font-semibold tracking-tight md:text-5xl">
                {builder.name || "Builder"}
              </h1>
              {builder.location ? (
                <p className="mt-2 break-words text-foreground-muted">
                  {builder.location}
                </p>
              ) : null}
            </div>
            {builder.skills?.length ? (
              <div className="flex flex-wrap gap-2">
                {builder.skills.map((skill) => (
                  <Badge key={skill} tone="sky">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-14 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-14">
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              About
            </h2>
            <p className="max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-foreground-muted md:text-lg">
              {builder.biography || "This builder hasn’t added a bio yet."}
            </p>
            {builder.interests?.length ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {builder.interests.map((interest) => (
                  <Badge key={interest} tone="muted">
                    {interest}
                  </Badge>
                ))}
              </div>
            ) : null}
          </section>

          <section className="space-y-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Published projects
            </h2>
            {projects.length === 0 ? (
              <EmptyState
                title="No published projects yet"
                description="When this builder publishes a project, it will show up here."
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={{ ...project, owner: null }}
                    compact
                  />
                ))}
              </div>
            )}
          </section>

          {campaigns.length === 0 ? (
            <EmptyState
              title="No approved campaigns yet"
              description="Approved campaign stories from the Copilot will appear here."
            />
          ) : (
            <CampaignStoryCards
              items={campaigns}
              title="Approved campaign stories"
            />
          )}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold">Links</h2>
            <ul className="space-y-2 text-sm">
              {builder.website_url ? (
                <li>
                  <a
                    href={builder.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    Website
                  </a>
                </li>
              ) : null}
              {builder.github_profile_url ? (
                <li>
                  <a
                    href={builder.github_profile_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    GitHub
                  </a>
                </li>
              ) : null}
              {socialEntries.map(([key, url]) => (
                <li key={key}>
                  <a
                    href={String(url)}
                    target="_blank"
                    rel="noreferrer"
                    className="capitalize text-accent hover:underline"
                  >
                    {key}
                  </a>
                </li>
              ))}
              {!builder.website_url &&
              !builder.github_profile_url &&
              socialEntries.length === 0 ? (
                <li className="text-foreground-muted">No links added yet.</li>
              ) : null}
            </ul>
          </div>

          {builder.visible_to_partners ? (
            <div className="space-y-3 rounded-xl border border-border bg-background-elevated p-5">
              <h2 className="font-display text-lg font-semibold">
                Work with {builder.name?.split(" ")[0] || "this builder"}
              </h2>
              <p className="text-sm leading-relaxed text-foreground-muted">
                Partners can express interest in collaborating on their next
                milestone.
              </p>
              <Link
                href={partnerInterestPath({ participantId: builder.id })}
              >
                <Button className="w-full">
                  Express interest in working with{" "}
                  {builder.name?.split(" ")[0] || "them"}
                </Button>
              </Link>
            </div>
          ) : null}

          {projects[0] ? (
            <Link
              href={projectPath(projects[0].slug)}
              className="block text-sm text-foreground-muted hover:text-accent"
            >
              Latest project: {projects[0].name} →
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
