/**
 * Generates supabase/migrations/0004_seed_curriculum.sql from authored curriculum.
 * Run: node scripts/generate-seed-curriculum.mjs
 */
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, "../supabase/migrations/0004_seed_curriculum.sql");

function dq(tag, s) {
  // Dollar-quote; pick a tag that does not appear in content.
  let t = tag;
  let n = 0;
  while (s.includes(`$${t}$`)) {
    n += 1;
    t = `${tag}${n}`;
  }
  return `$${t}$${s}$${t}$`;
}

function j(obj) {
  return dq("json", JSON.stringify(obj));
}

function mdTable(headers, rows) {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
  return `${head}\n${sep}\n${body}`;
}

function list(items) {
  return items.map((i) => `- ${i}`).join("\n");
}

function assembleFullContent({
  foundation,
  aiEraDefinition,
  whyItMatters,
  whatItIs,
  whatItIsNot,
  centralTension,
  continuumRows,
  failureModes,
  lessonContent,
  practiceExercise,
  evidenceReflection,
  closingStatement,
  selfAssessment,
}) {
  return [
    "## Foundation",
    foundation,
    "",
    "## AI-era definition",
    aiEraDefinition,
    "",
    "## Why it matters",
    whyItMatters,
    "",
    "## What it is / What it is not",
    "### What it is",
    list(whatItIs),
    "",
    "### What it is not",
    list(whatItIsNot),
    "",
    "## Central tension",
    centralTension,
    "",
    "## Behavioural continuum",
    mdTable(["Underused", "Balanced", "Overused"], continuumRows),
    "",
    "## AI-era failure modes",
    failureModes,
    "",
    "## Lesson content",
    lessonContent,
    "",
    "## Practice exercise",
    practiceExercise,
    "",
    "## Evidence reflection",
    evidenceReflection,
    "",
    "## Self-assessment",
    selfAssessment,
    "",
    "## Closing statement",
    closingStatement,
  ].join("\n");
}

function previewContent({ framing, focusBullets }) {
  return [
    "## Preview",
    framing,
    "",
    "## Focus",
    list(focusBullets),
    "",
    "## Coming next",
    'Full module coming next — this preview includes an introductory definition, the central AI question, and a short scenario. A complete development activity will follow in a later release.',
  ].join("\n");
}

// --- Full module content (verbatim from TEF_curriculum_spec.md) ---

const detachmentContent = assembleFullContent({
  foundation:
    "Detachment includes neutrality, separation of responsibility for process and content, the ability to support a group decision one may not personally prefer, and freedom from the need for status, recognition or credit. The facilitator must also maintain fairness toward people they may personally like or dislike.",
  aiEraDefinition: [
    "Detachment is the ability to evaluate an AI-generated output, preferred solution or personal interpretation without allowing ego, prior investment, status or the need to be right to control the decision.",
    "",
    "Detachment does not mean indifference. It means remaining responsible without becoming possessed by a preferred answer.",
  ].join("\n"),
  whyItMatters: [
    "AI outputs can create attachment quickly.",
    "",
    "The learner may become attached because:",
    "",
    list([
      "they invested time in the prompt;",
      "the output sounds impressive;",
      "it supports an existing belief;",
      "it strengthens their status;",
      "they have already presented it publicly;",
      "or abandoning it feels like admitting failure.",
    ]),
    "",
    "A person can become more committed to a generated answer than the evidence justifies.",
    "",
    "Detachment protects the ability to say:",
    "",
    list([
      "This is useful, but incomplete.",
      "This was my idea, but it is not the best option.",
      "The group may need to own this decision.",
      "The model's confidence is not evidence.",
      "I can change direction without losing credibility.",
    ]),
  ].join("\n"),
  whatItIs: [
    "Releasing the need to be right",
    "Separating evaluation from ego",
    "Recognising AI as an input rather than an authority",
    "Allowing people to influence decisions that affect them",
    "Letting go of sunk costs",
    "Remaining fair toward opposing perspectives",
    "Supporting learning rather than imposing correction",
  ],
  whatItIsNot: [
    "Lack of care",
    "Avoiding accountability",
    "Refusing to recommend a course of action",
    "Treating every option as equally valid",
    "Allowing harmful decisions to proceed unchallenged",
    "Disengaging when disagreement appears",
    "Pretending not to have values",
  ],
  centralTension: [
    "Detachment is balanced by Engagement.",
    "",
    "**Without Detachment**",
    "",
    "I may:",
    "",
    list(["control;", "defend;", "impose;", "personalise disagreement;", "or use AI to strengthen authority."]),
    "",
    "**Without Engagement**",
    "",
    "I may:",
    "",
    list([
      "withdraw;",
      "refuse responsibility;",
      "avoid difficult intervention;",
      "or claim neutrality when action is required.",
    ]),
    "",
    "**Balanced expression**",
    "",
    "I can care deeply about the quality of the outcome without needing the outcome to validate me.",
  ].join("\n"),
  continuumRows: [
    ["Defends preferred answers", "Evaluates evidence and ownership", "Withdraws from responsibility"],
    ["Confuses disagreement with resistance", "Supports constructive challenge", "Treats all outcomes as equivalent"],
    ["Uses AI to reinforce authority", "Treats AI as one input", "Avoids making recommendations"],
    ["Needs credit for the solution", "Allows shared ownership", "Becomes indifferent to impact"],
    ["Corrects people prematurely", "Allows learning and participation", "Fails to intervene when harm is likely"],
  ],
  failureModes: [
    "**Automation bias**",
    "",
    "Accepting AI output because it appears authoritative.",
    "",
    "**Prompt ownership**",
    "",
    "Treating the generated answer as personal intellectual property because one created the prompt.",
    "",
    "**Sunk-cost attachment**",
    "",
    "Continuing with a weak solution because of time already invested.",
    "",
    "**Fluency capture**",
    "",
    "Confusing polished expression with sound reasoning.",
    "",
    "**Status defence**",
    "",
    "Resisting correction because the output has already been presented to leaders.",
    "",
    "**Artificial consensus**",
    "",
    "Using numerous generated arguments to overwhelm dissent.",
  ].join("\n"),
  lessonContent: [
    "AI can produce a proposal so complete that it appears ready for implementation. That completeness may trigger premature loyalty.",
    "",
    "The effective facilitator asks:",
    "",
    list([
      "What evidence supports this?",
      "What evidence challenges it?",
      "What is missing?",
      "Who is affected?",
      "Who should own the decision?",
      "Am I protecting the solution, or serving the purpose?",
      "Would I judge this differently if someone else had generated it?",
    ]),
    "",
    'Detachment becomes especially important when the "best" decision and the "owned" decision are not the same.',
    "",
    "A technically superior decision may fail if:",
    "",
    list([
      "affected people do not understand it;",
      "employees cannot implement it;",
      "the process damages trust;",
      "local knowledge was excluded;",
      "or people have no meaningful route to challenge it.",
    ]),
    "",
    "The facilitator must decide whether the situation requires:",
    "",
    list(["correction;", "participation;", "experimentation;", "learning;", "or release."]),
  ].join("\n"),
  practiceExercise: [
    "Choose a real AI-assisted decision or proposal.",
    "",
    "**Part 1 --- My preferred answer**",
    "",
    "Record:",
    "",
    list([
      "What do I currently believe should happen?",
      "How much time have I invested?",
      "What have I already communicated to others?",
      "What personal need may be attached to this answer?",
    ]),
    "",
    "**Part 2 --- Strongest challenge**",
    "",
    "Identify:",
    "",
    list([
      "three assumptions;",
      "two missing perspectives;",
      "one reason the answer may fail;",
      "one reason another person may reasonably disagree;",
      "and one condition under which you would abandon it.",
    ]),
    "",
    "**Part 3 --- Ownership**",
    "",
    "Ask:",
    "",
    list([
      "Who is affected?",
      "Who should contribute?",
      "Who should decide?",
      "Who remains accountable?",
      "When might ownership matter more than apparent optimisation?",
    ]),
  ].join("\n"),
  evidenceReflection: list([
    "What did you initially want to happen?",
    "What attachment did you recognise?",
    "What changed after considering other perspectives?",
    "What decision was made?",
    "What evidence influenced you?",
    "Did you remain engaged after releasing your preferred outcome?",
    "What will you practise next?",
  ]),
  closingStatement: "Detachment allows us to use powerful outputs without becoming controlled by them.",
  selfAssessment: [
    "Rate from 1 to 5.",
    "",
    "1. I can discard an AI-generated answer after investing time refining it.",
    "2. I remain constructive when others reject my preferred solution.",
    "3. I separate the quality of an idea from who created it.",
    "4. I can recognise when my need to appear capable is influencing a decision.",
    "5. I allow affected people to shape decisions that concern them.",
    "6. I can challenge an AI output that supports my existing view.",
    "7. I sometimes continue defending an answer because I have already presented it publicly. **Reverse-scored**",
    "8. When I disagree with a group, I may withdraw rather than continue supporting the process. **Distortion indicator**",
  ].join("\n"),
});

const intentionalityContent = assembleFullContent({
  foundation:
    'Intentionality connects with focused energy, humility, awareness of weakness, empathy, preparation and alignment with the desired outcome. It includes the reflective questions: "What am I doing and why?" and "What is the group doing?"',
  aiEraDefinition: [
    "Intentionality is the capacity to clarify the purpose, values and human responsibility governing AI use before selecting a tool, generating an output or automating a process.",
    "",
    "Intentionality prevents the tool from defining the task.",
  ].join("\n"),
  whyItMatters: [
    "AI encourages action before purpose is clear.",
    "",
    "A learner may begin with:",
    "",
    list([
      "Which tool should we use?",
      "What can we automate?",
      "What can the model produce?",
      "How quickly can we launch?",
    ]),
    "",
    "The discipline of Intentionality begins earlier:",
    "",
    list([
      "What are we trying to achieve?",
      "Why does it matter?",
      "Who should benefit?",
      "What values must be protected?",
      "What must remain human?",
      "What should not be done simply because it is possible?",
    ]),
    "",
    "Without Intentionality, convenience can silently become the objective.",
  ].join("\n"),
  whatItIs: [
    "Clarifying purpose",
    "Naming motives",
    "Aligning means and ends",
    "Identifying values and responsibilities",
    "Determining appropriate boundaries",
    "Preparing deliberately",
    "Recognising hidden agendas",
    "Choosing AI rather than defaulting to it",
  ],
  whatItIsNot: [
    "Controlling every outcome",
    "Refusing flexibility",
    "Assuming good intentions guarantee good impact",
    "Using purpose statements as public relations",
    "Treating technology as neutral",
    "Demanding certainty before beginning",
    "Believing intention excuses harmful consequences",
  ],
  centralTension: [
    "Intentionality must remain open to feedback.",
    "",
    "**Underused**",
    "",
    "It becomes:",
    "",
    list(["reactive;", "tool-led;", "unclear;", "convenience-driven;", "easily distracted."]),
    "",
    "**Balanced**",
    "",
    "It is:",
    "",
    list(["purposeful;", "ethically aware;", "adaptive;", "explicit about responsibility."]),
    "",
    "**Overused**",
    "",
    "It becomes:",
    "",
    list([
      "rigid;",
      "controlling;",
      "unable to revise;",
      "attached to an idealised outcome;",
      "dismissive of emergence.",
    ]),
  ].join("\n"),
  continuumRows: [
    ["Selects tools before defining outcomes", "Clarifies purpose first", "Forces all activity into a fixed plan"],
    ["Automates because it is possible", "Determines what should be automated", "Resists adaptation"],
    [
      "Allows convenience to become the goal",
      "Aligns means, values and outcomes",
      "Treats intention as more important than impact",
    ],
    ["Avoids examining motives", "Names competing motives", "Assumes motives are pure"],
    ["Leaves responsibility unclear", "Assigns human accountability", "Centralises excessive control"],
  ],
  failureModes: [
    "**Tool-first thinking**",
    "",
    "Beginning with the technology rather than the human problem.",
    "",
    "**Purpose drift**",
    "",
    "A project begins with one goal and gradually serves another.",
    "",
    "**Efficiency substitution**",
    "",
    "Speed or cost becomes the measure of success even when the original aim was access, fairness or quality.",
    "",
    "**Responsibility laundering**",
    "",
    "AI is used to create distance from a difficult decision.",
    "",
    "**Avoidance automation**",
    "",
    "A task is automated because a person does not want to perform the human responsibility involved.",
    "",
    "**Capability seduction**",
    "",
    "The organisation does something because AI makes it possible, not because it should be done.",
  ].join("\n"),
  lessonContent: [
    "Intentionality asks the learner to distinguish between the stated purpose and the operative purpose.",
    "",
    "For example:",
    "",
    "**Stated purpose**",
    "",
    "Improve access to public services.",
    "",
    "**Possible operative purpose**",
    "",
    "Reduce cost by reducing staff interaction.",
    "",
    "These purposes may coexist, but they are not identical.",
    "",
    "The effective facilitator names competing motives rather than hiding them.",
    "",
    "A responsible AI project should clarify:",
    "",
    list([
      "intended outcome;",
      "affected people;",
      "public or organisational value;",
      "unacceptable consequences;",
      "human accountability;",
      "non-delegable decisions;",
      "indicators of success.",
    ]),
    "",
    "The most important question is not:",
    "",
    "What can AI do?",
    "",
    "It is:",
    "",
    "What are we responsible for doing well?",
  ].join("\n"),
  practiceExercise: [
    "Choose an upcoming AI-supported task.",
    "",
    "Complete:",
    "",
    "**Purpose**",
    "",
    list(["What am I trying to achieve?", "Why does this matter?", "Who should benefit?"]),
    "",
    "**Motives**",
    "",
    list([
      "Why am I using AI?",
      "What am I hoping to avoid?",
      "What personal or organisational interest is present?",
    ]),
    "",
    "**Boundaries**",
    "",
    list([
      "What may AI assist with?",
      "What must remain human?",
      "What must be verified?",
      "What should not be automated?",
    ]),
    "",
    "**Accountability**",
    "",
    list([
      "Who decides?",
      "Who reviews?",
      "Who can challenge?",
      "Who is responsible for consequences?",
    ]),
    "",
    "**Success**",
    "",
    list([
      "How will we know the use was beneficial?",
      "What negative effect would indicate that the approach should change?",
    ]),
  ].join("\n"),
  evidenceReflection: list([
    "What was your stated purpose?",
    "What other motives emerged?",
    "Did the selected use of AI remain aligned?",
    "What did you decide not to delegate?",
    "What boundary did you establish?",
    "What would cause you to change the approach?",
  ]),
  closingStatement:
    "Intentionality ensures that AI remains a means rather than becoming the author of the purpose.",
  selfAssessment: [
    "Rate from 1 to 5.",
    "",
    "1. I define the human outcome before selecting an AI tool.",
    "2. I can clearly explain why AI is appropriate for a task.",
    "3. I identify what should not be delegated.",
    "4. I examine whether convenience is replacing responsibility.",
    "5. I consider how the process reflects organisational or personal values.",
    "6. I name competing motives honestly.",
    "7. I usually start with what the tool can do rather than what the situation requires. **Reverse-scored**",
    "8. Once I establish an intention, I find it difficult to revise it. **Overuse indicator**",
  ].join("\n"),
});

const wonderContent = assembleFullContent({
  foundation:
    "Sense of Wonder is openness to surprise before experience is placed into a familiar category. It involves holding fear and fascination together, allowing one's existing image of a group or situation to be challenged, and developing respect for the depth and possibility present. It is connected to wonder with creativity, motivation, trust and greater awareness.",
  aiEraDefinition:
    "Sense of Wonder is the capacity to remain curious, receptive and imaginatively alive in the presence of uncertainty, so that possibilities can be perceived before they are reduced to familiar categories, inherited assumptions or machine-generated patterns.",
  whyItMatters: [
    "AI can provide an answer before the question is fully experienced.",
    "",
    "A polished output may create premature completion.",
    "",
    "Once the complete proposal is seen, you may begin:",
    "",
    list([
      "editing the AI's idea;",
      "improving its framing;",
      "selecting among its options;",
      "or defending its assumptions.",
    ]),
    "",
    "The imaginative field has already narrowed.",
    "",
    "The risk is not simply that AI will produce creative work. The deeper risk is that people may stop practising the conditions from which creativity grows:",
    "",
    list([
      "attention;",
      "curiosity;",
      "ambiguity;",
      "incubation;",
      "independent perception;",
      "play;",
      "surprise;",
      "and the courage to explore what is not yet validated.",
    ]),
    "",
    "**Wonder and creativity**",
    "",
    "Creativity does not begin with production.",
    "",
    "It begins with:",
    "",
    "1. Openness",
    "2. Attention",
    "3. Curiosity",
    "4. Imagination",
    "5. Courage",
    "6. Expression",
    "",
    "AI is highly capable at expression and variation.",
    "",
    "Human creativity, however, also requires:",
    "",
    list([
      "sensing what is missing;",
      "asking a question no one has framed;",
      "recognising meaning;",
      "connecting lived experience;",
      "imagining a future not contained in past data;",
      "and deciding what deserves to be created.",
    ]),
  ].join("\n"),
  whatItIs: [
    "Remaining open before concluding",
    "Seeing possibility beyond precedent",
    "Allowing surprise",
    "Protecting incubation",
    "Questioning inherited categories",
    "Imagining what does not yet exist",
    "Recognising human potential beyond prediction",
    "Exploring before optimising",
  ],
  whatItIsNot: [
    "Accepting every new idea",
    "Rejecting evidence",
    "Romanticising novelty",
    "Avoiding practical constraints",
    "Remaining permanently undecided",
    "Treating surprise as proof",
    "Generating endlessly without choosing",
    "Assuming imagination removes responsibility",
  ],
  centralTension: [
    "Wonder must be balanced with discernment and action.",
    "",
    "**Underused**",
    "",
    "It becomes:",
    "",
    list([
      "closed;",
      "overly certain;",
      "dependent on precedent;",
      "anchored by first answers;",
      "dismissive of incomplete ideas.",
    ]),
    "",
    "**Balanced**",
    "",
    "It is:",
    "",
    list([
      "open;",
      "curious;",
      "discerning;",
      "willing to incubate;",
      "capable of choosing and developing.",
    ]),
    "",
    "**Overused**",
    "",
    "It becomes:",
    "",
    list([
      "endlessly exploratory;",
      "novelty-seeking;",
      "unwilling to commit;",
      "detached from feasibility;",
      "inspired but inactive.",
    ]),
  ].join("\n"),
  continuumRows: [
    ["Accepts first plausible answer", "Explores several frames", "Generates endlessly"],
    ["Automates existing assumptions", "Reimagines the underlying purpose", "Rejects useful structure"],
    ["Treats prediction as destiny", "Sees patterns and possibilities", "Ignores evidence"],
    ["Demands immediate usefulness", "Protects incubation", "Avoids decisions"],
    ["Uses AI before forming ideas", "Uses AI to expand thought", "Chases novelty"],
  ],
  failureModes: [
    "**Premature completion**",
    "",
    "Receiving a polished answer before the question has matured.",
    "",
    "**Anchoring**",
    "",
    "Allowing the first generated framing to determine all later thought.",
    "",
    "**Historical capture**",
    "",
    "Assuming the future must resemble available data.",
    "",
    "**Template dependency**",
    "",
    "Beginning with examples rather than observation.",
    "",
    "**Creative displacement**",
    "",
    "Allowing AI to produce the initial idea, direction and meaning.",
    "",
    "**Prediction as identity**",
    "",
    "Treating a person or group as equivalent to a model's category or forecast.",
    "",
    "**Productivity confusion**",
    "",
    "Assuming more outputs mean more creativity.",
  ].join("\n"),
  lessonContent: [
    "AI systems generate from patterns. They can identify likely combinations from what already exists.",
    "",
    "Human imagination can commit to what is not yet likely.",
    "",
    "This matters when organisations transform services.",
    "",
    "Without Sense of Wonder, an organisation may:",
    "",
    list([
      "digitise the form;",
      "automate the rejection;",
      "accelerate the transaction;",
      "reproduce historical categories;",
      "and measure success through speed and cost.",
    ]),
    "",
    "With Sense of Wonder, it may ask:",
    "",
    list([
      "Why does this form exist?",
      "What need is the person actually trying to meet?",
      "What categories exclude people?",
      "What would access look like if the current process did not exist?",
      "Where does human judgment create value?",
      "What possibility is absent from the historical records?",
      "What should be created rather than automated?",
    ]),
    "",
    "Wonder does not reject current reality.",
    "",
    "It holds two truths:",
    "",
    "We must see reality accurately.",
    "Reality is not finished.",
  ].join("\n"),
  practiceExercise: [
    "Choose a corporate or government process being considered for AI.",
    "",
    "Complete:",
    "",
    "**Existing model**",
    "",
    list([
      "What does the process currently do?",
      "What assumptions does it preserve?",
      "What does it measure?",
      "Who benefits?",
      "Who struggles?",
    ]),
    "",
    "**AI proposal**",
    "",
    list([
      "What does AI improve?",
      "What does it reproduce?",
      "What does it ignore?",
      "What appears complete but remains unexamined?",
    ]),
    "",
    "**Imaginative redesign**",
    "",
    list([
      "What is the real human need?",
      "What would the service look like if designed today?",
      "What role should participation play?",
      "What possibilities are absent from the data?",
      "What should remain human?",
      "What should be created rather than automated?",
    ]),
  ].join("\n"),
  evidenceReflection: list([
    "What was your first idea?",
    "How did AI affect it?",
    "What assumption became visible?",
    "What possibility emerged that was not in the original process?",
    "Did you protect enough time for independent thought?",
    "What did you eventually choose?",
    "How will you preserve imagination in future AI-assisted work?",
  ]),
  closingStatement:
    "AI may expand what can be generated. Sense of Wonder preserves our capacity to imagine.",
  selfAssessment: [
    "Rate from 1 to 5.",
    "",
    "1. I form my own ideas before asking AI for examples.",
    "2. I can remain with a question without demanding immediate completion.",
    "3. I notice when an answer has narrowed my imagination.",
    "4. I consider possibilities not represented in historical data.",
    "5. I draw on lived experience when creating.",
    "6. I allow incomplete ideas time to develop.",
    "7. I assume the most polished idea is probably the strongest. **Reverse-scored**",
    "8. I sometimes remain in possibility so long that I avoid choosing. **Overuse indicator**",
  ].join("\n"),
});

// Fixed UUIDs for stable references
const PATHS = {
  others: "a1000000-0000-4000-8000-000000000001",
  myself: "a1000000-0000-4000-8000-000000000002",
  life: "a1000000-0000-4000-8000-000000000003",
};

const DISC = {
  detachment: "b2000000-0000-4000-8000-000000000001",
  focus: "b2000000-0000-4000-8000-000000000002",
  engagement: "b2000000-0000-4000-8000-000000000003",
  interior: "b2000000-0000-4000-8000-000000000004",
  wonder: "b2000000-0000-4000-8000-000000000005",
  intentionality: "b2000000-0000-4000-8000-000000000006",
  awareness: "b2000000-0000-4000-8000-000000000007",
  presence: "b2000000-0000-4000-8000-000000000008",
  action: "b2000000-0000-4000-8000-000000000009",
};

let scenarioSeq = 1;
function sid() {
  const n = String(scenarioSeq++).padStart(12, "0");
  return `c3000000-0000-4000-8000-${n}`;
}

const lines = [];
lines.push(`-- Phase A2 curriculum seed — replaces placeholder content from 0002.
-- Source: docs/curriculum/TEF_programme_outline.md + TEF_curriculum_spec.md (verbatim where finished).
-- Run manually in the Supabase SQL Editor AFTER 0003_curriculum.sql.
--
-- FLAGGED dilemma middle scores (spec only marks Best=4; 3/2/1 assigned by agent judgment):
--   Detachment:     C=4, B=3, A=2, D=1
--   Intentionality: B=4, D=3, A=2, C=1
--   Sense of Wonder: C=4, D=3, B=2, A=1
--
-- FLAGGED preview scenarios (composed for Focus, Engagement, Interior Dialogue, Awareness, Presence, Action):
--   review all six preview_scenario rows before production use.

begin;

-- Clear placeholder seed (and any learner progress tied to old rows).
delete from ludwitt_event_log;
delete from path_completions;
delete from progress;
delete from scenarios;
delete from disciplines;
delete from paths;

-- Paths
insert into paths (id, slug, title, sort_order) values
  (${dq("id", PATHS.others)}, 'regarding-others', 'Regarding Others — Authority, participation and ownership', 1),
  (${dq("id", PATHS.myself)}, 'regarding-myself', 'Regarding Myself — Agency, imagination and intention', 2),
  (${dq("id", PATHS.life)}, 'regarding-life', 'Regarding Life — Perception, uncertainty and intervention', 3);
`);

function insertDiscipline(row) {
  lines.push(`insert into disciplines (id, path_id, slug, title, sort_order, content_md, counterfeit_md, is_full_module, central_question, subtitle) values
  (
    ${dq("id", row.id)},
    ${dq("id", row.pathId)},
    ${dq("s", row.slug)},
    ${dq("s", row.title)},
    ${row.sort},
    ${dq("md", row.content)},
    '',
    ${row.full},
    ${dq("s", row.question)},
    ${dq("s", row.subtitle)}
  );
`);
}

function insertScenario(row) {
  const id = sid();
  lines.push(`insert into scenarios (id, discipline_id, prompt_md, rubric_md, kind, options, correct_key, explanation) values
  (
    ${dq("id", id)},
    ${dq("id", row.disciplineId)},
    ${dq("md", row.prompt)},
    '',
    ${dq("s", row.kind)},
    ${j(row.options)}::jsonb,
    ${row.correctKey ? dq("s", row.correctKey) : "null"},
    ${dq("s", row.explanation || "")}
  );
`);
}

// Disciplines
insertDiscipline({
  id: DISC.detachment,
  pathId: PATHS.others,
  slug: "detachment",
  title: "Detachment",
  sort: 1,
  full: true,
  subtitle: "Releasing attachment without abandoning responsibility",
  question:
    "Am I evaluating this output, or defending it because I have become invested in it?",
  content: detachmentContent,
});

insertDiscipline({
  id: DISC.focus,
  pathId: PATHS.others,
  slug: "focus",
  title: "Focus",
  sort: 2,
  full: false,
  subtitle: "Keeping purpose ahead of possibility",
  question: "What human outcome is this output intended to support?",
  content: previewContent({
    framing:
      "Focus keeps purpose ahead of possibility when AI can generate endlessly.",
    focusBullets: [
      "defining the real problem;",
      "avoiding endless generation;",
      "establishing decision criteria;",
      "distinguishing relevance from sophistication;",
      'determining what "good enough" means.',
    ],
  }),
});

insertDiscipline({
  id: DISC.engagement,
  pathId: PATHS.others,
  slug: "engagement",
  title: "Engagement",
  sort: 3,
  full: false,
  subtitle: "Retaining responsibility after delegation",
  question: "What remains my responsibility even though AI performed part of the task?",
  content: previewContent({
    framing:
      "Engagement retains responsibility after AI performs part of the work.",
    focusBullets: [
      "accountability;",
      "participation;",
      "human impact;",
      "care as action;",
      "intervention;",
      "responsibility for AI-assisted work.",
    ],
  }),
});

insertDiscipline({
  id: DISC.interior,
  pathId: PATHS.myself,
  slug: "interior-dialogue",
  title: "Interior Dialogue",
  sort: 1,
  full: false,
  subtitle: "Preserving independent judgment",
  question: "Is this my judgment, or have I adopted the system's framing?",
  content: previewContent({
    framing:
      "The original material describes Interior Dialogue as the process of challenging one's current thinking and deciding how to respond when accumulated technique is insufficient.",
    focusBullets: [
      "thinking before prompting;",
      "intuition, fear and bias;",
      "internal voices;",
      "metacognition;",
      "comparing one's initial position with AI recommendations;",
      "maintaining cognitive independence.",
    ],
  }),
});

insertDiscipline({
  id: DISC.wonder,
  pathId: PATHS.myself,
  slug: "sense-of-wonder",
  title: "Sense of Wonder",
  sort: 2,
  full: true,
  subtitle: "Seeing what is not yet there",
  question:
    "Am I using AI to expand possibility, or allowing it to define the limits of what I can imagine?",
  content: wonderContent,
});

insertDiscipline({
  id: DISC.intentionality,
  pathId: PATHS.myself,
  slug: "intentionality",
  title: "Intentionality",
  sort: 3,
  full: true,
  subtitle: "Choosing what the technology is for",
  question: "Why am I using AI here?",
  content: intentionalityContent,
});

insertDiscipline({
  id: DISC.awareness,
  pathId: PATHS.life,
  slug: "awareness",
  title: "Awareness",
  sort: 1,
  full: false,
  subtitle: "Seeing the whole situation",
  question: "What am I not noticing because the output appears complete?",
  content: previewContent({
    framing:
      "Awareness sees the whole situation when AI output appears complete.",
    focusBullets: [
      "observation versus interpretation;",
      "self-awareness;",
      "system limitations;",
      "context;",
      "bias;",
      "absent stakeholders;",
      "missing data;",
      "uncertainty.",
    ],
  }),
});

insertDiscipline({
  id: DISC.presence,
  pathId: PATHS.life,
  slug: "presence",
  title: "Presence",
  sort: 2,
  full: false,
  subtitle: "Remaining in the human situation",
  question:
    "Am I responding to what is happening, or to what the system predicts should be happening?",
  content: previewContent({
    framing:
      "The original framework provides a strong sequence for Presence: pay attention, notice what you are noticing, then selectively and intentionally share that awareness.",
    focusBullets: [
      "attention;",
      "listening;",
      "emotional and relational signals;",
      "not hiding behind dashboards or summaries;",
      "staying with uncertainty;",
      "selective and responsible intervention.",
    ],
  }),
});

insertDiscipline({
  id: DISC.action,
  pathId: PATHS.life,
  slug: "action",
  title: "Action",
  sort: 3,
  full: false,
  subtitle: "Acting without artificial certainty",
  question: "Do I need more intelligence, or do I need the courage to act?",
  content: previewContent({
    framing:
      "Action means deciding and intervening without waiting for artificial certainty from AI.",
    focusBullets: [
      "decisiveness;",
      "proportionate action;",
      "reversible decisions;",
      "delay risk;",
      "courage;",
      "intervention;",
      "follow-through;",
      "learning from consequences.",
    ],
  }),
});

// --- Detachment scenarios ---
insertScenario({
  disciplineId: DISC.detachment,
  kind: "dilemma",
  prompt: [
    "You lead a transformation team redesigning an internal approval process. After several days of prompting and refinement, you present an AI-generated workflow that is faster, cheaper and technically sophisticated.",
    "",
    "During the review, employees identify several situations the workflow does not handle well. They propose a simpler alternative that retains more human review.",
    "",
    "You believe your design is more advanced. What should you do?",
  ].join("\n"),
  // FLAG: middle scores assigned — C=4 (spec best), B=3, A=2, D=1
  options: [
    { key: "A", text: "Defend the AI-generated workflow because the employees may be resisting change.", score: 2 },
    { key: "B", text: "Withdraw your proposal and leave the group to decide without further involvement.", score: 3 },
    {
      key: "C",
      text: "Help the group compare both approaches against agreed criteria, including operational performance, human impact and accountability.",
      score: 4,
    },
    { key: "D", text: "Ask AI to produce stronger arguments supporting your preferred workflow.", score: 1 },
  ],
  correctKey: "C",
  explanation:
    "It preserves responsibility while releasing attachment to the preferred solution.",
});

insertScenario({
  disciplineId: DISC.detachment,
  kind: "recognition",
  prompt: [
    "**Recognition activity 1 --- Output or authority?**",
    "",
    "Classify each statement. Which statement best demonstrates balanced Detachment?",
    "",
    "**A.** The model reviewed more information than any individual could, so its recommendation should carry greater authority.",
    "",
    "**B.** The recommendation is useful, but we still need to verify its assumptions and decide whether it fits this context.",
    "",
    "**C.** I disagree with the group, so I will step back and let them deal with the consequences.",
    "",
    "**D.** I will help the group test the decision, even though it is not the option I preferred.",
  ].join("\n"),
  options: [
    { key: "A", text: "Statement A — Potential automation bias.", score: 0 },
    { key: "B", text: "Statement B — Balanced Detachment.", score: 1 },
    { key: "C", text: "Statement C — Overused Detachment or withdrawal.", score: 0 },
    { key: "D", text: "Statement D — Balanced Detachment.", score: 1 },
  ],
  correctKey: "D",
  explanation:
    "Balanced Detachment: I will help the group test the decision, even though it is not the option I preferred. (Statement B is also balanced.)",
});

insertScenario({
  disciplineId: DISC.detachment,
  kind: "recognition",
  prompt: [
    "**Recognition activity 2 --- The ownership question**",
    "",
    "A leadership team must choose between:",
    "- a highly optimised AI-generated restructuring plan; and",
    "- a less efficient plan developed with employees that has stronger support.",
    "",
    "Which question best reflects Detachment?",
  ].join("\n"),
  options: [
    { key: "A", text: "Which plan makes leadership appear most innovative?", score: 0 },
    { key: "B", text: "Which plan did the AI evaluate as statistically strongest?", score: 0 },
    {
      key: "C",
      text: "What combination of effectiveness, participation, learning and implementation matters in this decision?",
      score: 1,
    },
    { key: "D", text: "How can employees be persuaded to accept the optimised plan?", score: 0 },
  ],
  correctKey: "C",
  explanation: "",
});

const detachmentKC = [
  {
    prompt: "Detachment primarily requires the learner to:",
    options: [
      { key: "A", text: "Avoid having strong opinions", score: 0 },
      { key: "B", text: "Separate judgment from ego and preferred outcomes", score: 1 },
      { key: "C", text: "Accept whatever a group decides", score: 0 },
      { key: "D", text: "Use AI only for low-risk tasks", score: 0 },
    ],
    correctKey: "B",
  },
  {
    prompt: "Which is the strongest sign of automation bias?",
    options: [
      { key: "A", text: "Asking for alternative recommendations", score: 0 },
      { key: "B", text: "Checking the source data", score: 0 },
      { key: "C", text: "Accepting a recommendation because the system appears authoritative", score: 1 },
      { key: "D", text: "Involving stakeholders", score: 0 },
    ],
    correctKey: "C",
  },
  {
    prompt: "Detachment is most effective when balanced with:",
    options: [
      { key: "A", text: "Efficiency", score: 0 },
      { key: "B", text: "Engagement", score: 1 },
      { key: "C", text: "Optimism", score: 0 },
      { key: "D", text: "Prediction", score: 0 },
    ],
    correctKey: "B",
  },
  {
    prompt: "A group-owned decision may sometimes be preferable because:",
    options: [
      { key: "A", text: "Group decisions are always more accurate", score: 0 },
      { key: "B", text: "AI should never be used in collective decisions", score: 0 },
      {
        key: "C",
        text: "learning, commitment and implementation may matter alongside technical quality",
        score: 1,
      },
      { key: "D", text: "leaders should avoid responsibility", score: 0 },
    ],
    correctKey: "C",
  },
];
for (const kc of detachmentKC) {
  insertScenario({
    disciplineId: DISC.detachment,
    kind: "knowledge_check",
    prompt: kc.prompt,
    options: kc.options,
    correctKey: kc.correctKey,
    explanation: "",
  });
}

// --- Intentionality scenarios ---
insertScenario({
  disciplineId: DISC.intentionality,
  kind: "dilemma",
  prompt: [
    "A government department plans to introduce AI into its public-enquiry service. The stated objective is to improve access and reduce waiting times.",
    "",
    "During planning, the project gradually becomes focused on reducing staffing costs. The team proposes automating most interactions, including complex cases.",
    "",
    "What should happen next?",
  ].join("\n"),
  // FLAG: B=4 (spec best), D=3, A=2, C=1
  options: [
    { key: "A", text: "Continue, because cost reduction is a legitimate result of innovation.", score: 2 },
    {
      key: "B",
      text: "Pause and clarify whether the new design still serves the original public-service purpose.",
      score: 4,
    },
    { key: "C", text: "Ask AI to identify further opportunities to reduce human involvement.", score: 1 },
    { key: "D", text: "Launch the system and review the purpose after implementation.", score: 3 },
  ],
  correctKey: "B",
  explanation:
    "Intentionality requires examining whether the means remain aligned with the intended outcome.",
});

insertScenario({
  disciplineId: DISC.intentionality,
  kind: "recognition",
  prompt: [
    "**Recognition activity --- What is the real purpose?**",
    "",
    "Using AI to write difficult employee feedback.",
    "",
    "Several motives may be present: improve clarity; avoid discomfort; save time; maintain professional tone.",
    "",
    "Which motive creates the greatest risk if it remains unexamined?",
  ].join("\n"),
  options: [
    { key: "A", text: "Improve clarity", score: 0 },
    { key: "B", text: "Avoid discomfort", score: 1 },
    { key: "C", text: "Save time", score: 0 },
    { key: "D", text: "Maintain professional tone", score: 0 },
  ],
  correctKey: "B",
  explanation:
    "Avoiding the responsibility of directly engaging with the employee.",
});

const intentionalityKC = [
  {
    prompt: "Intentionality begins with:",
    options: [
      { key: "A", text: "Selecting the strongest model", score: 0 },
      { key: "B", text: "Clarifying purpose and responsibility", score: 1 },
      { key: "C", text: "Reducing the number of stakeholders", score: 0 },
      { key: "D", text: "Writing a detailed prompt", score: 0 },
    ],
    correctKey: "B",
  },
  {
    prompt: "Purpose drift occurs when:",
    options: [
      { key: "A", text: "A project changes after valid feedback", score: 0 },
      {
        key: "B",
        text: "The operative objective gradually differs from the stated objective",
        score: 1,
      },
      { key: "C", text: "A team uses more than one AI tool", score: 0 },
      { key: "D", text: "implementation takes longer than expected", score: 0 },
    ],
    correctKey: "B",
  },
  {
    prompt: "Which is a non-delegable human responsibility?",
    options: [
      { key: "A", text: "Generating draft options", score: 0 },
      { key: "B", text: "Formatting a report", score: 0 },
      {
        key: "C",
        text: "Determining acceptable consequences and accountability",
        score: 1,
      },
      { key: "D", text: "Summarising a document", score: 0 },
    ],
    correctKey: "C",
  },
  {
    prompt: "Intentionality becomes distorted when:",
    options: [
      { key: "A", text: "Purpose is explicit", score: 0 },
      { key: "B", text: "The learner remains open to evidence", score: 0 },
      {
        key: "C",
        text: "The learner becomes rigidly attached to a predetermined outcome",
        score: 1,
      },
      { key: "D", text: "Motives are examined", score: 0 },
    ],
    correctKey: "C",
  },
];
for (const kc of intentionalityKC) {
  insertScenario({
    disciplineId: DISC.intentionality,
    kind: "knowledge_check",
    prompt: kc.prompt,
    options: kc.options,
    correctKey: kc.correctKey,
    explanation: "",
  });
}

// --- Sense of Wonder scenarios ---
insertScenario({
  disciplineId: DISC.wonder,
  kind: "dilemma",
  prompt: [
    "A government agency is digitising a public-benefit application process.",
    "",
    "AI is used to analyse the current forms, approval criteria, rejection reasons and processing delays. It produces a redesigned workflow that is faster, less expensive and mostly automated.",
    "",
    "The proposal preserves the existing eligibility categories and documentation requirements while moving them online.",
    "",
    "Senior leaders are impressed and want implementation to begin immediately.",
    "",
    "What is the most important question the project team has not yet asked?",
  ].join("\n"),
  // FLAG: C=4 (spec best), D=3, B=2, A=1
  options: [
    { key: "A", text: "Which AI platform will process applications fastest?", score: 1 },
    { key: "B", text: "How can the existing process be automated with fewer staff?", score: 2 },
    {
      key: "C",
      text: "What could the service become if it were redesigned around people's needs rather than the current procedure?",
      score: 4,
    },
    { key: "D", text: "How quickly can users be trained to complete the new digital form?", score: 3 },
  ],
  correctKey: "C",
  explanation:
    "Sense of Wonder asks the team to imagine transformation rather than merely automate the past.",
});

insertScenario({
  disciplineId: DISC.wonder,
  kind: "recognition",
  prompt: [
    "**Recognition activity --- Automation or imagination?**",
    "",
    "Classify each project question. Which question best expresses imagination-focused Sense of Wonder?",
  ].join("\n"),
  options: [
    { key: "A", text: "How can we move the existing approval process online?", score: 0 },
    { key: "B", text: "Why does approval require these stages at all?", score: 1 },
    { key: "C", text: "How can AI reject incomplete applications faster?", score: 0 },
    {
      key: "D",
      text: "How might the service help applicants provide what is needed before rejection occurs?",
      score: 1,
    },
  ],
  correctKey: "B",
  explanation:
    "Imagination-focused. (Question about helping applicants before rejection is also imagination-focused.)",
});

const wonderKC = [
  {
    prompt: "Sense of Wonder protects creativity by:",
    options: [
      { key: "A", text: "Preventing all use of AI", score: 0 },
      {
        key: "B",
        text: "Keeping the learner open to possibilities beyond generated patterns",
        score: 1,
      },
      { key: "C", text: "Rejecting historical information", score: 0 },
      { key: "D", text: "Increasing the number of outputs", score: 0 },
    ],
    correctKey: "B",
  },
  {
    prompt: "Premature completion occurs when:",
    options: [
      { key: "A", text: "An idea is tested too early", score: 0 },
      {
        key: "B",
        text: "A complete-looking answer closes exploration before the question has developed",
        score: 1,
      },
      { key: "C", text: "A learner refuses to use AI", score: 0 },
      { key: "D", text: "A project takes too long", score: 0 },
    ],
    correctKey: "B",
  },
  {
    prompt: "Which question best expresses Sense of Wonder?",
    options: [
      { key: "A", text: "How can the existing process be automated?", score: 0 },
      { key: "B", text: "Which model produces the most options?", score: 0 },
      {
        key: "C",
        text: "What could this service become if the current process did not exist?",
        score: 1,
      },
      { key: "D", text: "How can staff be persuaded to adopt the tool?", score: 0 },
    ],
    correctKey: "C",
  },
  {
    prompt: "Wonder becomes distorted when:",
    options: [
      { key: "A", text: "Possibilities are explored", score: 0 },
      { key: "B", text: "Assumptions are questioned", score: 0 },
      {
        key: "C",
        text: "The learner generates endlessly but refuses to choose",
        score: 1,
      },
      { key: "D", text: "Lived experience is included", score: 0 },
    ],
    correctKey: "C",
  },
];
for (const kc of wonderKC) {
  insertScenario({
    disciplineId: DISC.wonder,
    kind: "knowledge_check",
    prompt: kc.prompt,
    options: kc.options,
    correctKey: kc.correctKey,
    explanation: "",
  });
}

// --- Preview scenarios (COMPOSED — flag for review) ---
const previews = [
  {
    id: DISC.focus,
    prompt: [
      "**Preview scenario — Focus**",
      "",
      "Core AI question: What human outcome is this output intended to support?",
      "",
      "Your team has generated twelve AI drafts for a stakeholder update. Each is polished and sophisticated. A decision is due in an hour.",
      "",
      "What should you do next?",
    ].join("\n"),
    options: [
      {
        key: "A",
        text: "Ask AI for twelve more variants so you do not miss a better option.",
        score: 1,
      },
      {
        key: "B",
        text: "Pick the most sophisticated draft because polish signals quality.",
        score: 2,
      },
      {
        key: "C",
        text: "Define the human outcome and decision criteria first, then select or stop generating against those criteria.",
        score: 4,
      },
      {
        key: "D",
        text: "Merge all drafts into one long document and send it as-is.",
        score: 1,
      },
    ],
    correctKey: "C",
  },
  {
    id: DISC.engagement,
    prompt: [
      "**Preview scenario — Engagement**",
      "",
      "Core AI question: What remains my responsibility even though AI performed part of the task?",
      "",
      "AI drafted a policy summary you will present to staff. You have not yet checked how the change will affect frontline teams.",
      "",
      "What remains your responsibility?",
    ].join("\n"),
    options: [
      {
        key: "A",
        text: "Nothing — once AI drafted it, the system owns the content.",
        score: 1,
      },
      {
        key: "B",
        text: "Formatting and slides only; substance is the model's job.",
        score: 2,
      },
      {
        key: "C",
        text: "Verifying impact, intervening where harm is likely, and remaining accountable for the AI-assisted work.",
        score: 4,
      },
      {
        key: "D",
        text: "Deleting the draft and refusing any AI assistance forever.",
        score: 2,
      },
    ],
    correctKey: "C",
  },
  {
    id: DISC.interior,
    prompt: [
      "**Preview scenario — Interior Dialogue**",
      "",
      "Core AI question: Is this my judgment, or have I adopted the system's framing?",
      "",
      "Before prompting, you had a clear view of the problem. After reading the model's recommendation, you notice you are now defending its framing as if it were your own.",
      "",
      "What should you do?",
    ].join("\n"),
    options: [
      {
        key: "A",
        text: "Accept the model's framing because it sounds more complete than yours.",
        score: 1,
      },
      {
        key: "B",
        text: "Compare your initial position with the recommendation and recover independent judgment before deciding.",
        score: 4,
      },
      {
        key: "C",
        text: "Ask the model to affirm that your original view was wrong.",
        score: 1,
      },
      {
        key: "D",
        text: "Ignore your intuition entirely — intuition is bias.",
        score: 2,
      },
    ],
    correctKey: "B",
  },
  {
    id: DISC.awareness,
    prompt: [
      "**Preview scenario — Awareness**",
      "",
      "Core AI question: What am I not noticing because the output appears complete?",
      "",
      "An AI report looks finished: clear charts, confident recommendations, no gaps listed.",
      "",
      "What should you look for next?",
    ].join("\n"),
    options: [
      {
        key: "A",
        text: "Nothing — completeness means the analysis is done.",
        score: 1,
      },
      {
        key: "B",
        text: "Only typographical errors in the executive summary.",
        score: 2,
      },
      {
        key: "C",
        text: "Absent stakeholders, missing data, bias, and uncertainty the polished output may hide.",
        score: 4,
      },
      {
        key: "D",
        text: "A second model to make the same report longer.",
        score: 1,
      },
    ],
    correctKey: "C",
  },
  {
    id: DISC.presence,
    prompt: [
      "**Preview scenario — Presence**",
      "",
      "Core AI question: Am I responding to what is happening, or to what the system predicts should be happening?",
      "",
      "In a tense meeting, the dashboard predicts escalation risk is low. People in the room look shut down and avoid eye contact.",
      "",
      "What should you do?",
    ].join("\n"),
    options: [
      {
        key: "A",
        text: "Trust the dashboard and move on — prediction beats perception.",
        score: 1,
      },
      {
        key: "B",
        text: "Stay with what you are noticing in the room and intervene selectively if needed.",
        score: 4,
      },
      {
        key: "C",
        text: "Hide behind a longer AI summary of the agenda.",
        score: 1,
      },
      {
        key: "D",
        text: "Leave the meeting because uncertainty is uncomfortable.",
        score: 2,
      },
    ],
    correctKey: "B",
  },
  {
    id: DISC.action,
    prompt: [
      "**Preview scenario — Action**",
      "",
      "Core AI question: Do I need more intelligence, or do I need the courage to act?",
      "",
      "You have enough information for a reversible pilot. The team wants another analysis cycle because AI can always generate more options.",
      "",
      "What should you do?",
    ].join("\n"),
    options: [
      {
        key: "A",
        text: "Delay indefinitely until the model reports certainty.",
        score: 1,
      },
      {
        key: "B",
        text: "Act with a proportionate, reversible step and learn from consequences.",
        score: 4,
      },
      {
        key: "C",
        text: "Generate fifty more options before any decision.",
        score: 2,
      },
      {
        key: "D",
        text: "Act irreversibly at full scale to show decisiveness.",
        score: 2,
      },
    ],
    correctKey: "B",
  },
];

for (const p of previews) {
  insertScenario({
    disciplineId: p.id,
    kind: "preview_scenario",
    prompt: p.prompt,
    options: p.options,
    correctKey: p.correctKey,
    explanation: "Preview scenario composed from outline Core AI question + focus bullets — review before production.",
  });
}

lines.push(`
commit;
`);

writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`Wrote ${outPath}`);
console.log(`Scenarios inserted: ${scenarioSeq - 1}`);
