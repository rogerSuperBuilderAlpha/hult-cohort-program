import { BuilderCard } from "@/components/showcase/BuilderCard";
import { NetworkBackdrop } from "@/components/showcase/NetworkBackdrop";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { listPublishedBuilders } from "@/lib/showcase";

export default async function BuildersPage() {
  let builders: Awaited<ReturnType<typeof listPublishedBuilders>> = [];
  let errorMessage: string | null = null;

  try {
    builders = await listPublishedBuilders();
  } catch (err) {
    errorMessage =
      err instanceof Error ? err.message : "Could not load builders.";
  }

  return (
    <div className="relative overflow-hidden">
      <NetworkBackdrop
        tone="builders"
        className="opacity-60 [mask-image:linear-gradient(to_bottom,black_0%,transparent_70%)]"
      />
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.16em] text-accent-builders">
            Directory
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Builders
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-foreground-muted">
            The people behind the projects — skills, stories, and what they’re
            building next.
          </p>
        </div>

        {errorMessage ? (
          <p role="alert" className="mt-10 text-sm text-danger">
            {errorMessage}
          </p>
        ) : builders.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title="No builders published yet"
              description="Once profiles go live, this directory becomes the public face of the cohort."
              action={
                <Link href="/dashboard/profile" className="inline-flex">
                  <Button accent="builders">Publish your profile</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-10 divide-y divide-border/80 border-t border-border/80">
            {builders.map((builder) => (
              <BuilderCard key={builder.id} builder={builder} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
