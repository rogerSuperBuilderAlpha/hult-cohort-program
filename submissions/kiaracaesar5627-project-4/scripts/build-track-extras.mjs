/**
 * Builds src/lib/track-extras.ts — 10 additional interview questions per track
 * (existing tracks have 10; merge → 20).
 */
import { writeFileSync } from "node:fs";
import { esc, renderSc } from "./extras/_util.mjs";

function sc(slug, stage, title, minutes, summary, scenario, interviewer, playbook, prompt, choices, answer, explain) {
  if (!/\?\s*$/.test(interviewer)) throw new Error(`Bad Q ${slug}: ${interviewer}`);
  return { slug, stage, title, minutes, summary, scenario, interviewer, playbook, prompt, choices, answer, explain };
}

/** Compact authoring: [slug, stage, title, mins, summary, setting, question, ...playbook(5), debriefPrompt, ...choices(4), answerIdx, explain] */
function row(a) {
  const [slug, stage, title, minutes, summary, scenario, interviewer, p0, p1, p2, p3, p4, prompt, c0, c1, c2, c3, answer, explain] = a;
  return sc(slug, stage, title, minutes, summary, scenario, interviewer, [p0, p1, p2, p3, p4], prompt, [c0, c1, c2, c3], answer, explain);
}

function track(slug, rows) {
  if (rows.length !== 10) throw new Error(`${slug} has ${rows.length}`);
  return [slug, rows.map(row)];
}

const TRACKS = [
  track("software-engineer", [
    ["tell-conflict", "Behavioral", "Teammate disagreement", 12, "Collaboration under disagreement.", "SWE behavioral round.", "Tell me about a time you disagreed with a teammate on a technical approach. How did you resolve it?", "Name the decision and stakes.", "Debate with evidence, not ego.", "What you decided and why.", "What shipped afterward.", "What you would do differently.", "Strong conflict stories show:", "Winning by volume", "Evidence, a decision, and a shipped outcome", "Avoiding the conflict", "Blaming process forever", 1, "Disagree and commit with receipts."],
    ["debug-prod", "Technical", "Unreproducible prod bug", 15, "Debugging judgment.", "SWE technical screen.", "Walk me through how you would debug a production incident where error rates spiked but you cannot reproduce it locally?", "Assess user impact and blast radius.", "Check recent deploys and dashboards.", "Form hypotheses from logs and metrics.", "Mitigate first if needed with rollback or flags.", "Capture follow-ups for the postmortem.", "Under unreproducible prod bugs you should:", "Only restart servers forever", "Impact, recent change, hypotheses, mitigate, learn", "Debug silently with no updates", "Blame the cloud vendor first", 1, "Mitigate then learn."],
    ["code-review", "Behavioral", "Critical code review", 10, "Review craft.", "SWE culture interview.", "Describe a time you gave or received critical feedback in a code review. What happened?", "Specific change and concern.", "How feedback was delivered.", "What changed in the PR.", "Relationship afterward.", "A review habit you kept.", "Interviewers want:", "Personal attacks", "Specific feedback that improved the change", "Rubber-stamping", "Blocking for style only", 1, "Raise the bar kindly."],
    ["tradeoff-api", "Case", "File upload API", 15, "Design judgment.", "SWE design lite.", "How would you design an internal API for uploading large files, and what tradeoffs would you call out?", "Sync versus async upload paths.", "Auth and scanning requirements.", "Idempotency and retries.", "Storage cost and retention.", "Failure modes and client UX.", "A strong API answer includes:", "Only framework names", "Tradeoffs, failure modes, and client experience", "Ignoring auth", "Assuming infinite storage", 1, "Tradeoffs are the interview."],
    ["oncall", "Behavioral", "On-call page", 12, "Ownership after hours.", "SWE reliability screen.", "Tell me about a memorable on-call page. What did you do in the first 15 minutes?", "Acknowledge and assess severity.", "Mitigate user impact.", "Communicate status.", "Find root cause after mitigation.", "Ship a follow-up fix or doc.", "Good on-call stories emphasize:", "Heroics with no communication", "Mitigation, communication, then root cause", "Ignoring severity", "Never writing follow-up", 1, "Stop the bleeding first."],
    ["mentor", "Behavioral", "Mentoring junior", 10, "Teaching leverage.", "SWE leveling interview.", "Tell me about a time you helped a more junior engineer grow. What did you do concretely?", "Their starting gap.", "How you coached without taking over.", "A milestone they hit.", "How you measured progress.", "What you learned as mentor.", "Mentorship answers should avoid:", "Doing all their work", "Concrete coaching and a milestone", "Vague I am supportive", "Only soft praise", 1, "Teach, do not absorb."],
    ["tech-debt", "Case", "Pay down debt", 12, "Product-engineering balance.", "SWE interview with PM present.", "How do you decide when to stop feature work and pay down tech debt?", "Evidence of user or ops pain.", "Risk if ignored.", "Cost to fix now versus later.", "Propose a thin slice.", "Align stakeholders explicitly.", "Tech debt prioritization needs:", "Never touch debt", "Evidence of pain, risk, and a thin-slice plan", "Rewrite everything", "Secret refactors only", 1, "Sell the risk."],
    ["security", "Technical", "Secure uploads", 12, "Secure defaults.", "SWE security-aware screen.", "What security checks would you insist on before shipping a new user-facing upload feature?", "Authorization on every object.", "Input validation and size limits.", "Malware scanning when files are stored.", "Least-privilege storage access.", "Audit logging and abuse rate limits.", "Security answers should include:", "We will add it later", "AuthZ, validation, limits, and abuse controls", "Only mentioning HTTPS", "Security through obscurity", 1, "Defaults that protect users."],
    ["estimate", "Case", "Estimate notifications", 10, "Estimation honesty.", "SWE planning interview.", "How would you estimate building a notifications center in a whiteboard interview setting?", "Clarify scope and non-goals.", "Break work into milestones.", "Call out risks and unknowns.", "Give a range, not fake precision.", "Name what you would spike first.", "Good estimates:", "A single exact date with no basis", "Scoped milestones, risks, and a range", "Ignoring unknowns", "Padding silently with no communication", 1, "Ranges beat theater."],
    ["why-company-swe", "Closing", "Why this eng team", 8, "Motivation close.", "Hiring manager.", "Why do you want to join this engineering team, and what would you own in your first 90 days?", "Product or tech hook.", "A concrete ownership area.", "How you ramp.", "Ask a sharp question about stack or users.", "Avoid generic culture words only.", "Strong closes cite:", "Only remote policy", "Product hook plus 90-day ownership", "No questions", "Guaranteeing zero bugs", 1, "Ownership over vibes."],
  ]),
  track("product-manager", [
    ["prioritize-ruthless", "Case", "One of three asks", 15, "Priority under constraint.", "PM interview.", "You have three must-have asks and capacity for one. How do you decide what ships?", "Clarify outcome metrics.", "Impact versus effort with evidence.", "Strategic fit.", "Communicate nos with options.", "Define revisit triggers.", "Prioritization should:", "Build all three poorly", "Decide with outcomes, evidence, and clear nos", "Only follow the loudest executive", "Avoid telling stakeholders no", 1, "Strategy is what you say no to."],
    ["failed-launch", "Behavioral", "Missed launch goals", 12, "Learning from misses.", "PM behavioral.", "Tell me about a product launch that missed its goals. What did you do afterward?", "State the goal and the miss.", "Signals you missed earlier.", "Customer evidence after launch.", "What you changed next.", "How you communicated.", "Failure stories need:", "Blame only engineering", "Miss, evidence, change, communication", "Hiding the miss", "No learning", 1, "Own the outcome."],
    ["metric-north-star", "Case", "North-star metric", 12, "Metric design.", "PM analytics screen.", "How would you choose a north-star metric for a B2B collaboration product?", "Proxy for user value.", "Avoid vanity metrics.", "Leading versus lagging balance.", "Guardrail metrics.", "How teams act on it weekly.", "North-star choice should:", "Only pageviews", "Value proxy plus guardrails", "Ignore gaming risk", "Change weekly without reason", 1, "What you manage moves."],
    ["say-no-exec", "Behavioral", "Push back on an exec", 12, "Influence upward.", "PM behavioral.", "Tell me about a time you pushed back on an executive request. What happened?", "The ask and the risk.", "How you framed alternatives.", "Data or customer proof.", "Final decision.", "Relationship afterward.", "Upward pushback works when:", "Public confrontation only", "Alternatives plus evidence plus respect", "Silent compliance then failure", "Ignoring the ask", 1, "Options, not obstruction."],
    ["discovery", "Case", "Loud customer request", 15, "Discovery rigor.", "PM interview.", "How would you run discovery for a feature request that came from one loud customer?", "Interview beyond that account.", "Jobs to be done.", "Frequency and willingness to pay.", "Prototype test.", "Kill criteria if weak.", "Discovery should:", "Build immediately for the loud voice", "Validate breadth, severity, and willingness", "Skip users", "Only run a survey", 1, "One customer is a clue."],
    ["roadmap-communicate", "Communication", "Roadmap to sales", 10, "Narrative clarity.", "PM screen.", "How do you present a roadmap to sales without turning it into a commitment calendar?", "Themes and outcomes.", "Confidence levels.", "What is not planned.", "Feedback loop.", "Avoid date theater.", "Roadmaps for GTM should:", "Exact dates for everything", "Themes, confidence, and non-goals", "Secret different stories by audience", "No feedback channel", 1, "Intent over calendar."],
    ["experiment", "Case", "Onboarding experiment", 12, "Experimentation literacy.", "PM interview.", "How would you design an experiment to test whether a new onboarding checklist increases activation?", "Write a hypothesis.", "Pick a primary metric.", "Sample size and duration.", "Guardrail metrics.", "Decision rule before peeking.", "Experiments need:", "Ship to everyone immediately", "Hypothesis, metric, power or time, decision rule", "No guardrails", "Moving goalposts mid-test", 1, "Decide before you peek."],
    ["tech-constraint", "Behavioral", "Engineering constraint", 10, "PM-engineering partnership.", "PM behavioral.", "Tell me about a time engineering constraints forced you to change the product plan. What did you do?", "Constraint you faced.", "User impact of each option.", "What you cut or sequenced.", "How you aligned the team.", "Result for users.", "Good answers show:", "Ignoring constraints", "Tradeoffs that protected user value", "Blaming engineering", "Secret scope cuts", 1, "Constraints shape product."],
    ["pricing-input", "Case", "Pricing change inputs", 12, "Commercial product sense.", "PM interview.", "What inputs would you gather before recommending a pricing change?", "Willingness-to-pay signals.", "Competitive alternatives.", "Cost to serve.", "Packaging clarity.", "Rollout and grandfathering risk.", "Pricing work includes:", "Gut feel only", "Willingness to pay, competition, cost, packaging, rollout", "Copying a competitor blindly", "Ignoring existing customers", 1, "Price is a product."],
    ["why-pm-here", "Closing", "Why PM here", 8, "Motivation.", "Hiring manager.", "Why product management at this company, and what problem would you tackle first?", "User or problem hook.", "How you discover in 90 days.", "How you partner with eng and design.", "Ask how success is measured.", "Avoid loving strategy decks alone.", "Strong closes:", "Only title ambition", "Problem hook plus discovery plan", "No measurement question", "Guaranteeing a viral feature", 1, "Problems over titles."],
  ]),
];

// Continue in same file via push for remaining tracks — imported from generated remainder
import { MORE_TRACKS } from "./extras/more-tracks.mjs";
TRACKS.push(...MORE_TRACKS);

for (const [slug, scenarios] of TRACKS) {
  if (scenarios.length !== 10) throw new Error(slug);
}

const body = TRACKS.map(([slug, scenarios]) => {
  return `  '${slug}': [
${scenarios.map(renderSc).join(",\n")},
  ]`;
}).join(",\n");

const out = `import { q, d, type InterviewScenario } from "./track-model";

/** Extra interview scenarios so each job track reaches 20 questions. */
export const EXTRA_BY_TRACK: Record<string, InterviewScenario[]> = {
${body},
};
`;

writeFileSync(new URL("../src/lib/track-extras.ts", import.meta.url), out);
console.log("wrote extras for", TRACKS.length, "tracks,", TRACKS.length * 10, "scenarios");
