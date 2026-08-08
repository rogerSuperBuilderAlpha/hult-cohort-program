"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Landmark,
  Lightbulb,
  Scale,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { CategoryBadge } from "@/components/learn/category-badge";
import { LegalDisclaimer } from "@/components/layout/legal-disclaimer";
import type { LawCategory } from "@/lib/course/types";
import type { LegalFact } from "@/lib/legal-facts";
import { legalFacts } from "@/lib/legal-facts";
import { SUBJECT_CATEGORIES } from "@/lib/course/modules";
import { cn } from "@/lib/utils";

const categoryIcons: Record<LawCategory, LucideIcon> = {
  "Civil Law": Scale,
  "Criminal Law": Scale,
  "Everyday Law": Landmark,
};

type LegalBitesProps = {
  facts?: LegalFact[];
  initialIndex?: number;
  variant?: "featured" | "compact";
  showCategoryFilter?: boolean;
  className?: string;
};

export function LegalBites({
  facts = legalFacts,
  initialIndex = 0,
  variant = "featured",
  showCategoryFilter = variant === "compact",
  className,
}: LegalBitesProps) {
  const [activeCategory, setActiveCategory] = useState<LawCategory | "All">(
    "All"
  );
  const [index, setIndex] = useState(() =>
    initialIndex >= 0 && initialIndex < facts.length ? initialIndex : 0
  );
  const [direction, setDirection] = useState(0);

  const filteredFacts = useMemo(() => {
    if (activeCategory === "All") return facts;
    return facts.filter((fact) => fact.category === activeCategory);
  }, [activeCategory, facts]);

  const safeIndex =
    filteredFacts.length === 0
      ? 0
      : Math.min(index, filteredFacts.length - 1);
  const fact = filteredFacts[safeIndex];

  const goTo = (nextIndex: number, step: number) => {
    if (filteredFacts.length <= 1) return;
    setDirection(step);
    setIndex((nextIndex + filteredFacts.length) % filteredFacts.length);
  };

  const handleCategoryChange = (category: LawCategory | "All") => {
    setActiveCategory(category);
    setIndex(0);
    setDirection(0);
  };

  if (!fact) return null;

  const Icon = categoryIcons[fact.category] ?? Lightbulb;

  return (
    <aside
      className={cn(
        "overflow-hidden rounded-2xl border shadow-sm",
        variant === "featured"
          ? "border-lex-gold/25 bg-gradient-to-br from-[#fdf8eb] via-[#f5f9fd] to-lex-pale"
          : "border-lex-navy/10 bg-gradient-to-br from-lex-pale to-[#fdf8eb]",
        className
      )}
      aria-labelledby={`legal-bite-${fact.id}`}
    >
      {showCategoryFilter && (
        <div className="flex flex-wrap gap-2 border-b border-lex-navy/8 bg-white/60 px-4 py-3 sm:px-5">
          <CategoryFilterButton
            active={activeCategory === "All"}
            onClick={() => handleCategoryChange("All")}
          >
            All
          </CategoryFilterButton>
          {SUBJECT_CATEGORIES.map((category) => (
            <CategoryFilterButton
              key={category}
              active={activeCategory === category}
              onClick={() => handleCategoryChange(category)}
            >
              {category.replace(" Law", "")}
            </CategoryFilterButton>
          ))}
        </div>
      )}

      <div className="relative min-h-[220px] overflow-hidden p-5 sm:p-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${activeCategory}-${fact.id}`}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? 24 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -24 : 24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-start gap-4"
          >
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl ring-1",
                variant === "featured"
                  ? "bg-white text-lex-gold ring-lex-gold/30"
                  : "bg-white text-lex-navy ring-lex-navy/10"
              )}
              aria-hidden
            >
              <Icon className="size-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lex-gold">
                  Legal Bites
                </p>
                <ReviewBadge reviewed={!fact.sourceReviewNeeded} />
              </div>
              <div className="mt-2">
                <CategoryBadge category={fact.category} />
              </div>
              <h2
                id={`legal-bite-${fact.id}`}
                className="mt-2 font-serif text-lg font-semibold text-lex-navy sm:text-xl"
              >
                {fact.shortTitle}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-lex-navy/85">
                {fact.fact}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-lex-navy/70">
                {fact.explanation}
              </p>
              <LegalDisclaimer className="mt-4" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {filteredFacts.length > 1 && (
        <div className="flex items-center justify-between border-t border-lex-navy/8 bg-white/50 px-4 py-3">
          <button
            type="button"
            onClick={() => goTo(safeIndex - 1, -1)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-lex-navy/70 hover:bg-lex-pale hover:text-lex-navy"
            aria-label="Previous legal bite"
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>
          <span className="text-xs tabular-nums text-lex-navy/50">
            {safeIndex + 1} / {filteredFacts.length}
          </span>
          <button
            type="button"
            onClick={() => goTo(safeIndex + 1, 1)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-lex-navy/70 hover:bg-lex-pale hover:text-lex-navy"
            aria-label="Next legal bite"
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </aside>
  );
}

function ReviewBadge({ reviewed }: { reviewed: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ring-1 ring-inset",
        reviewed
          ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
          : "bg-amber-50 text-amber-900 ring-amber-200"
      )}
    >
      {reviewed ? "Reviewed" : "Needs Review"}
    </span>
  );
}

function CategoryFilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-lex-navy text-white"
          : "bg-white text-lex-navy/70 ring-1 ring-lex-navy/10 hover:bg-lex-pale"
      )}
    >
      {children}
    </button>
  );
}

/** @deprecated Use LegalBites instead. */
export function DidYouKnow(props: LegalBitesProps) {
  return <LegalBites {...props} />;
}
