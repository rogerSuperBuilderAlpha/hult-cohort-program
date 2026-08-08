import type { LessonContent, QuizContent } from "@/lib/course/types";

export const module1Lesson: LessonContent = {
  moduleId: "1",
  title: "Contracts in Everyday Life",
  learningObjective:
    "Understand what a contract is within civil law and identify the main elements generally required for an enforceable agreement under English law.",
  whyItMatters:
    "Civil law governs disputes between people and organisations—including everyday agreements to buy, sell, hire or provide services. Contracts are a core part of civil law. Recognising when words and conduct create a binding agreement helps you avoid misunderstandings when buying online, selling second-hand goods or agreeing informal deals.",
  topics: [
    "What is a contract in civil law?",
    "Offer",
    "Acceptance",
    "Consideration",
    "Intention to create legal relations",
  ],
  explanation: [
    "In civil law, a contract is generally a legally binding agreement between parties who intend to create legal relations, supported by consideration, and formed through offer and acceptance. If a dispute arises, civil courts may award remedies such as damages rather than imposing criminal penalties.",
    "An offer is a clear, definite proposal to enter into a contract on stated terms, made with the intention that it will become binding once accepted. It must be distinguished from an invitation to treat—an invitation for others to make offers, such as goods displayed in a shop window or items listed on a marketplace.",
    "Acceptance is an unqualified agreement to the terms of an offer. If the offeree changes the terms (for example, by proposing a lower price), that response is usually a counter-offer, which rejects the original offer and puts new terms on the table.",
    "Consideration means something of value exchanged between the parties—each side gives a legal benefit or suffers a legal detriment. A promise to give a gift, without anything being given in return, is generally not enforceable as a contract.",
    "Even where offer, acceptance, and consideration appear present, there must usually be intention to create legal relations. Social or domestic arrangements are often presumed not to be intended as legally binding, whereas commercial arrangements generally are.",
  ],
  scenario: {
    title: "The £500 laptop on Facebook Marketplace",
    narrative: [
      "Sam posts in a local Facebook group: “Selling my laptop—£500, collection from Manchester. Message me if interested.”",
      "Priya replies: “Would you take £450? I can collect on Saturday.”",
      "Sam responds: “Lowest I’ll go is £480. Cash on collection.”",
      "Priya then asks: “Great—what time on Saturday works for you?”",
    ],
    analysisHeading: "What civil-law contract ideas appear here?",
    analysis: [
      "Sam’s initial post is likely an invitation to treat, inviting offers rather than itself being an offer to everyone who reads it.",
      "Priya’s £450 message is probably a counter-offer (or an offer, depending on context), not acceptance of £500.",
      "Sam’s £480 message is a new offer. Priya’s question about collection time might look like acceptance, but without clearly agreeing to £480, there may still be no contract.",
      "If they eventually agree on £480 with cash on collection, consideration could be the laptop in exchange for £480.",
      "A private sale between individuals can still be commercial in nature, so courts may find intention to create legal relations—but each case depends on its facts.",
    ],
  },
  keyTerms: [
    {
      term: "Civil law",
      definition:
        "The branch of law dealing with disputes between individuals or organisations, often involving compensation or court orders.",
    },
    {
      term: "Contract",
      definition:
        "A legally binding agreement, generally requiring offer, acceptance, consideration, and intention to create legal relations.",
    },
    {
      term: "Offer",
      definition:
        "A definite proposal to contract on specific terms, intended to bind the offeror once accepted.",
    },
    {
      term: "Invitation to treat",
      definition:
        "An invitation to others to make offers; not itself an offer (e.g. many shop displays or general listings).",
    },
    {
      term: "Acceptance",
      definition:
        "Unqualified agreement to the terms of an offer, communicated in the manner required.",
    },
    {
      term: "Counter-offer",
      definition:
        "A response that changes the offer’s terms; it usually rejects the original offer.",
    },
    {
      term: "Consideration",
      definition:
        "Something of value exchanged—each party gives a benefit or bears a detriment.",
    },
    {
      term: "Intention to create legal relations",
      definition:
        "The parties’ shared intention that their agreement should have legal consequences.",
    },
  ],
  knowledgeCheck: {
    id: "m1-inline-1",
    prompt:
      "Sam’s Facebook post (“Selling my laptop—£500…”) is most likely:",
    options: [
      "A firm offer binding Sam to sell to the first person who replies",
      "An invitation to treat inviting others to make offers",
      "Acceptance of a buyer’s offer",
      "A completed contract with all Facebook group members",
    ],
    correctIndex: 1,
    explanation:
      "General advertisements and many listings invite offers rather than themselves being offers to the world at large.",
  },
  takeaways: [
    "Contracts are a foundation of civil law—they govern binding agreements between parties.",
    "Not every statement about price is an offer; invitations to treat are common in everyday sales.",
    "Changing the price or terms is typically a counter-offer, not acceptance.",
    "Both sides must generally provide consideration; pure gifts are not usually enforceable contracts.",
    "Context matters for intention—commercial dealings are treated differently from casual social arrangements.",
  ],
};

export const module1Quiz: QuizContent = {
  moduleId: "1",
  title: "Module 1 Quiz: Contracts in Everyday Life",
  intro:
    "Apply what you learned about civil-law contracts using the laptop scenario. Select the best answer for each question.",
  passThreshold: 3,
  questions: [
    {
      id: "m1-q1",
      prompt:
        "Sam’s initial post (“Selling my laptop—£500, collection from Manchester”) is best described as:",
      options: [
        "An offer that Sam must honour for any interested buyer",
        "An invitation to treat",
        "Acceptance of Priya’s future offer",
        "Consideration for Priya’s payment",
      ],
      correctIndex: 1,
      explanation:
        "Many general sale listings and advertisements are invitations to treat—they invite others to make offers rather than being offers themselves.",
    },
    {
      id: "m1-q2",
      prompt:
        "Priya replies: “Would you take £450?” Under classic English contract principles, this is most likely:",
      options: [
        "Acceptance of Sam’s £500 price",
        "A counter-offer (or a new offer), rejecting the original terms",
        "Consideration",
        "Proof that a contract already exists",
      ],
      correctIndex: 1,
      explanation:
        "Proposing different terms (here, £450 instead of £500) is usually a counter-offer, not acceptance of the original price.",
    },
    {
      id: "m1-q3",
      prompt:
        "Sam says: “Lowest I’ll go is £480. Cash on collection.” This message is most likely:",
      options: [
        "An invitation to treat",
        "A new offer on revised terms",
        "Acceptance of £450",
        "A social promise with no legal effect in any context",
      ],
      correctIndex: 1,
      explanation:
        "Sam is putting forward definite terms (£480, cash on collection), which is characteristic of a new offer after earlier negotiations.",
    },
    {
      id: "m1-q4",
      prompt:
        "If Sam agreed to give Priya the laptop for free with nothing in return, the main missing element for a contract would usually be:",
      options: [
        "Offer",
        "Acceptance",
        "Consideration",
        "A written signature",
      ],
      correctIndex: 2,
      explanation:
        "A one-sided gift lacks consideration—each party must generally give something of legal value in exchange.",
    },
    {
      id: "m1-q5",
      prompt:
        "Two friends casually agree over coffee that one will “help move sofa next week, no charge”—intention to create legal relations is:",
      options: [
        "Usually presumed in social/domestic settings",
        "Usually not presumed in social/domestic settings",
        "Irrelevant once there is a handshake",
        "Always presumed whenever money is mentioned",
      ],
      correctIndex: 1,
      explanation:
        "In social or domestic contexts, courts often presume parties did not intend to create legal relations, unlike typical commercial bargains.",
    },
  ],
};
