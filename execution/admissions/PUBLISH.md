# Publish admissions take-home to GitHub

## Recommended setup

1. Create public repo: `admissions-task-board-fall26` (currently live at `rogerSuperBuilderAlpha/admissions-task-board-fall26`)
2. Push contents of [admissions-take-home/](admissions-take-home/) **excluding** `SOLUTIONS.md` and `node_modules/`
3. Enable template repo optional for future cohorts
4. Link in application auto-reply email

```bash
cd execution/admissions-take-home
./scripts/publish-public-repo.sh   # writes ../admissions-task-board-fall26-publish
cd ../admissions-task-board-fall26-publish
npm ci && npm run test:ci
git init
git add README.md package.json package-lock.json src tests .github .gitignore scripts
git commit -m "Admissions take-home Summer Pilot 2026"
git remote add origin git@github.com:rogerSuperBuilderAlpha/admissions-task-board-fall26.git
git push -u origin main
```

## Staff repo (private)

Keep `SOLUTIONS.md` + `GRADING.md` in private `hult-cohort/admissions-grading-fall26` or internal wiki.

## Applicant workflow

Fork is **not** required — applicants branch `admissions/{handle}` if repo is in org, or fork if public external repo.

Preferred: invite applicants as outside collaborators to open PR (heavier ops) OR accept public fork PRs.

**Simplest cohort 1:** public repo, applicants fork → PR to upstream.

## Link in form

`https://github.com/rogerSuperBuilderAlpha/admissions-task-board-fall26`
