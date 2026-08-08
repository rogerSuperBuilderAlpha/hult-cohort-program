import Link from "next/link";
import { ArrowRight, ScrollText } from "lucide-react";

import { CategoryBadge } from "@/components/learn/category-badge";
import type { StatuteSpotlight } from "@/lib/statute-spotlights";
import { cn } from "@/lib/utils";

type StatuteSpotlightCardProps = {
  spotlight: StatuteSpotlight;
  className?: string;
  showLearnMore?: boolean;
};

export function StatuteSpotlightCard({
  spotlight,
  className,
  showLearnMore = true,
}: StatuteSpotlightCardProps) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-lex-navy/10 bg-white shadow-sm",
        className
      )}
      aria-labelledby={`statute-spotlight-${spotlight.id}`}
    >
      <div className="border-b border-lex-navy/8 bg-gradient-to-r from-[#fdf8eb]/80 to-lex-pale/60 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-lex-gold/20 text-lex-navy ring-1 ring-lex-gold/30"
            aria-hidden
          >
            <ScrollText className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lex-gold">
              Statute Spotlight
            </p>
            <div className="mt-2">
              <CategoryBadge category={spotlight.category} />
            </div>
            <h2
              id={`statute-spotlight-${spotlight.id}`}
              className="mt-2 font-serif text-xl font-semibold text-lex-navy sm:text-2xl"
            >
              {spotlight.title}
            </h2>
            <p className="mt-1 text-xs text-lex-navy/55">{spotlight.citation}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        <section aria-labelledby={`statute-why-${spotlight.id}`}>
          <h3
            id={`statute-why-${spotlight.id}`}
            className="text-sm font-semibold text-lex-navy"
          >
            Why it matters
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-lex-navy/80">
            {spotlight.whyItMatters}
          </p>
        </section>

        <section aria-labelledby={`statute-explainer-${spotlight.id}`}>
          <h3
            id={`statute-explainer-${spotlight.id}`}
            className="text-sm font-semibold text-lex-navy"
          >
            Beginner explanation
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-lex-navy/75">
            {spotlight.explanation}
          </p>
        </section>

        <section aria-labelledby={`statute-points-${spotlight.id}`}>
          <h3
            id={`statute-points-${spotlight.id}`}
            className="text-sm font-semibold text-lex-navy"
          >
            Key points
          </h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-lex-navy/75">
            {spotlight.keyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        {spotlight.sourceReviewNeeded && (
          <p className="text-[0.7rem] text-lex-navy/45">
            Source review recommended before citing in assessed work.
          </p>
        )}

        {showLearnMore && spotlight.learnMoreHref && (
          <Link
            href={spotlight.learnMoreHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-lex-navy underline-offset-4 hover:underline"
          >
            Learn more
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
    </article>
  );
}
