import Link from "next/link";
import { ArrowRight, Gavel } from "lucide-react";

import { CategoryBadge } from "@/components/learn/category-badge";
import type { CaseSpotlight } from "@/lib/case-spotlights";
import { cn } from "@/lib/utils";

type CaseSpotlightProps = {
  spotlight: CaseSpotlight;
  className?: string;
  showLearnMore?: boolean;
};

export function CaseSpotlightCard({
  spotlight,
  className,
  showLearnMore = true,
}: CaseSpotlightProps) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-lex-navy/10 bg-white shadow-sm",
        className
      )}
      aria-labelledby={`case-spotlight-${spotlight.id}`}
    >
      <div className="border-b border-lex-navy/8 bg-gradient-to-r from-lex-pale/80 to-white px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-lex-navy text-white ring-1 ring-lex-navy/20"
            aria-hidden
          >
            <Gavel className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lex-gold">
              Case Spotlight
            </p>
            <div className="mt-2">
              <CategoryBadge category={spotlight.category} />
            </div>
            <h2
              id={`case-spotlight-${spotlight.id}`}
              className="mt-2 font-serif text-xl font-semibold text-lex-navy sm:text-2xl"
            >
              {spotlight.title}
            </h2>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        <section aria-labelledby={`case-why-${spotlight.id}`}>
          <h3
            id={`case-why-${spotlight.id}`}
            className="text-sm font-semibold text-lex-navy"
          >
            Why it matters
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-lex-navy/80">
            {spotlight.whyItMatters}
          </p>
        </section>

        <section aria-labelledby={`case-explainer-${spotlight.id}`}>
          <h3
            id={`case-explainer-${spotlight.id}`}
            className="text-sm font-semibold text-lex-navy"
          >
            Beginner explanation
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-lex-navy/75">
            {spotlight.explanation}
          </p>
        </section>

        {showLearnMore && spotlight.learnMoreHref && (
          <Link
            href={spotlight.learnMoreHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-lex-navy underline-offset-4 hover:underline"
          >
            Learn more
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}

        {showLearnMore && !spotlight.learnMoreHref && (
          <p className="text-sm text-lex-navy/50">
            Learn more — coming soon
          </p>
        )}
      </div>
    </article>
  );
}
