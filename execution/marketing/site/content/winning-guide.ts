export const winningGuide = {
  eyebrow: 'Maintainer guide · learned in production',
  title: 'What it means to win a cohort repo',
  lead:
    'Winning is great, but it also turns your project into shared infrastructure. The moment your app becomes the cohort default, you are no longer just shipping features — you are maintaining a live platform while other people, and often their coding agents, start contributing to it too.',
  byline:
    'Based on lessons from Calvin Trinh’s Project 1 winning repo, Forth, for the Curious Boston × Hult International School AI Engineering cohort.',
  warning:
    'Heads up: even with a CONTRIBUTING guide, a ticket backlog, and a clear claim process, some contributors still skipped instructions, opened overlapping pull requests, or submitted work without passing checks. Future winners should plan for that coordination burden up front.',
  principles: [
    {
      title: 'Treat the winning repo like a real product, not a class artifact',
      body:
        'Keep one clear roadmap, protect production settings, and make sure maintainers decide what gets merged. A winner repo stops being “just your project” very quickly.',
    },
    {
      title: 'Force scope clarity before people start coding',
      body:
        'If contributors do not claim a ticket and wait for confirmation, you will spend your time merging duplicate work or unwinding conflicting assumptions instead of improving the product.',
    },
    {
      title: 'Make quality gates visible and non-negotiable',
      body:
        'State in writing that CI, testing, screenshots, and accessibility checks are part of the contribution itself. That saves the maintainer from debating basics in every PR.',
    },
    {
      title: 'Assume AI agents need operating instructions too',
      body:
        'If humans may skip repo instructions, their agents definitely will unless you put the workflow in AGENTS.md, CONTRIBUTING.md, and a public handoff doc the agent can read before editing.',
    },
  ],
  snippets: [
    'Read README.md, AGENTS.md, docs/AGENT_HANDOFF.md, and docs/ticket-backlog.md before touching code.',
    'Open a ticket claim, link the backlog ticket, describe your proposed slice, and wait for explicit scope confirmation.',
    'Branch from the agreed base, keep the change focused, run the required checks, and open a draft PR early.',
    'Do not deploy, alter production services, rotate credentials, or migrate real data.',
  ],
  takeaways: [
    {
      label: 'Plain-language takeaway',
      body:
        'Winning means you need a traffic system, not just a codebase. You need people to know where to enter, what lane they own, and what rules keep everyone from crashing into each other.',
    },
    {
      label: 'Engineering term',
      body:
        'This is a contributor-governance and change-management problem. Strong repos need documented intake, protected areas, scoped branches, CI gates, and explicit maintainer authority.',
    },
  ],
  recommendations: [
    'Publish a visible “what winning means” page so future winners know the hidden maintenance cost before they volunteer.',
    'Score contribution quality partly on whether contributors followed the repo workflow, even if the final code is not merged.',
    'Encourage cohorts to claim scope first and reward good coordination, not just raw PR count.',
    'Treat maintainers as product owners with the right to decline overlapping or low-signal work quickly.',
  ],
};
