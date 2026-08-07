# Contributing

Thank you for helping improve the Hult Cohort Program. This repository is open source under the [MIT License](LICENSE).

**AI agents:** start with [AGENTS.md](AGENTS.md) (repo map, architecture, task routing). Cursor loads [.cursor/rules/](.cursor/rules/) automatically.

**MCP (Cursor):** [execution/hult-cohort-mcp/](execution/hult-cohort-mcp/) — apply, peer reviews, and votes from your agent.

## What belongs here

| Area | Path | Good contributions |
|------|------|--------------------|
| Curriculum & rubrics | `curriculum/` | Clearer requirements, playbooks, review rubrics |
| Governance & assessment | `governance/`, `assessment/` | Voting rules, pass/fail criteria, metrics |
| Operations & partnerships | `operations/`, `partnerships/` | Runbooks, partner materials |
| Platform code | `execution/marketing/site/` | Next.js cohort site, APIs, UI |
| Ludwitt/Hult API | `execution/ludwitt-hult-api/` | OpenAPI spec, reference server |
| Admissions take-home | `execution/admissions-take-home/` | Starter task, tests, docs |
| Templates | `execution/templates/` | Cohort repo templates, legal drafts |

**Out of scope for public PRs:** live student data, Firebase credentials, Vercel env values, or cohort-specific roster contents. Never commit secrets (see [SECURITY.md](SECURITY.md)).

## Getting started

### Docs-only changes

Edit markdown directly and open a PR. No build step required.

### Cohort platform (Next.js)

```bash
cd execution/marketing/site
cp .env.example .env.local   # fill from your Firebase project (see execution/marketing/FIREBASE.md)
npm install
npm run dev
npm run build
```

### Ludwitt/Hult API

```bash
cd execution/ludwitt-hult-api
npm install
npm test
```

### Admissions take-home

```bash
cd execution/admissions-take-home
npm install
npm test
```

## Pull request process

1. **Fork** the repo (or branch in-repo if you are a maintainer).
2. **Branch** from `main`: `feat/short-description` or `fix/short-description`.
3. **Keep PRs focused** — one logical change per PR when possible.
4. **Run checks** before opening:
   - `npm run build` in `execution/marketing/site` for site changes
   - `npm test` in package directories you touched
5. **Describe** what changed and why in the PR body (use the template).
6. A maintainer will review. We aim to respond within a few business days.

## Style

- Match existing tone in curriculum docs: direct, operational, no fluff.
- TypeScript/React: follow patterns in `execution/marketing/site/components/`.
- Prefer small, reviewable diffs over large rewrites unless discussed first.

## Questions

Open a [GitHub Discussion](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/discussions) or an issue with the **question** label if you are unsure whether a change fits before investing a large PR.

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.
