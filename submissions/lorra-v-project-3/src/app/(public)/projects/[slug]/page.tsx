import Link from "next/link";
import { notFound } from "next/navigation";
import { AmplificationBoosts } from "@/components/showcase/AmplificationBoosts";
import { CampaignStoryCards } from "@/components/showcase/CampaignStoryCards";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { logAnalyticsEvent } from "@/lib/analytics";
import { builderPath, partnerInterestPath } from "@/lib/paths";
import { initialsFromName } from "@/lib/slug";
import {
  getPublishedProjectBySlug,
  listApprovedCampaignContentForProject,
  listProjectUpdates,
  listSharedAmplificationsForProject,
  type PublicProjectOwner,
} from "@/lib/showcase";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();

  void logAnalyticsEvent({
    eventType: "project_view",
    projectId: project.id,
    metadata: { slug: project.slug },
  });

  const [updates, campaigns, amplifications] = await Promise.all([
    listProjectUpdates(project.id),
    listApprovedCampaignContentForProject(project.id),
    listSharedAmplificationsForProject(project.id),
  ]);
  const boostCount = amplifications.length;

  const owner = project.owner;
  const links = [
    { label: "Live", href: project.live_url },
    { label: "GitHub", href: project.github_url },
    { label: "Demo", href: project.demo_url },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/80">
        <div className="absolute inset-0">
          {project.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.image_url}
              alt={`${project.name} cover`}
              className="size-full object-cover opacity-40"
            />
          ) : (
            <div className="size-full bg-[radial-gradient(ellipse_at_top,rgba(61,255,181,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(94,183,255,0.14),transparent_50%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 md:pb-20 md:pt-28">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{project.stage}</Badge>
            {(project.sectors ?? []).map((sector) => (
              <Badge key={sector} tone="muted">
                {sector}
              </Badge>
            ))}
          </div>
          <h1 className="mt-5 max-w-4xl break-words font-display text-4xl font-semibold tracking-tight md:text-6xl">
            {project.name}
          </h1>
          {project.tagline ? (
            <p className="mt-4 max-w-2xl break-words text-lg text-foreground-muted md:text-xl">
              {project.tagline}
            </p>
          ) : null}

          {owner ? (
            <OwnerAttribution owner={owner} />
          ) : null}

          {boostCount > 0 ? (
            <p className="mt-4 text-sm text-accent">
              Boosted by {boostCount} cohort builder
              {boostCount === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-14 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-14">
          {(project.problem || project.solution || project.target_audience) && (
            <section className="grid gap-8 md:grid-cols-3">
              {project.problem ? (
                <div className="space-y-2">
                  <h2 className="font-display text-lg font-semibold">Problem</h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground-muted">
                    {project.problem}
                  </p>
                </div>
              ) : null}
              {project.solution ? (
                <div className="space-y-2">
                  <h2 className="font-display text-lg font-semibold">
                    Solution
                  </h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground-muted">
                    {project.solution}
                  </p>
                </div>
              ) : null}
              {project.target_audience ? (
                <div className="space-y-2">
                  <h2 className="font-display text-lg font-semibold">
                    Audience
                  </h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground-muted">
                    {project.target_audience}
                  </p>
                </div>
              ) : null}
            </section>
          )}

          {(project.summary || project.description) && (
            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Overview
              </h2>
              {project.summary ? (
                <p className="max-w-3xl text-base leading-relaxed text-foreground md:text-lg">
                  {project.summary}
                </p>
              ) : null}
              {project.description ? (
                <p className="max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-foreground-muted">
                  {project.description}
                </p>
              ) : null}
            </section>
          )}

          {project.technology_stack?.length ? (
            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Technology
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.technology_stack.map((tech) => (
                  <Badge key={tech} tone="sky">
                    {tech}
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Progress updates
            </h2>
            {updates.length === 0 ? (
              <EmptyState
                title="No updates yet"
                description="When this builder publishes progress updates, they’ll show up here as a timeline."
              />
            ) : (
              <ol className="relative space-y-8 border-l border-border pl-6">
                {updates.map((update) => (
                  <li key={update.id} className="relative">
                    <span className="absolute -left-[1.91rem] top-1.5 size-2.5 rounded-full bg-accent-projects" />
                    <p className="text-xs text-foreground-muted">
                      {new Date(update.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-semibold">
                      {update.title}
                    </h3>
                    {update.description ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground-muted">
                        {update.description}
                      </p>
                    ) : null}
                    <UpdateLists update={update} />
                  </li>
                ))}
              </ol>
            )}
          </section>

          {campaigns.length === 0 ? (
            <EmptyState
              title="No approved campaigns yet"
              description="Approved multi-channel campaign stories will appear here once the builder ships them from the Copilot."
            />
          ) : (
            <CampaignStoryCards items={campaigns} />
          )}

          <AmplificationBoosts items={amplifications} />
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          {links.length > 0 ? (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-semibold">Links</h2>
              <ul className="space-y-2 text-sm">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-3 rounded-xl border border-border bg-background-elevated p-5">
            <h2 className="font-display text-lg font-semibold">
              What this project needs next
            </h2>
            {project.needs?.length ? (
              <ul className="space-y-2">
                {project.needs.map((need) => (
                  <li key={need}>
                    <Badge tone="coral">{need}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-foreground-muted">
                Needs haven’t been listed yet.
              </p>
            )}
            <Link
              href={partnerInterestPath({
                projectId: project.id,
                participantId: project.owner_id,
              })}
              className="block pt-2"
            >
              <Button className="w-full">Express partner interest</Button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function OwnerAttribution({ owner }: { owner: PublicProjectOwner }) {
  const body = (
    <>
      <span className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-border bg-background-muted font-display text-xs text-accent">
        {owner.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={owner.avatar_url}
            alt={`${owner.name || "Builder"} avatar`}
            className="size-full object-cover"
          />
        ) : (
          <span aria-hidden>{initialsFromName(owner.name)}</span>
        )}
      </span>
      <span>
        Built by{" "}
        <span className="text-foreground">
          {owner.name || "a cohort builder"}
        </span>
        {owner.location ? ` · ${owner.location}` : ""}
      </span>
    </>
  );

  if (owner.linkable) {
    return (
      <Link
        href={builderPath(owner.id)}
        className="mt-8 inline-flex items-center gap-3 text-sm text-foreground-muted transition hover:text-foreground"
      >
        {body}
      </Link>
    );
  }

  return (
    <div className="mt-8 inline-flex items-center gap-3 text-sm text-foreground-muted">
      {body}
    </div>
  );
}

function UpdateLists({
  update,
}: {
  update: {
    achievements?: string[] | null;
    challenges?: string[] | null;
    lessons?: string[] | null;
    next_steps?: string[] | null;
    evidence_links?: string[] | null;
  };
}) {
  const blocks: { label: string; items: string[] }[] = [
    { label: "Achievements", items: update.achievements ?? [] },
    { label: "Challenges", items: update.challenges ?? [] },
    { label: "Lessons", items: update.lessons ?? [] },
    { label: "Next steps", items: update.next_steps ?? [] },
  ].filter((b) => b.items.length > 0);

  const evidence = update.evidence_links ?? [];

  if (blocks.length === 0 && evidence.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      {blocks.map((block) => (
        <div key={block.label}>
          <p className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
            {block.label}
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground-muted">
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
      {evidence.length > 0 ? (
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
            Evidence
          </p>
          <ul className="mt-1 space-y-1 text-sm">
            {evidence.map((href) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  {href}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
