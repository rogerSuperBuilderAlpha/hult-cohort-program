/** Public hackathon track — Trustabl rule authoring (Aug 24, 2026 in-person swarm). */

export const hackathonTrustabl = {
  eyebrow: 'Open hackathon track · Aug 24, 2026',
  title: 'Trustabl contribution guide',
  lead:
    'Trustabl is an agent-security scanner. The highest-leverage contribution path is new detection rules — YAML definitions, threat-model docs, and test fixtures across three repos. This page is open to everyone at today\'s in-person hackathon and anyone contributing remotely.',
  event: {
    label: 'In-person OSS swarm',
    when: 'Monday, August 24 · afternoon',
    where: 'Hult International Business School, 1 Education St, Cambridge, MA',
    lumaUrl: 'https://luma.com/s5wuujzl',
    lumaNote: 'Register on Luma before you arrive — approval is required for campus access.',
  },
  repos: [
    {
      name: 'trustabl/trustabl',
      label: 'Core scanner (Go)',
      url: 'https://github.com/trustabl/trustabl',
    },
    {
      name: 'trustabl/trustabl-rules',
      label: 'Detection rule packs (YAML)',
      url: 'https://github.com/trustabl/trustabl-rules',
    },
    {
      name: 'trustabl/trustabl-rulebook',
      label: 'Threat model / rationale docs',
      url: 'https://github.com/trustabl/trustabl-rulebook',
    },
  ],
  primaryPath: {
    title: 'Primary contribution path: new rules',
    summary:
      'Most accessible and highest impact. A single rule lives across three repos.',
    steps: [
      'YAML definition in trustabl-rules under the correct SDK directory (claude_sdk/, openai_sdk/, google_adk/, mcp/, langchain/, etc.)',
      'Rationale / threat-model doc in trustabl-rulebook (use the template in docs/policy-rationale-doc-template-guide.md)',
      'Fire + silent test cases in the engine\'s testdata/rules-fixture/',
    ],
    conventions:
      'Key conventions are documented in trustabl-rules/CLAUDE.md — required fields, ID scheme, severity/confidence guidance, applies_to scopes. After writing the YAML, run trustabl rules validate and the engine\'s Go tests.',
    conventionsUrl: 'https://github.com/trustabl/trustabl-rules/blob/main/CLAUDE.md',
    templateUrl:
      'https://github.com/trustabl/trustabl-rulebook/blob/main/docs/policy-rationale-doc-template-guide.md',
  },
  otherAreas: [
    'Engine improvements (Go; CGO required for tree-sitter)',
    'GitHub Action (trustabl-action)',
    'Cursor / VS Code extensions',
    'Documentation and example agent repos',
  ],
  targetAreas: [
    'Deeper coverage for LangChain/LangGraph, CrewAI, AutoGen/AG2, Pydantic AI, and Vercel AI SDK (Claude, OpenAI, Google ADK, and MCP currently have the strongest rule sets)',
    'Completing the missing rationale docs for the 14 shipped MCP rules',
    'New rules around error handling, idempotency, observability/tracing, approvals, and shell/network safety',
    'Expanding language support beyond the current Python + TypeScript focus',
    'Real-world agent templates that surface new failure modes',
  ],
  howToStart: [
    { label: 'Join the Discord', url: 'https://discord.gg/G6gM8nKxPg' },
    { label: 'Fork the relevant repo(s)', url: null },
    { label: 'Open a PR (small, focused PRs preferred)', url: null },
    { label: 'For rules, follow the three-repo process above', url: null },
  ],
  discordUrl: 'https://discord.gg/G6gM8nKxPg',
  /** Show site-wide banner through end of hackathon week (ET). */
  bannerVisibleUntil: '2026-08-25T23:59:59-04:00',
} as const;
