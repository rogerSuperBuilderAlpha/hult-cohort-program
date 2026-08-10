import { BenefitsGrid } from "@/components/home/benefits-grid";
import { CourseModulesList } from "@/components/home/course-modules-list";
import { FeatureStrip } from "@/components/home/feature-strip";
import { HeroSection } from "@/components/home/hero-section";
import { ProgressSection } from "@/components/home/progress-section";
import { WhyLearnSection } from "@/components/home/why-learn-section";
import { CaseSpotlightCard } from "@/components/learn/case-spotlight";
import { LegalBites } from "@/components/learn/legal-bites";
import { PageShell } from "@/components/layout/page-shell";
import { getCaseSpotlightForModule } from "@/lib/case-spotlights";
import { getFeaturedFact } from "@/lib/legal-facts";

export default function Home() {
  const featured = getFeaturedFact();
  const featuredSpotlight = getCaseSpotlightForModule("4")!;

  return (
    <PageShell>
      <HeroSection />
      <FeatureStrip />
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <section className="mb-10" aria-labelledby="featured-bite-heading">
          <h2 id="featured-bite-heading" className="sr-only">
            Featured legal bite
          </h2>
          <LegalBites
            facts={[featured]}
            initialIndex={0}
            variant="featured"
            showCategoryFilter={false}
          />
        </section>
        <section className="mb-10" aria-labelledby="featured-case-heading">
          <h2
            id="featured-case-heading"
            className="mb-4 font-serif text-2xl font-semibold text-lex-navy"
          >
            Case Spotlight
          </h2>
          <CaseSpotlightCard spotlight={featuredSpotlight} />
        </section>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div>
            <ProgressSection />
            <BenefitsGrid />
          </div>
          <CourseModulesList />
        </div>
      </div>
      <WhyLearnSection />
    </PageShell>
  );
}
