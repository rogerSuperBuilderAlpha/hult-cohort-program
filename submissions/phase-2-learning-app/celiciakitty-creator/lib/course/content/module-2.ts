import type { LessonContent, QuizContent } from "@/lib/course/types";

export const module2Lesson: LessonContent = {
  moduleId: "2",
  title: "Negligence and Duty of Care",
  learningObjective:
    "Understand the basic elements a claimant generally needs to establish in a negligence claim under the law of England and Wales.",
  whyItMatters:
    "Negligence is one of the most important areas of civil law. It governs when someone who has suffered harm can seek compensation from another person or organisation. From slips in cafés to careless driving, understanding duty of care, breach and causation helps you see why some accidents lead to legal responsibility and others do not.",
  topics: [
    "What negligence means",
    "Duty of care",
    "The neighbour principle",
    "Breach of duty",
    "Factual causation",
    "Legal causation and remoteness (introductory)",
    "Recognised damage or loss",
    "Why negligence does not mean every accident creates liability",
  ],
  explanation: [
    "Negligence is a civil wrong (a tort). In general terms, a claimant in negligence seeks to show that the defendant owed them a duty of care, breached that duty, and caused recoverable loss as a result. If successful, the claimant may recover damages. This is different from criminal liability, which is prosecuted by the state.",
    "A duty of care is a legal obligation to take reasonable care not to cause harm to others. Not every relationship gives rise to a duty—courts ask whether the circumstances make it fair, just and reasonable to impose one. In many everyday situations involving physical safety, a duty is likely to exist, but the precise scope of the duty can vary.",
    "In Donoghue v Stevenson [1932] AC 562, Lord Atkin described the “neighbour principle”: you must take reasonable care to avoid acts or omissions which you can reasonably foresee would be likely to injure your neighbour—persons so closely and directly affected by your conduct that you ought to have them in contemplation. This idea remains influential, though modern courts may apply additional tests in some situations.",
    "Breach of duty asks whether the defendant fell below the standard of care expected of a reasonable person in their position. Factors may include the likelihood of harm, the seriousness of possible injury, and the cost or practicality of precautions. A brief delay in mopping a floor might be judged differently from leaving a hazard unattended for hours.",
    "Factual causation (often discussed using the “but for” test) asks: but for the defendant’s breach, would the harm have occurred? If the answer is no, causation may be established at this stage. However, causation alone is not always enough.",
    "Legal causation and remoteness ask whether the harm was a reasonably foreseeable kind of result of the breach. Even where factual causation exists, a defendant may not be liable if the damage was too remote or caused by an intervening event. At introductory level, remember that foreseeability of the type of harm can limit liability.",
    "The claimant must generally show recognised damage or loss—such as personal injury, psychiatric injury (subject to legal rules), or property damage. Purely economic loss is treated differently in many situations and is not covered in depth here.",
    "Accidents happen without legal liability when one or more elements is missing. There may be no duty, no breach, no causation, or no recoverable damage. The law does not guarantee a perfect world—only that reasonable care is taken where a duty exists.",
  ],
  scenario: {
    title: "The café spill",
    narrative: [
      "A busy independent café in Cardiff serves hot drinks on a rainy afternoon. A barista mops a patch of floor after a customer knocks over water, but rushes back to the counter before the floor fully dries and does not put out a warning sign.",
      "Minutes later, Jordan slips on the wet area, falls awkwardly and injures their wrist. Jordan needs medical treatment and time off work.",
      "Jordan’s solicitor writes to the café owner asking who is responsible. The owner says staff mopped quickly and accidents sometimes happen in busy premises.",
    ],
    analysisHeading: "What negligence issues appear here?",
    analysis: [
      "A café operator likely owes customers a duty of care regarding safety on the premises—visitors are foreseeably affected by how the floor is maintained.",
      "Whether there was a breach depends on what a reasonable café would do: warning signs, cordoning off the area, or waiting until the floor is dry may all be relevant.",
      "Factual causation may turn on whether Jordan would have slipped but for the wet floor remaining unmarked or unguarded.",
      "Legal causation may ask whether a wrist injury from slipping on a wet floor is a foreseeable type of harm.",
      "Even if Jordan proves breach and causation, the café may raise arguments about contributory negligence if Jordan was running or wearing unsuitable footwear—outcomes depend on the full facts.",
      "This scenario does not automatically mean the café is liable; it illustrates the questions a court would examine.",
    ],
  },
  caseSpotlightId: "donoghue-v-stevenson",
  keyTerms: [
    {
      term: "Negligence",
      definition:
        "A civil tort where a claimant generally must prove duty, breach, causation and recognised damage.",
    },
    {
      term: "Duty of care",
      definition:
        "A legal obligation to take reasonable care to avoid causing harm to others in certain circumstances.",
    },
    {
      term: "Neighbour principle",
      definition:
        "Lord Atkin’s formulation in Donoghue v Stevenson: take reasonable care to avoid harming those foreseeably affected by your acts or omissions.",
    },
    {
      term: "Breach of duty",
      definition:
        "Failing to meet the standard of care expected of a reasonable person in the defendant’s position.",
    },
    {
      term: "Factual causation",
      definition:
        "Whether the harm would have occurred but for the defendant’s breach (the “but for” test at introductory level).",
    },
    {
      term: "Remoteness",
      definition:
        "Whether the harm was a reasonably foreseeable kind of consequence of the breach.",
    },
    {
      term: "Damages",
      definition:
        "Compensation awarded in civil cases to remedy recognised loss, such as injury or property damage.",
    },
  ],
  knowledgeCheck: {
    id: "m2-inline-1",
    prompt:
      "After mopping a wet floor, the café staff do not put up a warning sign. This is most directly relevant to:",
    options: [
      "Whether a contract was formed",
      "Whether there may have been a breach of duty in negligence",
      "Whether the customer committed a criminal offence",
      "Whether strict liability automatically applies",
    ],
    correctIndex: 1,
    explanation:
      "The sign (or lack of one) relates to whether reasonable precautions were taken— a key question in breach of duty, not contract or criminal law.",
  },
  takeaways: [
    "Negligence requires more than an accident—the claimant must generally prove duty, breach, causation and recognised damage.",
    "The neighbour principle from Donoghue v Stevenson remains a foundational idea, but modern duty analysis can be more complex.",
    "Breach is judged against the standard of a reasonable person in the defendant’s position.",
    "Both factual and legal causation matter; not every harm that follows a breach is legally recoverable.",
    "Reasonable precautions—such as warning signs after mopping—can be central to whether liability arises.",
  ],
};

export const module2Quiz: QuizContent = {
  moduleId: "2",
  title: "Module 2 Quiz: Negligence and Duty of Care",
  intro:
    "Apply what you learned about negligence using the café scenario and core concepts. Select the best answer for each question.",
  passThreshold: 3,
  questions: [
    {
      id: "m2-q1",
      prompt: "Negligence is best described at introductory level as:",
      options: [
        "Any accident where someone is injured",
        "A civil tort generally requiring duty, breach, causation and recognised damage",
        "A criminal offence prosecuted by the police",
        "A type of contract dispute",
      ],
      correctIndex: 1,
      explanation:
        "Negligence is a civil claim with several elements—not every accident satisfies them.",
    },
    {
      id: "m2-q2",
      prompt:
        "Lord Atkin’s neighbour principle in Donoghue v Stevenson emphasises:",
      options: [
        "Taking reasonable care to avoid harming those foreseeably affected by your conduct",
        "That manufacturers never owe duties to consumers",
        "That only written contracts create legal obligations",
        "That criminal intent must be proved beyond reasonable doubt",
      ],
      correctIndex: 0,
      explanation:
        "The neighbour principle focuses on foreseeable harm to those closely affected by your acts or omissions.",
    },
    {
      id: "m2-q3",
      prompt:
        "In the café scenario, leaving a freshly mopped floor without a warning sign is most relevant to:",
      options: [
        "Offer and acceptance",
        "Breach of duty",
        "Mens rea",
        "Consideration",
      ],
      correctIndex: 1,
      explanation:
        "Whether reasonable precautions were taken goes to breach—did the café fall below the expected standard of care?",
    },
    {
      id: "m2-q4",
      prompt:
        "The “but for” test at introductory level mainly helps establish:",
      options: [
        "Factual causation",
        "Strict liability",
        "Intention to create legal relations",
        "Actus reus",
      ],
      correctIndex: 0,
      explanation:
        "Factual causation asks whether the harm would have happened but for the defendant’s breach.",
    },
    {
      id: "m2-q5",
      prompt:
        "Jordan slips and injures their wrist. Why might the café not automatically be liable?",
      options: [
        "Accidents never give rise to civil claims",
        "One or more elements—such as breach, causation or remoteness—may not be established on the facts",
        "Cafés are always exempt from negligence law",
        "Personal injury can never be recognised damage",
      ],
      correctIndex: 1,
      explanation:
        "Liability is not automatic; each element of negligence must generally be proved, and defences or contributory factors may apply.",
    },
  ],
};
