import type { LessonContent, QuizContent } from "@/lib/course/types";

export const module5Lesson: LessonContent = {
  moduleId: "5",
  title: "Your Everyday Legal Rights",
  learningObjective:
    "Recognise common legal protections affecting purchases, work, renting, and everyday disputes under the law of England and Wales.",
  whyItMatters:
    "Legal rights shape daily life—when a phone stops working, a landlord holds a deposit, or an employer ignores basic entitlements. Knowing where statutory protections apply, how to keep evidence, and when to seek professional advice helps you act confidently without confusing general information with personalised legal advice.",
  topics: [
    "Consumer rights when goods are faulty",
    "Online purchases and cooling-off rights (introductory)",
    "Services not carried out with reasonable care and skill",
    "Basic workplace rights",
    "Tenancy deposits and written records",
    "Keeping evidence",
    "Complaints and escalation",
    "When to seek professional advice",
    "Difference between legal information and legal advice",
  ],
  explanation: [
    "When you buy goods as a consumer, the Consumer Rights Act 2015 implies terms that goods must be of satisfactory quality, fit for purpose and as described. If goods are faulty, you may have remedies including repair, replacement or refund, depending on the timing and nature of the fault.",
    "Online and distance purchases may also involve cancellation rights under consumer protection regulations in some circumstances—for example, a cooling-off period for many distance contracts. Exceptions apply (such as sealed goods once opened, or bespoke items), so the exact rights depend on the facts.",
    "Services must generally be performed with reasonable care and skill. If a trader provides a service poorly, you may have remedies under the same Act, though the module introduces this at a high level only.",
    "Basic workplace rights include protections such as the National Minimum Wage, limits on working time, and protection against unlawful discrimination. Employment law is extensive; this module highlights that written terms, payslips and internal grievance procedures matter.",
    "Private tenants often pay deposits protected under a tenancy deposit scheme in England. Landlords must usually protect deposits within prescribed time limits and provide prescribed information. Written tenancy agreements and inventory records help resolve disputes about damage or unpaid rent.",
    "Keeping evidence—receipts, order confirmations, emails, photographs, timelines and complaint reference numbers—makes it easier to explain your case to a trader, landlord, employer, ombudsman or adviser.",
    "Complaints should usually be raised with the other party first (seller, landlord, employer), following any published complaints procedure. Escalation routes may include alternative dispute resolution, ombudsmen, or civil court action depending on the issue and value involved.",
    "Seek professional advice when the stakes are high, the law is complex, deadlines are approaching, or you face court proceedings. Citizens Advice, law centres and regulated solicitors can provide tailored guidance.",
    "Legal information (such as this course) explains general principles. Legal advice applies the law to your specific situation. LexLearn provides educational information only—it is not legal advice.",
  ],
  scenario: {
    title: "The faulty phone and delayed refund",
    narrative: [
      "Jamie buys a smartphone online from a UK retailer for £450. Within two weeks the screen flickers, the battery drains rapidly and the phone overheats.",
      "Jamie emails the seller reporting the faults and asks for a refund. The seller replies that Jamie must use a third-party repair service and that the company’s “30-day happiness guarantee” has expired—even though only 18 days have passed since delivery.",
      "Jamie keeps the order confirmation, delivery note, photos of the fault and copies of all emails, but the seller stops responding.",
    ],
    analysisHeading: "What everyday legal rights issues appear here?",
    analysis: [
      "Jamie likely bought as a consumer, so statutory rights under the Consumer Rights Act 2015 may apply in addition to the seller’s voluntary policy.",
      "Faulty goods may not meet the implied standards of satisfactory quality, fitness for purpose or being as described.",
      "At introductory level, Jamie may have a short-term right to reject within 30 days for many goods faults, though remedies can depend on timing and whether repair is attempted first.",
      "The seller’s vague repair-only response does not necessarily override statutory consumer remedies.",
      "Jamie’s records (order, photos, emails) support a structured complaint and any later escalation.",
      "If unresolved, Jamie might consider chargeback (for card payments), alternative dispute resolution, or advice from Citizens Advice—specific routes depend on the facts.",
    ],
  },
  statuteSpotlightId: "consumer-rights-act-2015",
  keyTerms: [
    {
      term: "Consumer",
      definition:
        "An individual acting for purposes outside their trade, business, craft or profession when buying goods or services.",
    },
    {
      term: "Satisfactory quality",
      definition:
        "Goods must meet the standard a reasonable person would expect, taking account of description, price and other relevant circumstances.",
    },
    {
      term: "Fitness for purpose",
      definition:
        "Goods must be fit for any particular purpose the consumer makes known to the seller.",
    },
    {
      term: "As described",
      definition:
        "Goods must match any description given to the consumer, including in advertising.",
    },
    {
      term: "Short-term right to reject",
      definition:
        "At introductory level: a consumer may reject faulty goods within 30 days in many cases and receive a refund.",
    },
    {
      term: "Tenancy deposit scheme",
      definition:
        "A government-approved scheme where landlords in England must protect most tenancy deposits within prescribed limits.",
    },
    {
      term: "Legal advice",
      definition:
        "Tailored guidance applying the law to your specific facts—different from general legal information.",
    },
  ],
  knowledgeCheck: {
    id: "m5-inline-1",
    prompt:
      "Jamie’s phone fails within 18 days. The seller cites an expired “happiness guarantee.” At introductory level, the best answer is:",
    options: [
      "Voluntary shop policies replace all statutory consumer rights",
      "Statutory consumer rights under the Consumer Rights Act 2015 may still apply",
      "Online purchases have no legal protections",
      "Jamie must always accept a repair and can never reject goods",
    ],
    correctIndex: 1,
    explanation:
      "Consumer Rights Act protections exist alongside voluntary policies; exact remedies depend on facts and timing.",
  },
  takeaways: [
    "Consumer Rights Act 2015 sets key standards for goods and services bought by consumers.",
    "Faulty goods may trigger repair, replacement or refund remedies depending on timing and circumstances.",
    "Keep written records—orders, emails, photos and timelines strengthen complaints.",
    "Workplace and tenancy rights also depend on written terms, deposits and proper procedures.",
    "LexLearn provides general legal information; seek professional advice for your specific situation.",
  ],
};

export const module5Quiz: QuizContent = {
  moduleId: "5",
  title: "Module 5 Quiz: Your Everyday Legal Rights",
  intro:
    "Apply what you learned using the faulty phone scenario and everyday rights concepts. Select the best answer for each question.",
  passThreshold: 3,
  questions: [
    {
      id: "m5-q1",
      prompt:
        "Under the Consumer Rights Act 2015, goods sold to consumers must generally be:",
      options: [
        "The cheapest available on the market",
        "Of satisfactory quality, fit for purpose and as described",
        "Sold only in physical shops, never online",
        "Covered only by the seller’s voluntary returns policy",
      ],
      correctIndex: 1,
      explanation:
        "These implied terms are central consumer protections for goods.",
    },
    {
      id: "m5-q2",
      prompt:
        "Jamie’s phone fails after 18 days. At introductory level, Jamie may have:",
      options: [
        "No rights because the seller’s guarantee expired",
        "A short-term right to reject faulty goods within 30 days in many cases",
        "Only the option to sue in criminal court",
        "Automatic imprisonment of the seller",
      ],
      correctIndex: 1,
      explanation:
        "The 30-day short-term right to reject is a key introductory remedy for faulty goods, subject to exceptions and facts.",
    },
    {
      id: "m5-q3",
      prompt:
        "Services provided by traders must generally be performed with:",
      options: [
        "No standard at all",
        "Reasonable care and skill",
        "A written guarantee from the customer",
        "Proof of a law degree",
      ],
      correctIndex: 1,
      explanation:
        "The Consumer Rights Act 2015 requires services to be performed with reasonable care and skill.",
    },
    {
      id: "m5-q4",
      prompt:
        "Why is keeping emails, photos and order confirmations useful?",
      options: [
        "They replace the need for any legal rights",
        "They provide evidence to support complaints and escalation",
        "They automatically win any court case",
        "They are only needed for criminal prosecutions",
      ],
      correctIndex: 1,
      explanation:
        "Good records help explain what happened and support negotiations or formal complaints.",
    },
    {
      id: "m5-q5",
      prompt:
        "The difference between legal information and legal advice is:",
      options: [
        "There is no difference",
        "Legal information explains general principles; legal advice applies the law to your specific situation",
        "Legal information is always binding on courts",
        "Legal advice is what LexLearn provides",
      ],
      correctIndex: 1,
      explanation:
        "LexLearn offers general educational information, not personalised legal advice.",
    },
  ],
};
