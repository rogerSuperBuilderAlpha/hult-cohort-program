import type { LawCategory, ModuleId } from "@/lib/course/types";

export type CaseSpotlight = {
  id: string;
  title: string;
  whyItMatters: string;
  explanation: string;
  category: LawCategory;
  /** Placeholder href for future deep-dive content. */
  learnMoreHref?: string;
};

export const MODULE_CASE_SPOTLIGHT: Partial<Record<ModuleId, string>> = {
  "1": "marketplace-laptop",
  "2": "donoghue-v-stevenson",
  "3": "r-v-cunningham",
  "4": "r-v-williams-gladstone",
};

export const caseSpotlights: CaseSpotlight[] = [
  {
    id: "marketplace-laptop",
    title: "The £500 laptop listing",
    whyItMatters:
      "Everyday online sales often look like firm offers, but the law may treat them as invitations to negotiate—shaping whether a binding contract exists at all.",
    explanation:
      "When someone posts “Selling my laptop—£500” in a local group, buyers may assume the price is fixed. In many situations the post invites offers rather than accepting them. Understanding that distinction helps you see why a quick reply about a lower price can restart negotiations instead of completing a sale.",
    category: "Civil Law",
    learnMoreHref: "/learn/1",
  },
  {
    id: "donoghue-v-stevenson",
    title: "Donoghue v Stevenson [1932] AC 562",
    whyItMatters:
      "This House of Lords decision is a foundation of modern negligence law and introduced the influential neighbour principle.",
    explanation:
      "Mrs Donoghue consumed ginger beer from a bottle. A decomposed snail was found in the bottle after she had drunk part of it; she became ill. She could not sue the shopkeeper in contract because her friend had bought the drink. The House of Lords held that a manufacturer could owe a duty of care to the ultimate consumer. Lord Atkin’s neighbour principle asks whether you have taken reasonable care to avoid harming those you ought to foresee would be affected by your conduct. The case remains highly significant, though courts today may apply additional tests in some duty-of-care questions and the facts would be analysed under modern consumer protection law as well.",
    category: "Civil Law",
    learnMoreHref: "/learn/2",
  },
  {
    id: "r-v-cunningham",
    title: "R v Cunningham [1957] 2 QB 396",
    whyItMatters:
      "This Court of Appeal decision is a leading authority on subjective recklessness in criminal law.",
    explanation:
      "Cunningham ripped a gas meter from a wall to steal money from the coin slot. Gas leaked into the neighbouring property, endangering his future mother-in-law. He was prosecuted under a statutory provision relating to maliciously endangering life. The court held that “maliciously” required either intention or subjective recklessness—Cunningham must have foreseen the risk and gone on to take it. The case is a starting point for understanding subjective recklessness, but the precise mens rea required always depends on the wording and interpretation of the specific offence charged.",
    category: "Criminal Law",
    learnMoreHref: "/learn/3",
  },
  {
    id: "r-v-williams-gladstone",
    title: "R v Williams (Gladstone) [1984] 78 Cr App R 276",
    whyItMatters:
      "This case is a key authority on honest belief in the need for force when raising self-defence or defence of another.",
    explanation:
      "Williams saw what he believed was an assault and intervened. In fact, a plain-clothes police officer was making a lawful arrest. The Court of Appeal held that when assessing whether force was necessary, the defendant may be judged on the facts as they honestly believed them to be—even if mistaken. However, the force used must still be reasonable in those believed circumstances. Later authorities refine how reasonableness is assessed; this module introduces the principles at beginner level.",
    category: "Criminal Law",
    learnMoreHref: "/learn/4",
  },
  {
    id: "faulty-goods-return",
    title: "Returning faulty goods",
    whyItMatters:
      "Consumer rights can give you remedies beyond a shop’s voluntary returns policy when goods are faulty or not as described.",
    explanation:
      "If you buy goods as a consumer, statutory protections may allow repair, replacement, or refund when something goes wrong. A shop’s “14-day returns” sign does not replace those rights, though time limits and conditions still apply depending on the circumstances.",
    category: "Everyday Law",
    learnMoreHref: "/learn/5",
  },
];

export function getCaseSpotlight(id: string): CaseSpotlight | undefined {
  return caseSpotlights.find((entry) => entry.id === id);
}

export function getSpotlightsByCategory(
  category: LawCategory
): CaseSpotlight[] {
  return caseSpotlights.filter((entry) => entry.category === category);
}

export function getCaseSpotlightForModule(
  moduleId: ModuleId
): CaseSpotlight | undefined {
  const spotlightId = MODULE_CASE_SPOTLIGHT[moduleId];
  return spotlightId ? getCaseSpotlight(spotlightId) : undefined;
}

export function getModuleLinkedSpotlights(): CaseSpotlight[] {
  return caseSpotlights.filter((entry) => entry.learnMoreHref);
}
