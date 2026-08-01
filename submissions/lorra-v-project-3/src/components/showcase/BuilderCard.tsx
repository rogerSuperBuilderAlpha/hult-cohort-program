import Link from "next/link";
import { BuilderAvatar } from "@/components/showcase/BuilderAvatar";
import { Badge } from "@/components/ui/Badge";
import { builderPath } from "@/lib/paths";
import type { PublicBuilder } from "@/lib/showcase";

type Props = {
  builder: PublicBuilder;
};

export function BuilderCard({ builder }: Props) {
  const bioLine = builder.biography?.trim()
    ? builder.biography.trim().split(/\n/)[0]!.slice(0, 140)
    : "Builder in the Hult Summer Cohort.";
  const skills = (builder.skills ?? []).slice(0, 4);

  return (
    <Link
      href={builderPath(builder.id)}
      className="group block cursor-pointer border-b border-border/80 py-6 transition hover:border-accent-builders/50 md:py-8"
    >
      <div className="flex gap-5">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent-builders/40 bg-background-muted shadow-[0_0_24px_rgba(224,164,88,0.22)] font-display text-lg font-semibold text-accent-builders transition group-hover:border-accent-builders group-hover:shadow-[0_0_28px_rgba(224,164,88,0.32)] md:size-20">
          <BuilderAvatar
            name={builder.name}
            githubProfileUrl={builder.github_profile_url}
            avatarUrl={builder.avatar_url}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="break-words font-display text-xl font-semibold tracking-tight transition group-hover:text-accent-builders md:text-2xl">
              {builder.name || "Builder"}
            </h3>
            {builder.location ? (
              <span className="break-words text-sm text-foreground-muted">
                {builder.location}
              </span>
            ) : null}
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-foreground-muted md:text-base">
            {bioLine}
            {(builder.biography?.length ?? 0) > 140 ? "…" : ""}
          </p>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((skill) => (
                <Badge key={skill} tone="builders">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
