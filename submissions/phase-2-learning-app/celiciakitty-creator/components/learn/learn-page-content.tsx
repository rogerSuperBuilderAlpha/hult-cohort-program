"use client";

import { CaseSpotlightCard } from "@/components/learn/case-spotlight";
import { LegalBites } from "@/components/learn/legal-bites";
import { ModuleCard } from "@/components/learn/module-card";
import { StatuteSpotlightCard } from "@/components/learn/statute-spotlight";
import { LegalDisclaimer } from "@/components/layout/legal-disclaimer";
import {
  COURSE_SUBTITLE,
  COURSE_TITLE,
  MODULE_ORDER,
} from "@/lib/course/modules";
import type { ModuleId } from "@/lib/course/types";
import { getModuleLinkedSpotlights } from "@/lib/case-spotlights";
import { getModuleLinkedStatutes } from "@/lib/statute-spotlights";
import { legalFacts } from "@/lib/legal-facts";

export function LearnPageContent() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lex-gold">
          Learning modules
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-lex-navy sm:text-4xl">
          {COURSE_TITLE}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-lex-navy/75">
          {COURSE_SUBTITLE}. Work through each module in order—complete the
          lesson, then take the quiz to unlock the next topic.
        </p>
        <div className="mt-4">
          <LegalDisclaimer />
        </div>
      </header>

      <section className="mb-8" aria-labelledby="learn-bites-heading">
        <h2
          id="learn-bites-heading"
          className="mb-4 font-serif text-xl font-semibold text-lex-navy"
        >
          Legal Bites
        </h2>
        <LegalBites facts={legalFacts} variant="compact" />
      </section>

      <section className="mb-8" aria-labelledby="learn-case-heading">
        <h2
          id="learn-case-heading"
          className="mb-4 font-serif text-xl font-semibold text-lex-navy"
        >
          Case Spotlight
        </h2>
        <ul className="space-y-4" role="list">
          {getModuleLinkedSpotlights().map((spotlight) => (
            <li key={spotlight.id}>
              <CaseSpotlightCard spotlight={spotlight} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8" aria-labelledby="learn-statute-heading">
        <h2
          id="learn-statute-heading"
          className="mb-4 font-serif text-xl font-semibold text-lex-navy"
        >
          Statute Spotlight
        </h2>
        <ul className="space-y-4" role="list">
          {getModuleLinkedStatutes().map((spotlight) => (
            <li key={spotlight.id}>
              <StatuteSpotlightCard spotlight={spotlight} />
            </li>
          ))}
        </ul>
      </section>

      <ul className="space-y-4" role="list">
        {MODULE_ORDER.map((moduleId: ModuleId) => (
          <li key={moduleId}>
            <ModuleCard moduleId={moduleId} />
          </li>
        ))}
      </ul>
    </div>
  );
}
