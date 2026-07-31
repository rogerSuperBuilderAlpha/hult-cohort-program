import Link from "next/link";
import { BuilderCard } from "@/components/showcase/BuilderCard";
import { NetworkBackdrop } from "@/components/showcase/NetworkBackdrop";
import { ProjectCard } from "@/components/showcase/ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import {
  listPublishedBuilders,
  listPublishedProjects,
} from "@/lib/showcase";

const ctaClass =
  "inline-flex h-12 cursor-pointer items-center justify-center rounded-md px-6 text-base font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof listPublishedProjects>> = [];
  let builders: Awaited<ReturnType<typeof listPublishedBuilders>> = [];
  let loadError: string | null = null;

  try {
    const [featuredRows, allProjects, builderRows] = await Promise.all([
      listPublishedProjects({ featuredOnly: true, limit: 6 }),
      listPublishedProjects({ limit: 6 }),
      listPublishedBuilders(6),
    ]);
    featured = featuredRows.length > 0 ? featuredRows : allProjects;
    builders = builderRows;
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load showcase.";
  }

  return (
    <div>
      <section className="relative min-h-[100svh] overflow-hidden">
        <NetworkBackdrop tone="home" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6 pb-24 pt-28 md:pt-32">
          <p className="animate-fade-up font-display text-2xl font-semibold tracking-tight md:text-3xl">
            <span className="text-foreground">Comen</span>
            <span className="text-accent-projects">tiq</span>
          </p>

          <h1 className="animate-fade-up-delay mt-6 max-w-4xl break-words font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-7xl">
            Where individual brilliance becomes collective momentum.
          </h1>

          <p className="animate-fade-up-delay-2 mt-6 max-w-xl text-lg leading-relaxed text-foreground-muted md:text-xl">
            Evidence-led stories from the Hult Summer Cohort — amplified by
            peers, discoverable by partners.
          </p>

          <div className="animate-fade-up-delay-2 mt-10 flex flex-wrap gap-3">
            <Link
              href="/projects"
              className={`${ctaClass} bg-accent-projects text-accent-foreground hover:brightness-110 focus-visible:ring-accent-projects`}
            >
              Explore the Projects
            </Link>
            <Link
              href="/builders"
              className={`${ctaClass} border border-accent-builders/70 bg-background/50 text-foreground backdrop-blur-sm hover:border-accent-builders hover:bg-accent-builders/10 hover:text-accent-builders focus-visible:ring-accent-builders`}
            >
              Meet the Builders
            </Link>
            <Link
              href="/partners"
              className={`${ctaClass} border border-accent-partners/50 bg-background/40 text-foreground hover:border-accent-partners hover:bg-accent-partners/10 hover:text-accent-partners focus-visible:ring-accent-partners`}
            >
              Discover Partnership Opportunities
            </Link>
          </div>
        </div>
      </section>

      {loadError ? (
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p role="alert" className="text-sm text-danger">
            {loadError}
          </p>
        </div>
      ) : (
        <>
          <section className="mx-auto max-w-6xl px-6 py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-accent-projects">
                  Featured projects
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                  Work worth amplifying
                </h2>
              </div>
              <TextLink href="/projects" accent="projects">
                View all projects
              </TextLink>
            </div>

            {featured.length === 0 ? (
              <div className="mt-10">
                <EmptyState
                  title="No published projects yet"
                  description="Publish a project from your dashboard to appear here."
                  action={
                    <Link href="/dashboard/projects/new" className="inline-flex">
                      <Button accent="projects" className="cursor-pointer">
                        Create a project
                      </Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </section>

          <section className="border-t border-border/80 bg-background-elevated/40">
            <div className="mx-auto max-w-6xl px-6 py-20">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-accent-builders">
                    Latest builders
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                    Meet the cohort
                  </h2>
                </div>
                <TextLink href="/builders" accent="builders">
                  View all builders
                </TextLink>
              </div>

              {builders.length === 0 ? (
                <div className="mt-10">
                  <EmptyState
                    title="No published builders yet"
                    description="Publish your profile to join the public directory."
                    action={
                      <Link href="/dashboard/profile" className="inline-flex">
                        <Button accent="builders">Edit profile</Button>
                      </Link>
                    }
                  />
                </div>
              ) : (
                <div className="mt-6 divide-y divide-border/80 border-t border-border/80">
                  {builders.map((builder) => (
                    <BuilderCard key={builder.id} builder={builder} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
