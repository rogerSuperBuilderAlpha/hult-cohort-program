/**
 * Vibe marketing copy for Project 3 showcase surfaces.
 * Update positioning notes in the submission PR when this changes.
 */

export const showcasePositioning = {
  tagline: "Don't trust our word — inspect their GitHub.",
  oneLiner:
    'Summer Pilot 2026 builders ship production software in public. Every review, deployment, and merged PR is evidence you can verify before you hire.',
  tone: 'Energetic, credible, partner-ready — Hult cream and magenta with proof over hype.',
};

export const showcaseNarrative = `
The Hult Cohort Developer Program Summer Pilot 2026 is not a classroom simulation. For six weeks,
participants compete to build the platforms their cohort actually runs on — project management,
internal communications, and vibe marketing — then extend outward with learning integrations,
venture packages, and open-source contributions.

This showcase is the public face of that work. Each profile links to real GitHub history: merged
submission pull requests, deployed HTTPS applications, written peer reviews, and optional upvotes
recorded on GitHub during review week. Hiring partners do not need to take our word for skill;
they can inspect the same artifacts reviewers use to pass or fail each project.

We built this surface on the cohort's existing Next.js + Firebase platform so project status,
roster enrollment, and submission metadata stay connected to the PM system — not a disconnected
brochure. When a student merges a submission, their deploy URL and PR link appear here. When they
opt out of public marketing, their page shows a respectful private placeholder.

Partners browse the roster, filter by project evidence, read how hiring works, and request an
introduction to specific students. The fee model is transparent: pay on successful hire, aligned
with graduate success. The vibe is warm Hult brand energy — cream, magenta, serif headlines —
but the standard is engineering proof.

If you are evaluating whether to hire from this cohort, start with three profiles below, then open
the status page for live project snapshots. If you are a participant, this is the marketing
surface your week-3 build is meant to energize.
`.trim();

export const showcaseNavLinks = [
  { href: '/showcase', label: 'Showcase' },
  { href: '/students', label: 'Builders' },
  { href: '/status', label: 'Project status' },
  { href: '/partners', label: 'Partners' },
  { href: '/program', label: 'Program' },
] as const;
