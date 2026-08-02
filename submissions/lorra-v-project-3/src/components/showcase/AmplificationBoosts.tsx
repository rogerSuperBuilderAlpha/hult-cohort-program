import Link from "next/link";
import { builderPath } from "@/lib/paths";
import { initialsFromName } from "@/lib/slug";
import type { PublicAmplification } from "@/lib/showcase";

type Props = {
  items: PublicAmplification[];
};

export function AmplificationBoosts({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Boosted by {items.length} cohort builder
          {items.length === 1 ? "" : "s"}
        </h2>
        <p className="mt-2 text-sm text-foreground-muted">
          Peer endorsements from builders in the Hult Summer Cohort.
        </p>
      </div>

      <ul className="space-y-6">
        {items.map((item) => {
          const name = item.participant?.name || "Cohort builder";
          const participantId = item.participant?.id;
          return (
            <li
              key={item.id}
              className="rounded-xl border border-border bg-background-elevated p-5"
            >
              <div className="flex gap-4">
                {participantId ? (
                  <Link
                    href={builderPath(participantId)}
                    className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent-builders/40 bg-background-muted font-display text-sm font-semibold text-accent-builders transition hover:border-accent-builders"
                  >
                    {item.participant?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.participant.avatar_url}
                        alt={`${name} avatar`}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span aria-hidden>
                        {initialsFromName(item.participant?.name)}
                      </span>
                    )}
                  </Link>
                ) : (
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-background-muted font-display text-sm font-semibold text-foreground-muted">
                    <span aria-hidden>{initialsFromName(name)}</span>
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    {participantId ? (
                      <Link
                        href={builderPath(participantId)}
                        className="font-display text-lg font-semibold tracking-tight hover:text-accent-builders"
                      >
                        {name}
                      </Link>
                    ) : (
                      <p className="font-display text-lg font-semibold tracking-tight">
                        {name}
                      </p>
                    )}
                    {item.shared_at ? (
                      <time
                        dateTime={item.shared_at}
                        className="text-xs text-foreground-muted"
                      >
                        {new Date(item.shared_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    ) : null}
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
                    {item.content}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
