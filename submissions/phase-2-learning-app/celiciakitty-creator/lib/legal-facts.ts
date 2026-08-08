import type { LawCategory } from "@/lib/course/types";

export type LegalFact = {
  id: string;
  category: LawCategory;
  shortTitle: string;
  fact: string;
  explanation: string;
  sourceReviewNeeded: boolean;
};

export const legalFacts: LegalFact[] = [
  {
    id: "self-defence-weapons",
    category: "Criminal Law",
    shortTitle: "Self-defence and illegal weapons",
    fact:
      "Acting in lawful self-defence does not automatically excuse the separate offence of unlawfully possessing or carrying a weapon.",
    explanation:
      "The use of force may be considered reasonable while possession or carrying of the weapon is assessed as a separate offence. The outcome depends on the facts, the type of weapon, the location and whether there was lawful authority or a reasonable excuse.",
    sourceReviewNeeded: true,
  },
  {
    id: "civil-vs-criminal",
    category: "Civil Law",
    shortTitle: "Civil and criminal cases",
    fact:
      "Civil law disputes between individuals or organisations are generally resolved through compensation or court orders, not prison sentences.",
    explanation:
      "Criminal law involves offences against the state where prosecution may lead to penalties such as fines or imprisonment. Civil law covers matters like contracts, negligence and property disputes. The same facts can sometimes raise both civil and criminal issues, but the processes and outcomes differ.",
    sourceReviewNeeded: true,
  },
  {
    id: "everyday-rights-consumer",
    category: "Everyday Law",
    shortTitle: "Consumer purchases",
    fact:
      "When you buy goods as a consumer in the UK, statutory rights may apply in addition to anything written in a shop’s returns policy.",
    explanation:
      "Consumer protection legislation can give buyers remedies when goods are faulty or not as described. A shop’s voluntary returns policy does not replace these statutory rights, though time limits and conditions still apply depending on the circumstances.",
    sourceReviewNeeded: true,
  },
  {
    id: "neighbour-principle",
    category: "Civil Law",
    shortTitle: "The neighbour principle",
    fact:
      "In Donoghue v Stevenson, Lord Atkin described owing a duty to take reasonable care not to harm those you ought to foresee would be affected by your acts or omissions.",
    explanation:
      "The neighbour principle remains influential in negligence, but modern courts may apply further tests in some duty-of-care situations. This module introduces the idea at beginner level; detailed duty analysis can be more complex.",
    sourceReviewNeeded: true,
  },
  {
    id: "not-every-accident",
    category: "Civil Law",
    shortTitle: "Not every accident is negligence",
    fact:
      "A person who suffers harm does not automatically have a successful negligence claim—duty, breach, causation and recognised damage must generally be established.",
    explanation:
      "The law compensates where reasonable care was breached in circumstances giving rise to a duty. Accidents without breach, without causation, or involving remote or unrecognised loss may not result in liability.",
    sourceReviewNeeded: true,
  },
  {
    id: "actus-mens-rea",
    category: "Criminal Law",
    shortTitle: "Actus reus and mens rea",
    fact:
      "Most criminal offences require both a guilty act (actus reus) and a guilty mind (mens rea), unless the offence is one of strict liability.",
    explanation:
      "The prosecution must generally prove the external element and the mental element defined for that offence. The precise mens rea—intention, recklessness or otherwise—depends on the offence charged.",
    sourceReviewNeeded: true,
  },
  {
    id: "motive-not-intention",
    category: "Criminal Law",
    shortTitle: "Motive is not intention",
    fact:
      "A defendant’s reason for acting (motive) is not the same as the intention or recklessness the law may require as mens rea.",
    explanation:
      "Someone may act from anger, desperation or even a sense of justice, but courts still ask whether the mental element for the offence charged is satisfied. Regret about an outcome does not necessarily negate mens rea.",
    sourceReviewNeeded: true,
  },
  {
    id: "assault-vs-battery",
    category: "Criminal Law",
    shortTitle: "Assault and battery",
    fact:
      "At introductory level, assault generally involves causing someone to apprehend immediate unlawful violence, while battery involves the application of unlawful force.",
    explanation:
      "These are related but distinct concepts. A threat may amount to assault without any physical contact; battery requires force. Charging decisions depend on the facts and severity.",
    sourceReviewNeeded: true,
  },
  {
    id: "reasonable-force-self-defence",
    category: "Criminal Law",
    shortTitle: "Reasonable force in self-defence",
    fact:
      "Self-defence generally requires an honest belief that force was necessary and that the force used was reasonable in the circumstances as believed.",
    explanation:
      "Williams (Gladstone) supports assessing necessity based on honest belief, but reasonableness of force is still required. Later authorities refine the objective assessment of reasonableness.",
    sourceReviewNeeded: true,
  },
  {
    id: "cra-2015-goods",
    category: "Everyday Law",
    shortTitle: "Consumer Rights Act 2015 — goods",
    fact:
      "Goods sold to consumers must generally be of satisfactory quality, fit for purpose and as described under the Consumer Rights Act 2015.",
    explanation:
      "These implied terms apply alongside any voluntary returns policy. Remedies for faulty goods may include repair, replacement or refund depending on timing and circumstances.",
    sourceReviewNeeded: true,
  },
  {
    id: "legal-info-not-advice",
    category: "Everyday Law",
    shortTitle: "Information is not advice",
    fact:
      "General legal information explains broad principles; legal advice applies the law to your specific situation.",
    explanation:
      "Educational resources like LexLearn help you learn concepts, but tailored guidance from a qualified adviser is needed when decisions depend on your individual facts.",
    sourceReviewNeeded: true,
  },
  {
    id: "tenancy-deposit-scheme",
    category: "Everyday Law",
    shortTitle: "Tenancy deposit protection",
    fact:
      "In England, most private tenancy deposits must be protected in a government-approved scheme within prescribed time limits.",
    explanation:
      "Landlords must also provide prescribed information to tenants. Failure to comply may affect deposit recovery and give tenants additional remedies. Wales has separate tenancy deposit rules.",
    sourceReviewNeeded: true,
  },
];

export const FEATURED_FACT_ID = "self-defence-weapons";

export function getLegalFact(id: string): LegalFact | undefined {
  return legalFacts.find((entry) => entry.id === id);
}

export function getFeaturedFact(): LegalFact {
  return getLegalFact(FEATURED_FACT_ID) ?? legalFacts[0]!;
}

export function getFactsByCategory(category: LawCategory): LegalFact[] {
  return legalFacts.filter((entry) => entry.category === category);
}

export function getLegalFactsForModule(moduleId: string): LegalFact[] {
  if (moduleId === "2") {
    return legalFacts.filter((f) =>
      ["neighbour-principle", "not-every-accident", "civil-vs-criminal"].includes(f.id)
    );
  }
  if (moduleId === "3") {
    return legalFacts.filter((f) =>
      ["actus-mens-rea", "motive-not-intention", "self-defence-weapons"].includes(f.id)
    );
  }
  if (moduleId === "4") {
    return legalFacts.filter((f) =>
      ["assault-vs-battery", "reasonable-force-self-defence", "self-defence-weapons"].includes(f.id)
    );
  }
  if (moduleId === "5") {
    return legalFacts.filter((f) =>
      ["cra-2015-goods", "legal-info-not-advice", "tenancy-deposit-scheme", "everyday-rights-consumer"].includes(f.id)
    );
  }
  return legalFacts;
}
