import type { LessonContent, QuizContent } from "@/lib/course/types";

export const module3Lesson: LessonContent = {
  moduleId: "3",
  title: "Crime: Acts, Intent and Responsibility",
  learningObjective:
    "Understand how actus reus and mens rea usually work together in establishing criminal liability under the law of England and Wales.",
  whyItMatters:
    "Criminal law defines conduct society treats as offences against the state. Prosecutions can lead to serious consequences including fines and imprisonment. Understanding actus reus (the guilty act) and mens rea (the guilty mind) helps you see why saying “I did not mean for it to happen” may not end the inquiry—and why the precise mental element depends on the offence charged.",
  topics: [
    "What criminal liability means",
    "Actus reus",
    "Voluntary conduct",
    "Omissions at an introductory level",
    "Mens rea",
    "Intention",
    "Recklessness",
    "Strict liability at an introductory level",
    "Coincidence of actus reus and mens rea",
    "Why motive is generally different from intention",
  ],
  explanation: [
    "Criminal liability arises when a person commits an offence as defined by law—usually requiring proof of conduct (and sometimes a result) together with the mental element specified for that offence. The prosecution must generally prove its case so that the jury or magistrates are sure (beyond reasonable doubt in trial on indictment).",
    "Actus reus is the external element of an offence—the conduct, circumstance or result the law prohibits. It must usually be voluntary. Reflex actions or movement while sleepwalking may raise questions about whether conduct was truly voluntary, depending on the facts and offence.",
    "Voluntary conduct means a willed bodily movement or action. Criminal law generally does not punish pure thoughts alone; there must usually be an act or, in limited cases, a legally recognised omission.",
    "At introductory level, an omission (a failure to act) can amount to actus reus only in limited situations—for example where a prior duty exists (such as a special relationship, assumption of responsibility, or statutory duty). The general rule is that there is no duty to rescue strangers, though specific contexts may differ.",
    "Mens rea is the mental element—what the defendant must have been thinking or aware of. Common categories include intention, recklessness, and sometimes negligence or knowledge, depending on the offence.",
    "Intention is the most serious form of mens rea. Direct intention means the defendant’s aim or purpose. Oblique (indirect) intention may exist where the defendant foresees a result as virtually certain even if it was not their primary aim—this area involves nuanced case law beyond this module.",
    "Recklessness generally involves taking an unjustified risk. In many offences, subjective recklessness (as discussed in R v Cunningham [1957] 2 QB 396) asks whether the defendant foresaw a risk and went on to take it anyway. The precise test can vary by offence.",
    "Strict liability offences do not require proof of mens rea in respect of at least one element—often a statutory matter such as selling alcohol to a minor. Defences and human rights considerations may still apply in some contexts.",
    "Actus reus and mens rea must usually coincide in time. If a person forms the intention to steal only after picking up an item innocently, the elements may not coincide as required—though continuing to keep the item after forming intent may change the analysis.",
    "Motive (why someone acted) is not the same as intention (what they meant to do or foresaw). A person may have a sympathetic motive but still act with criminal intent, or lack intent despite an bad motive. Courts focus on the required mens rea for the offence charged.",
  ],
  scenario: {
    title: "The damaged garden wall",
    narrative: [
      "During a heated argument in a shared alley in Manchester, Alex kicks a loose fence panel in frustration. The panel flies into a neighbour’s garden and damages a decorative brick wall.",
      "Alex tells police: “I did not mean for the wall to be damaged—I was just venting.” The neighbour reports criminal damage.",
      "The prosecution must consider whether Alex’s conduct satisfies the actus reus and mens rea for the offence charged.",
    ],
    analysisHeading: "What criminal liability issues appear here?",
    analysis: [
      "Actus reus may include the voluntary kick and the resulting damage to property—depending on how the offence is defined in statute or common law.",
      "Alex’s claim of not “meaning” the damage does not automatically exclude liability; the question is what mental element the offence requires.",
      "If recklessness is required, a court may ask whether Alex foresaw a risk of property damage and took it anyway when kicking the panel.",
      "If intention is required, the prosecution may examine whether damage was at least foreseen as virtually certain.",
      "Motive (frustration in an argument) is not a substitute for analysing mens rea—sympathy for a defendant’s feelings does not replace legal tests.",
      "The precise outcome depends on the offence charged and the evidence—this scenario illustrates concepts, not a predicted verdict.",
    ],
  },
  caseSpotlightId: "r-v-cunningham",
  keyTerms: [
    {
      term: "Criminal liability",
      definition:
        "Legal responsibility for committing an offence, generally proved by the prosecution to the required standard.",
    },
    {
      term: "Actus reus",
      definition:
        "The external element of an offence—conduct, circumstances or results prohibited by law.",
    },
    {
      term: "Mens rea",
      definition:
        "The mental element of an offence, such as intention or recklessness, depending on what the law requires.",
    },
    {
      term: "Voluntary conduct",
      definition:
        "A willed act; criminal liability generally requires conduct that is not a mere reflex.",
    },
    {
      term: "Recklessness (subjective)",
      definition:
        "At introductory level: foreseeing a risk of harm and going on to take it unjustifiably.",
    },
    {
      term: "Strict liability",
      definition:
        "Liability without proof of mens rea for at least one element of an offence, common in some regulatory crimes.",
    },
    {
      term: "Coincidence principle",
      definition:
        "Actus reus and mens rea must generally exist together at the time of the offence.",
    },
    {
      term: "Motive",
      definition:
        "The reason behind an act; distinct from the intention or recklessness required as mens rea.",
    },
  ],
  knowledgeCheck: {
    id: "m3-inline-1",
    prompt:
      "Alex says: “I did not mean for the wall to be damaged.” For many property damage offences, the key question is:",
    options: [
      "Whether a civil contract existed",
      "Whether the required mens rea (such as intention or recklessness) is satisfied",
      "Whether Alex had a good motive",
      "Whether negligence requires a duty of care",
    ],
    correctIndex: 1,
    explanation:
      "Criminal liability turns on the mental element the offence requires—not merely whether the defendant wishes the outcome had not occurred.",
  },
  takeaways: [
    "Criminal liability generally requires both actus reus and mens rea, unless the offence is strict liability.",
    "Conduct must usually be voluntary; omissions liability is limited at introductory level.",
    "Intention and recklessness are distinct mental states; recklessness often involves foreseen risk.",
    "R v Cunningham is a key starting point for subjective recklessness, but the precise mens rea depends on the offence charged.",
    "Motive is not the same as intention—courts apply the mental element defined for each offence.",
  ],
};

export const module3Quiz: QuizContent = {
  moduleId: "3",
  title: "Module 3 Quiz: Crime: Acts, Intent and Responsibility",
  intro:
    "Apply what you learned about actus reus and mens rea using the garden wall scenario. Select the best answer for each question.",
  passThreshold: 3,
  questions: [
    {
      id: "m3-q1",
      prompt: "Actus reus refers to:",
      options: [
        "The defendant’s motive for acting",
        "The external element of an offence—conduct, circumstances or results",
        "The civil law duty of care",
        "A type of contract acceptance",
      ],
      correctIndex: 1,
      explanation:
        "Actus reus is the “guilty act” or external element—the prohibited conduct or result.",
    },
    {
      id: "m3-q2",
      prompt:
        "In R v Cunningham, subjective recklessness is associated with:",
      options: [
        "Whether the defendant foresaw a risk and went on to take it",
        "Whether a reasonable person would have foreseen any risk",
        "Whether a contract was breached",
        "Whether strict liability applies to all crimes",
      ],
      correctIndex: 0,
      explanation:
        "Subjective recklessness focuses on what the defendant actually foresaw and whether they unjustifiably took the risk.",
    },
    {
      id: "m3-q3",
      prompt:
        "Alex kicks a fence panel in frustration and damages a wall. Alex’s statement “I did not mean it” most directly raises questions about:",
      options: [
        "Mens rea",
        "Consideration in contract law",
        "The neighbour principle",
        "Invitation to treat",
      ],
      correctIndex: 0,
      explanation:
        "Whether the required mental element is present is separate from the defendant’s regret about the outcome.",
    },
    {
      id: "m3-q4",
      prompt: "Motive and intention are best distinguished as:",
      options: [
        "They are always identical in criminal law",
        "Motive is why someone acted; intention is a legal mental element the offence may require",
        "Motive replaces the need for actus reus",
        "Intention only exists in civil negligence",
      ],
      correctIndex: 1,
      explanation:
        "A defendant may act from a understandable motive yet still satisfy intention or recklessness for an offence.",
    },
    {
      id: "m3-q5",
      prompt: "Strict liability offences at introductory level:",
      options: [
        "Never exist in English criminal law",
        "Require proof of intention for every element",
        "Do not require proof of mens rea for at least one element of the offence",
        "Are the same as negligence claims",
      ],
      correctIndex: 2,
      explanation:
        "Strict liability removes the mens rea requirement for at least one element, often in regulatory contexts.",
    },
  ],
};
