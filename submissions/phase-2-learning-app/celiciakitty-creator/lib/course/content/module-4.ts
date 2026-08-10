import type { LessonContent, QuizContent } from "@/lib/course/types";

export const module4Lesson: LessonContent = {
  moduleId: "4",
  title: "Assault, Self-Defence and Weapons",
  learningObjective:
    "Understand the basic distinction between assault and battery, when force may be lawful in self-defence, and why possession of a weapon may be treated as a separate legal issue under the law of England and Wales.",
  whyItMatters:
    "Disputes involving force arise in everyday life—from arguments in shop doorways to situations where someone believes they are about to be attacked. Criminal law distinguishes threatening behaviour from unlawful physical contact, and allows limited lawful self-defence. Separately, carrying weapons can be an offence even when someone claims they acted to protect themselves.",
  topics: [
    "What assault means",
    "What battery means",
    "Common assault",
    "Self-defence",
    "Defence of another person",
    "Honest belief in the need for force",
    "Reasonableness of the force used",
    "Excessive force",
    "Immediacy and pre-emptive force (introductory)",
    "Weapons possession as a separate offence or issue",
  ],
  explanation: [
    "Assault at introductory level usually means causing someone to apprehend immediate unlawful violence. Words alone may suffice in some circumstances, but there must generally be a credible threat of immediate force. Mere insults without a threat of violence are not usually assault.",
    "Battery is the intentional or reckless application of unlawful force to another person. Actual injury is not always required—a unwanted touch can amount to battery, though context and severity matter for charging and sentencing.",
    "Common assault is a summary offence covering assault or battery where no more serious offence (such as actual bodily harm) is charged. More serious injuries may lead to different charges under the Offences Against the Person Act 1861 or other legislation.",
    "Self-defence is a potential defence where a person uses force to protect themselves. The law does not require someone to wait until they are struck if they honestly believe force is necessary to prevent an attack, though the force used must still be reasonable in the circumstances as they believed them to be.",
    "Defence of another person follows similar principles: intervening to protect someone else may be lawful if the same conditions for self-defence are met in relation to that person’s situation.",
    "In R v Williams (Gladstone) [1984] 78 Cr App R 276, the Court of Appeal emphasised that a defendant may be judged on the facts as they honestly believed them to be—even if those beliefs were mistaken—when assessing whether force was necessary. This does not mean any belief is automatically accepted; the belief must be honestly held.",
    "Reasonableness of force is also required. The defendant’s honest belief about the need for force is not the end of the inquiry—the degree of force used must be reasonable in the circumstances as the defendant believed them to be. Later authorities, including cases such as R v Keane and R v Owino, refine how courts assess whether force was reasonable; this module introduces the concept only.",
    "Excessive force may defeat self-defence. A minor push in response to a verbal argument may be viewed differently from using a weapon where no weapon was threatened against the defendant.",
    "Immediacy and pre-emptive force: at introductory level, force may sometimes be justified where the defendant honestly believes an attack is imminent, but continued pursuit or retaliation after the danger has passed raises different questions. Each case depends on its facts.",
    "Weapons possession is often a separate legal issue. Acting in lawful self-defence does not automatically excuse the separate offence of unlawfully possessing or carrying a weapon. Offences may arise under legislation such as the Criminal Justice Act 1988 or the Offensive Weapons Act 2019, depending on the item, location and circumstances.",
  ],
  scenario: {
    title: "Outside the late-night shop",
    narrative: [
      "After closing time outside a convenience shop in Leeds, two customers argue loudly about queue-jumping. One steps close to the other, raises a hand and says: “Back off or you’ll regret it.”",
      "The second customer, Morgan, honestly believes they are about to be punched. Morgan pushes the other person away and a scuffle follows.",
      "When police arrive, they find Morgan was carrying a folding knife in their jacket pocket without lawful authority. Morgan says: “I carry it for protection—I only pushed them because I thought I was going to be attacked.”",
    ],
    analysisHeading: "What assault, self-defence and weapons issues appear here?",
    analysis: [
      "Raising a hand and threatening immediate violence may amount to assault if the other person apprehends unlawful force imminently.",
      "Morgan’s push may amount to battery, but self-defence could be raised if Morgan honestly believed force was necessary and the push was reasonable in those believed circumstances.",
      "Under Williams (Gladstone), Morgan may be judged partly on what they honestly believed was happening—even if mistaken—though the force must still be reasonable in those believed circumstances.",
      "If Morgan used disproportionate force (for example, drawing the knife when only a push was threatened), self-defence may fail.",
      "Lawful self-defence does not automatically excuse unlawfully carrying the folding knife—that is a separate question depending on the type of weapon, location and whether any lawful excuse applies.",
      "The outcome depends on evidence, charging decisions and the full facts—this scenario illustrates concepts, not a predicted result.",
    ],
  },
  caseSpotlightId: "r-v-williams-gladstone",
  keyTerms: [
    {
      term: "Assault",
      definition:
        "At introductory level: causing another person to apprehend immediate unlawful violence.",
    },
    {
      term: "Battery",
      definition:
        "The intentional or reckless application of unlawful force to another person.",
    },
    {
      term: "Self-defence",
      definition:
        "A potential defence where force is used honestly and reasonably to protect oneself from attack.",
    },
    {
      term: "Honest belief",
      definition:
        "The defendant’s genuine belief about the need for force; assessed subjectively in part (see Williams (Gladstone)).",
    },
    {
      term: "Reasonable force",
      definition:
        "Force that is proportionate to the threat as the defendant believed it to be; later cases refine the objective assessment.",
    },
    {
      term: "Defence of another",
      definition:
        "Using force to protect someone else, subject to similar principles as self-defence.",
    },
    {
      term: "Weapons offence",
      definition:
        "A separate criminal offence relating to possessing or carrying prohibited or bladed articles, assessed independently of self-defence claims.",
    },
  ],
  knowledgeCheck: {
    id: "m4-inline-1",
    prompt:
      "Morgan pushed someone after honestly believing an attack was imminent, but police also find an unlawfully carried knife. The best introductory statement is:",
    options: [
      "Self-defence automatically excuses carrying any weapon",
      "Self-defence and weapons possession may be assessed as separate legal issues",
      "Assault and battery are identical offences with the same definition",
      "Honest belief never matters in self-defence cases",
    ],
    correctIndex: 1,
    explanation:
      "Lawful self-defence does not automatically excuse a separate offence of unlawfully possessing or carrying a weapon.",
  },
  takeaways: [
    "Assault involves apprehension of immediate unlawful violence; battery involves unlawful force.",
    "Self-defence requires an honest belief that force was necessary and that the force used was reasonable in the believed circumstances.",
    "Williams (Gladstone) supports judging the defendant on facts as they honestly believed them to be, but reasonableness of force is still required.",
    "Later authorities refine how reasonable force is assessed—this module introduces the basics only.",
    "Weapons possession may be a separate offence even where self-defence is argued.",
  ],
};

export const module4Quiz: QuizContent = {
  moduleId: "4",
  title: "Module 4 Quiz: Assault, Self-Defence and Weapons",
  intro:
    "Apply what you learned using the late-night shop scenario and core concepts. Select the best answer for each question.",
  passThreshold: 3,
  questions: [
    {
      id: "m4-q1",
      prompt:
        "At introductory level, assault most commonly involves:",
      options: [
        "Any rude or insulting words",
        "Causing someone to apprehend immediate unlawful violence",
        "Accidental bumping in a crowded shop",
        "Breaching a contract",
      ],
      correctIndex: 1,
      explanation:
        "Assault is about causing apprehension of immediate unlawful violence, not mere insults or accidents.",
    },
    {
      id: "m4-q2",
      prompt:
        "Battery is best described as:",
      options: [
        "A civil negligence claim only",
        "The intentional or reckless application of unlawful force to another",
        "Possessing any item in a public place",
        "Failing to pay for goods",
      ],
      correctIndex: 1,
      explanation:
        "Battery involves unlawful force; injury is not always required.",
    },
    {
      id: "m4-q3",
      prompt:
        "R v Williams (Gladstone) is important because it emphasises:",
      options: [
        "That defendants are always judged on what actually happened, ignoring their beliefs",
        "That a defendant may be judged on the facts as they honestly believed them to be when assessing necessity of force",
        "That any weapon carried in self-defence is automatically lawful",
        "That assault requires physical injury",
      ],
      correctIndex: 1,
      explanation:
        "Honest (even mistaken) belief about circumstances can be relevant, though force must still be reasonable in those believed circumstances.",
    },
    {
      id: "m4-q4",
      prompt:
        "Morgan honestly believed an attack was imminent and pushed the other person. Self-defence may fail if:",
      options: [
        "Morgan genuinely held any belief at all",
        "The force used was excessive or unreasonable in the circumstances as Morgan believed them to be",
        "The incident happened outside a shop",
        "Police were called",
      ],
      correctIndex: 1,
      explanation:
        "Honest belief is not enough on its own—the degree of force must also be reasonable in the believed circumstances.",
    },
    {
      id: "m4-q5",
      prompt:
        "Morgan carried a folding knife without lawful authority. At introductory level:",
      options: [
        "Lawful self-defence automatically excuses weapons possession",
        "Weapons possession may be a separate offence assessed independently of self-defence",
        "Knives can never be offences to carry",
        "Self-defence and weapons law are always the same charge",
      ],
      correctIndex: 1,
      explanation:
        "Acting in lawful self-defence does not automatically excuse unlawfully possessing or carrying a weapon.",
    },
  ],
};
