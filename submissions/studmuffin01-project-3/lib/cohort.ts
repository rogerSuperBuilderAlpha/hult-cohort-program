export const COHORT = {
  name: "Hult Cohort Program",
  term: "Summer Pilot 2026",
  campuses: ["Boston", "London", "San Francisco", "Dubai"],
  showcaseEvent: {
    title: "End-of-pilot hiring showcase",
    when: "Week 6 · August 2026",
    where: "Hybrid — campus hubs + livestream",
  },
  feeSummary:
    "Referral fee: ~25% of first-year base salary on successful hire, with a 90-day clawback. Candidates receive a 10% kickback of the fee so incentives stay aligned.",
};

/** Partner-facing narrative — must stay ≥ 200 words on the public homepage. */
export const COHORT_NARRATIVE = `
The Hult Cohort Program Summer Pilot is a six-week, production-first sequence for builders who want to be hired on evidence — not polished PDFs. Participants ship real platforms the cohort depends on: a project-management system, an internal communications workspace, and this public showcase. Every submission is a merged pull request with a live HTTPS deploy. Peers file written GitHub reviews, then cast private votes. Winners operate infrastructure for the rest of the pilot; everyone else contributes pull requests to the winning stacks.

Hiring partners are the primary audience for Lighthouse. The story we ask you to believe is simple: do not trust our word — inspect their GitHub. Each public profile links repositories, deploy URLs, and a read-only snapshot of cohort project status from the PM platform so you can see what is on track, at risk, or already shipped. Profiles cover every enrolled participant; anyone who opts out of a public page still appears as a private placeholder so the roster remains complete and honest.

The program is deliberately compressed. One week to build, one review window to evaluate, then operators inherit systems with real users and real deadlines. That pressure is the product: graduates practice shipping under review, writing usable documentation, and collaborating when three platforms must later unify. Phase 2 extends the trail with an external learning app, a venture build, and at least one merged open-source contribution.

If you are evaluating whether to hire from this cohort, start with the developers directory, open a few deploy URLs, and request an intro when someone matches your hiring bar. Lighthouse exists so that ten minutes on a phone between meetings is enough to schedule interviews — because the work is already public, reviewed, and running.
`.trim().replace(/\s+/g, " ");
