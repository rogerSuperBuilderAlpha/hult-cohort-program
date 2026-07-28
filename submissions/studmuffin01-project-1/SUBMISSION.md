# Submission PR — Project 1 (INITIARA)

Use this every time you open or update your **official cohort submission PR**. GitHub does not save fork compare settings permanently — bookmark this file or the compare URL below.

## PR targets (do not change for Project 1)

| Field | Value |
|-------|--------|
| **Base repository** | `rogerSuperBuilderAlpha/hult-cohort-program` |
| **Base branch** | `projects/summer26/phase-1-project-1` |
| **Head repository** | `Studmuffin01/hult-cohort-program` (your fork) |
| **Compare branch** | `participants/summer26/phase-1-project-1/studmuffin01` |

**Not** `main` on either side for this submission.

## One-click compare (bookmark this)

https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/compare/projects/summer26/phase-1-project-1...Studmuffin01:participants/summer26/phase-1-project-1/studmuffin01

## PR title

```
[Project 1] Submission — studmuffin01
```

## PR body

Copy from [PR_BODY.md](./PR_BODY.md). Use the **Vercel production domain** (stable), not a `-git-` branch preview URL.

```markdown
## Production URL

https://initiara-rawle.vercel.app
```

The URL must be the **next line** after the heading — no link label (e.g. "Live Application") in between.

## Git remotes (local)

| Remote | URL | Use |
|--------|-----|-----|
| `fork` | `https://github.com/Studmuffin01/hult-cohort-program.git` | **Push** your work |
| `origin` | `https://github.com/rogerSuperBuilderAlpha/hult-cohort-program.git` | Pull upstream updates only |

```cmd
git push fork participants/summer26/phase-1-project-1/studmuffin01
```

Never push submission code to `origin` unless staff instructs you to.

## Vercel (separate from PR base)

| Setting | Value |
|---------|--------|
| Git repo | `Studmuffin01/hult-cohort-program` |
| Production branch | `participants/summer26/phase-1-project-1/studmuffin01` |
| Root directory | `submissions/studmuffin01-project-1` |
| **Production URL** | `https://initiara-rawle.vercel.app` (not `-git-` branch previews) |

## Project 2 and later

Each project gets its own branch pair. Example for Project 2:

- Base: `projects/summer26/phase-1-project-2`
- Compare: `participants/summer26/phase-1-project-2/studmuffin01`
- App path: `submissions/studmuffin01-project-2/`

Do not reuse Project 1 branches for Project 2 PRs.

## Workflow after each change

1. `scripts\push-to-fork.bat` — push to fork
2. Open the bookmark compare URL above (or edit the existing PR)
3. Confirm base/head match the table before clicking **Create pull request**
