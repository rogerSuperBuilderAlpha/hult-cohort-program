import type { LawCategory, ModuleId } from "@/lib/course/types";

export type StatuteSpotlight = {
  id: string;
  title: string;
  citation: string;
  whyItMatters: string;
  explanation: string;
  keyPoints: string[];
  category: LawCategory;
  learnMoreHref?: string;
  sourceReviewNeeded: boolean;
};

export const MODULE_STATUTE_SPOTLIGHT: Partial<Record<ModuleId, string>> = {
  "5": "consumer-rights-act-2015",
};

export const statuteSpotlights: StatuteSpotlight[] = [
  {
    id: "consumer-rights-act-2015",
    title: "Consumer Rights Act 2015",
    citation: "Consumer Rights Act 2015 (England and Wales)",
    whyItMatters:
      "This Act sets out key statutory standards for goods, services and digital content bought by consumers—rights that exist alongside anything a seller writes in their returns policy.",
    explanation:
      "When you buy goods as a consumer, they must generally be of satisfactory quality, fit for purpose and as described. If they are not, you may have remedies such as repair, replacement or refund, depending on the facts and timing. The short-term right to reject faulty goods within 30 days is one important remedy at introductory level, but later remedies and time limits also apply. Online and distance sales may involve additional cancellation rights in some circumstances, though exceptions exist for sealed goods and custom items.",
    keyPoints: [
      "Satisfactory quality — goods should meet the standard a reasonable person would expect",
      "Fitness for purpose — goods should be fit for any particular purpose you made known",
      "As described — goods must match any description given to you",
      "Short-term right to reject — at introductory level, consumers may reject faulty goods within 30 days in many cases",
      "Remedies depend on timing, the nature of the fault and whether repair or replacement is appropriate",
    ],
    category: "Everyday Law",
    learnMoreHref: "/learn/5",
    sourceReviewNeeded: true,
  },
];

export function getStatuteSpotlight(id: string): StatuteSpotlight | undefined {
  return statuteSpotlights.find((entry) => entry.id === id);
}

export function getStatuteSpotlightForModule(
  moduleId: ModuleId
): StatuteSpotlight | undefined {
  const spotlightId = MODULE_STATUTE_SPOTLIGHT[moduleId];
  return spotlightId ? getStatuteSpotlight(spotlightId) : undefined;
}

export function getModuleLinkedStatutes(): StatuteSpotlight[] {
  return statuteSpotlights.filter((entry) => entry.learnMoreHref);
}
