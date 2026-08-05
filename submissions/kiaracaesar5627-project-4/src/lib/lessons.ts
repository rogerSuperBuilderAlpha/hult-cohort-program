export type Debrief = {
  prompt: string;
  choices: string[];
  answerIndex: number;
  explain: string;
};

export type InterviewScenario = {
  slug: string;
  stage: string;
  title: string;
  minutes: number;
  summary: string;
  /** Job-application context for this question */
  scenario: string;
  interviewer: string;
  playbook: string[];
  debrief: Debrief;
};

export type JobTrack = {
  slug: string;
  role: string;
  setting: string;
  blurb: string;
  scenarios: InterviewScenario[];
};

export const JOB_TRACKS: JobTrack[] = [
  {
    slug: "software-engineer",
    role: "Software Engineer",
    setting: "Series B product company",
    blurb: "Screens that mix ownership stories, live coding, and design judgment.",
    scenarios: [
      {
        slug: "missed-deadline",
        stage: "Behavioral",
        title: "You missed a ship date",
        minutes: 12,
        summary: "Accountability under delivery pressure — common mid-level SWE screen.",
        scenario:
          "You applied for a backend role. The team ships weekly. Interviewer probes how you handle failure without blaming process or people.",
        interviewer:
          "Tell me about a time a feature you owned missed its release date. What did you do in the 48 hours after you knew you’d miss it?",
        playbook: [
          "Name the Situation: feature, stakeholder, original date.",
          "Own the miss early — no “QA was slow” as the headline.",
          "Action: how you re-scoped, communicated, and protected users.",
          "Result: what shipped, what slipped, and the process change you left behind.",
          "Close with one signal you’d watch earlier next time.",
        ],
        debrief: {
          prompt: "In this scenario, interviewers most want to hear:",
          choices: [
            "That the miss was someone else’s fault",
            "Early ownership plus a concrete recovery plan",
            "That deadlines don’t matter in agile",
            "A long list of tools you used",
          ],
          answerIndex: 1,
          explain: "Ownership + recovery beats a perfect delivery history you can’t prove.",
        },
      },
      {
        slug: "rate-limiter",
        stage: "Coding",
        title: "Design a rate limiter",
        minutes: 25,
        summary: "Coding screen framed as a production reliability problem.",
        scenario:
          "Onsite coding round for an API-heavy SWE role. They care about correctness, edge cases, and how you talk while you type.",
        interviewer:
          "Implement a simple in-memory rate limiter: allow N requests per user per window. Walk me through your approach before coding. What breaks at scale?",
        playbook: [
          "Clarify: fixed window vs sliding, per-user vs per-IP, return shape on reject.",
          "Sketch brute force, then a map of user → timestamps or token bucket.",
          "Code the happy path, then discuss concurrency and memory growth.",
          "Name one production upgrade (Redis, distributed clocks) without overbuilding.",
          "Test: burst at window edge, unknown user, N=0.",
        ],
        debrief: {
          prompt: "Before writing the rate limiter, you should first:",
          choices: [
            "Pick Redis immediately",
            "Clarify window semantics and reject behavior",
            "Refuse to code without a laptop",
            "Discuss salary bands",
          ],
          answerIndex: 1,
          explain: "Ambiguous windows create wrong solutions that look “done.”",
        },
      },
      {
        slug: "notifications-design",
        stage: "System design",
        title: "Design notifications",
        minutes: 30,
        summary: "System design for a multi-channel notification service.",
        scenario:
          "Staff/senior SWE loop. You’re applying to own infra for product messaging (email, push, in-app).",
        interviewer:
          "Design a notification system that can send email, push, and in-app messages for 5M MAU. Start from requirements.",
        playbook: [
          "Separate functional needs (templates, preferences, delivery) from SLOs (latency, at-least-once).",
          "Draw producer → queue → workers → providers; isolate provider failures.",
          "Call out idempotency keys and preference checks before send.",
          "Discuss fan-out, retries, and dead-letter queues.",
          "End with metrics: send success, bounce, time-to-inbox.",
        ],
        debrief: {
          prompt: "A solid notifications design almost always includes:",
          choices: [
            "A single synchronous HTTP call to every provider",
            "A queue plus retry/dead-letter strategy",
            "Storing passwords in the notification payload",
            "Skipping user preferences",
          ],
          answerIndex: 1,
          explain: "Providers fail; queues and retries keep the product reliable.",
        },
      },
    ],
  },
  {
    slug: "product-manager",
    role: "Product Manager",
    setting: "B2B SaaS growth stage",
    blurb: "Prioritization, stakeholder conflict, and product sense under constraints.",
    scenarios: [
      {
        slug: "priority-conflict",
        stage: "Behavioral",
        title: "Sales vs engineering",
        minutes: 12,
        summary: "Cross-functional conflict when a deal needs a one-off feature.",
        scenario:
          "PM interview for a B2B product. Revenue wants a custom ask; engineering says it forks the roadmap.",
        interviewer:
          "Sales says a $200k deal needs a feature that isn’t on the roadmap. Engineering says it will cost six weeks. Walk me through how you’d decide.",
        playbook: [
          "Separate the customer problem from the requested solution.",
          "Estimate true cost: build, maintain, opportunity cost on the roadmap.",
          "Explore reversible options: config, services engagement, timeline trade.",
          "Decide with criteria (ICP fit, retention, strategy) — not the loudest voice.",
          "Communicate the decision to Sales and Eng with the same story.",
        ],
        debrief: {
          prompt: "The strongest PM move in this conflict is to:",
          choices: [
            "Always say yes to revenue",
            "Always say no to protect the roadmap",
            "Reframe to the underlying problem and decide with clear criteria",
            "Let engineering vote privately",
          ],
          answerIndex: 2,
          explain: "PMs earn trust by deciding transparently, not by defaulting to either side.",
        },
      },
      {
        slug: "metric-move",
        stage: "Product sense",
        title: "Activation is flat",
        minutes: 20,
        summary: "Diagnose a funnel problem and propose a next experiment.",
        scenario:
          "Product sense round. You’re interviewing for a growth-adjacent PM seat on a free-to-paid product.",
        interviewer:
          "Sign-ups are up 20%, but activation (first value moment within 7 days) is flat. What do you look at, and what would you try next?",
        playbook: [
          "Define activation precisely and segment (channel, persona, device).",
          "Map the path from signup → value; find the biggest drop-off.",
          "Generate 2–3 hypotheses tied to evidence, not vibes.",
          "Propose one experiment with success metric and kill criteria.",
          "Name what you would not change yet (and why).",
        ],
        debrief: {
          prompt: "When activation is flat while sign-ups rise, you should first:",
          choices: [
            "Buy more ads",
            "Segment and find where the funnel breaks",
            "Redesign the entire brand",
            "Cut the free plan immediately",
          ],
          answerIndex: 1,
          explain: "Diagnosis before solutions — otherwise you optimize the wrong step.",
        },
      },
      {
        slug: "roadmap-tradeoff",
        stage: "Execution",
        title: "Cut the roadmap",
        minutes: 15,
        summary: "Forced prioritization when capacity drops mid-quarter.",
        scenario:
          "Final PM round with a hiring manager. Two engineers left; Q3 commitments are public.",
        interviewer:
          "You lose two engineers for the quarter. Your roadmap has six committed items. How do you cut, and how do you tell leadership?",
        playbook: [
          "Re-score by impact × confidence ÷ effort with current capacity.",
          "Protect must-haves (risk, revenue, legal) before nice-to-haves.",
          "Offer a revised plan with dates, not a vague “we’ll try.”",
          "Write the leadership message: what slips, what stays, what you need.",
          "Set a weekly check so the cut doesn’t silently creep back.",
        ],
        debrief: {
          prompt: "When capacity drops, a credible PM update includes:",
          choices: [
            "Hope that people work weekends",
            "A re-prioritized plan with explicit cuts and dates",
            "Silence until the quarter ends",
            "Only a complaint about hiring",
          ],
          answerIndex: 1,
          explain: "Leaders can absorb bad news; they cannot absorb ambiguity.",
        },
      },
    ],
  },
  {
    slug: "data-analyst",
    role: "Data Analyst",
    setting: "Marketplace / ops-heavy company",
    blurb: "SQL thinking, experiment literacy, and stakeholder storytelling.",
    scenarios: [
      {
        slug: "metric-disagreement",
        stage: "Behavioral",
        title: "Two dashboards disagree",
        minutes: 12,
        summary: "You reconcile conflicting numbers under executive attention.",
        scenario:
          "Analyst interview. Finance and Growth report different “active users.” You’re in the room.",
        interviewer:
          "Finance and Growth show different active-user counts for the same week. Leadership wants an answer by tomorrow. What do you do?",
        playbook: [
          "Write both definitions side by side (event, window, filters).",
          "Reproduce each number from raw tables before debating.",
          "Find the delta drivers (timezone, bots, deleted users, test accounts).",
          "Propose a single source-of-truth definition and migration plan.",
          "Deliver a short brief: what differs, what’s trusted, what’s next.",
        ],
        debrief: {
          prompt: "When two metrics disagree, start by:",
          choices: [
            "Picking the higher number for optimism",
            "Comparing definitions and reproducing both",
            "Deleting one dashboard",
            "Waiting for leadership to choose",
          ],
          answerIndex: 1,
          explain: "Most “data fights” are definition fights.",
        },
      },
      {
        slug: "sql-funnel",
        stage: "Technical",
        title: "Funnel query under pressure",
        minutes: 20,
        summary: "Live SQL / analytics reasoning for a conversion funnel.",
        scenario:
          "Technical screen for a data analyst role supporting growth. They want structure more than perfect syntax.",
        interviewer:
          "We have events: `signup`, `activate`, `purchase`. How would you compute weekly conversion signup→activate→purchase, and what would make the numbers lie?",
        playbook: [
          "Define the grain (user vs session) and attribution window.",
          "Outline joins/filters; watch for duplicate events.",
          "Call out censoring (users who haven’t finished the window).",
          "Name quality checks: null user_ids, bot filters, clock skew.",
          "Explain how you’d present uncertainty to a non-technical partner.",
        ],
        debrief: {
          prompt: "A funnel conversion can look too high when you:",
          choices: [
            "Include users still inside the attribution window as non-converters only",
            "Ignore duplicates and count events as users",
            "Document definitions",
            "Filter test accounts",
          ],
          answerIndex: 1,
          explain: "Duplicate events inflate steps unless you dedupe to users.",
        },
      },
      {
        slug: "experiment-readout",
        stage: "Product analytics",
        title: "The A/B test is messy",
        minutes: 18,
        summary: "Interpret an experiment with a novelty effect and a segment split.",
        scenario:
          "You’re interviewing for an analytics partner role on a product team that ships weekly experiments.",
        interviewer:
          "An A/B test shows +4% lift overall, but one large segment is −6%. Novelty wears off after week one. How do you recommend shipping?",
        playbook: [
          "Check power, peeking, and SRM before storytelling.",
          "Separate overall lift from segment harm — guardrail metrics matter.",
          "Ask whether the negative segment is strategic (ICP) or noise.",
          "Recommend ship / iterate / kill with conditions, not vibes.",
          "Propose a follow-up test that targets the harmed segment.",
        ],
        debrief: {
          prompt: "Overall lift with a harmed core segment usually means:",
          choices: [
            "Ship immediately for the average",
            "Investigate segment impact before a blanket ship",
            "Ignore novelty entirely",
            "Throw out experimentation",
          ],
          answerIndex: 1,
          explain: "Averages hide who pays the cost of the “win.”",
        },
      },
    ],
  },
  {
    slug: "marketing",
    role: "Marketing Manager",
    setting: "Consumer brand / performance mix",
    blurb: "Campaign judgment, channel tradeoffs, and crisis communication.",
    scenarios: [
      {
        slug: "budget-cut",
        stage: "Behavioral",
        title: "Budget cut mid-campaign",
        minutes: 12,
        summary: "Reallocate spend when leadership halves paid budget overnight.",
        scenario:
          "Marketing manager interview. You’re owning a product launch campaign across paid + life/owned.",
        interviewer:
          "Two weeks into a launch, leadership cuts your paid budget by 50%. What do you keep, what do you cut, and how do you tell the team?",
        playbook: [
          "Anchor on the launch goal (awareness vs conversion) before channels.",
          "Protect highest-ROI and irreplaceable moments (launch day creative).",
          "Shift to organic, partners, and lifecycle where paid was inefficient.",
          "Reset targets so “success” isn’t the old plan with half the fuel.",
          "Communicate clearly: what changes, what doesn’t, who owns what.",
        ],
        debrief: {
          prompt: "After a sudden budget cut, the first strategic question is:",
          choices: [
            "Which vanity metric looks nicest",
            "What outcome still matters with less spend",
            "How to hide the cut from the team",
            "Whether to quit",
          ],
          answerIndex: 1,
          explain: "Strategy follows the constrained goal, then channels.",
        },
      },
      {
        slug: "channel-choice",
        stage: "Case",
        title: "Pick the channel mix",
        minutes: 20,
        summary: "Case-style: allocate $50k to acquire 2,000 trial users.",
        scenario:
          "Case interview for a growth marketing role at a mobile app with a 14-day trial.",
        interviewer:
          "You have $50k and 6 weeks to acquire 2,000 trial users. How do you allocate across channels, and what do you measure weekly?",
        playbook: [
          "State assumptions: CAC target, conversion trial→paid, creative lead time.",
          "Split budget: proven channels vs learning budget (70/30 or similar).",
          "Define leading indicators (CTR, CPI, activate rate) not just spend.",
          "Plan a kill/scale rule by week 2 and week 4.",
          "Call out brand risk and creative fatigue.",
        ],
        debrief: {
          prompt: "A credible channel plan always includes:",
          choices: [
            "Only the channel you personally like",
            "Assumptions, allocation, and kill/scale rules",
            "A promise of zero waste",
            "Skipping measurement",
          ],
          answerIndex: 1,
          explain: "Cases are about judgment under uncertainty, not perfect forecasts.",
        },
      },
      {
        slug: "crisis-post",
        stage: "Communication",
        title: "The campaign goes wrong",
        minutes: 10,
        summary: "Public backlash on a campaign creative — respond without vanishing.",
        scenario:
          "Final round. You’re the marketing lead candidate; they simulate a brand crisis.",
        interviewer:
          "A campaign asset is called out on social for being tone-deaf. It’s trending. What do you do in the first two hours?",
        playbook: [
          "Pause the asset; don’t argue in replies yet.",
          "Align facts with legal/brand/leadership in one channel.",
          "Draft a short acknowledgment if harm is clear — no sarcasm.",
          "Brief support/sales so they aren’t blindsided.",
          "Schedule a postmortem on process, not just the creative.",
        ],
        debrief: {
          prompt: "In the first hours of backlash, the priority is usually:",
          choices: [
            "Meming back at critics",
            "Stopping the asset and aligning an honest response",
            "Deleting the company account",
            "Waiting a week to see if it dies down",
          ],
          answerIndex: 1,
          explain: "Speed without alignment creates a second crisis.",
        },
      },
    ],
  },
  {
    slug: "customer-success",
    role: "Customer Success Manager",
    setting: "B2B subscription / renewals",
    blurb: "Retention, escalation, and executive conversations when accounts wobble.",
    scenarios: [
      {
        slug: "churn-risk",
        stage: "Behavioral",
        title: "Renewal at risk",
        minutes: 12,
        summary: "A champion leaves; usage drops; renewal is in 45 days.",
        scenario:
          "CSM interview for an enterprise book of business. They want calm escalation, not panic.",
        interviewer:
          "Your champion quits. Product usage drops 40% in two weeks. Renewal is in 45 days. What’s your plan?",
        playbook: [
          "Map the new power structure: economic buyer, users, blockers.",
          "Diagnose usage drop with data + 2 customer conversations.",
          "Build a save plan: value proof, enablement, exec sponsor if needed.",
          "Align internally (product/support) on one narrative.",
          "Set renewal checkpoints at day 30 / 15 / 7.",
        ],
        debrief: {
          prompt: "When a champion leaves, the CSM priority is to:",
          choices: [
            "Wait for them to introduce a replacement",
            "Rebuild relationships and quantify value for the new decision-makers",
            "Discount immediately",
            "Close the account",
          ],
          answerIndex: 1,
          explain: "Renewals follow relationships and proven value, not hope.",
        },
      },
      {
        slug: "escalation-call",
        stage: "Role play",
        title: "Angry executive call",
        minutes: 15,
        summary: "Live role-play: customer exec is furious about an outage.",
        scenario:
          "Role-play round. You’re interviewing for a CSM who owns escalations with AEs.",
        interviewer:
          "I’m the customer’s VP. Your product was down during our board demo. Convince me we shouldn’t churn. You have five minutes.",
        playbook: [
          "Acknowledge impact without excuses in the first sentence.",
          "Share facts you know and what you’re still confirming.",
          "Offer concrete remediation (credits only if policy-ready; better: prevention plan).",
          "Ask what recovery looks like for them — listen.",
          "Book a follow-up with owners and a written timeline.",
        ],
        debrief: {
          prompt: "On an angry exec call, you should open with:",
          choices: [
            "A long technical root-cause deep dive",
            "Clear ownership of impact and a path to make it right",
            "Blame the vendor upstream",
            "Silence until legal joins",
          ],
          answerIndex: 1,
          explain: "Empathy + ownership unlocks the rest of the conversation.",
        },
      },
      {
        slug: "qbr-story",
        stage: "Business review",
        title: "QBR with weak ROI",
        minutes: 15,
        summary: "Quarterly business review when ROI story is thin.",
        scenario:
          "CS interview for a mid-market segment. QBRs are how you defend renewals.",
        interviewer:
          "You’re running a QBR. The customer says they can’t see ROI. How do you structure the meeting?",
        playbook: [
          "Start from their goals, not your feature list.",
          "Bring 2–3 usage insights tied to outcomes they care about.",
          "Admit gaps; propose a 30-day value plan with owners.",
          "Ask what “ROI proven” means in their language.",
          "Leave with dated next steps, not slideware.",
        ],
        debrief: {
          prompt: "A QBR that lacks ROI should emphasize:",
          choices: [
            "More feature screenshots",
            "Customer goals, honest gaps, and a dated value plan",
            "Only NPS scores",
            "Competitor bashing",
          ],
          answerIndex: 1,
          explain: "QBRs are mutual planning sessions, not product tours.",
        },
      },
    ],
  },
];

export type InterviewRound = InterviewScenario & {
  trackSlug: string;
  role: string;
  setting: string;
};

/** Flat list for static params and lookup */
export const ROUNDS: InterviewRound[] = JOB_TRACKS.flatMap((track) =>
  track.scenarios.map((s) => ({
    ...s,
    trackSlug: track.slug,
    role: track.role,
    setting: track.setting,
  })),
);

export function getTrack(slug: string): JobTrack | undefined {
  return JOB_TRACKS.find((t) => t.slug === slug);
}

export function getRound(trackSlug: string, scenarioSlug: string): InterviewRound | undefined {
  return ROUNDS.find((r) => r.trackSlug === trackSlug && r.slug === scenarioSlug);
}

export function roundPath(round: InterviewRound): string {
  return `/practice/${round.trackSlug}/${round.slug}`;
}

/** Back-compat */
export const LESSONS = ROUNDS;
export function getLesson(slug: string) {
  return ROUNDS.find((r) => r.slug === slug);
}
