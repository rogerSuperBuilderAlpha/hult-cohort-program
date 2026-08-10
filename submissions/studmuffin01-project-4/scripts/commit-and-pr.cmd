@echo off
setlocal EnableExtensions
cd /d "%~dp0..\..\.."

echo.
echo === Repo root ===
cd
git rev-parse --show-toplevel
if errorlevel 1 (
  echo Not a git repo. Aborting.
  exit /b 1
)

echo.
echo === Branch ===
git checkout participants/summer26/phase-2-learning-app/studmuffin01 2>nul
if errorlevel 1 (
  git checkout -b participants/summer26/phase-2-learning-app/studmuffin01
)

git status -sb
echo.
echo Staging Project 4 files (secrets excluded by .gitignore)...
git add submissions/studmuffin01-project-4
git status --porcelain

echo.
echo NOTE: .env.local must NOT appear above. If it does, Ctrl+C and fix.
pause

git commit -m "[P2-L1] Add SCORE Method learning app with Ludwitt wiring" -m "Ship the ~60 min Prompt Like a Pro course, local Ludwitt launch/events integration, and hero asset for the Week 4 learning-engineer submission."
if errorlevel 1 (
  echo Commit failed or nothing to commit.
  exit /b 1
)

echo.
echo Pushing branch...
git push -u origin HEAD
if errorlevel 1 (
  echo Push failed. Install git credentials / gh auth, then retry.
  exit /b 1
)

echo.
echo Creating PR (requires GitHub CLI: winget install GitHub.cli ^&^& gh auth login)...
where gh >nul 2>&1
if errorlevel 1 (
  echo gh not found. Open this compare URL after push:
  echo https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/compare/projects/summer26/phase-2-learning-app...participants/summer26/phase-2-learning-app/studmuffin01?expand=1
  echo Title: [P2-L1] Submission — studmuffin01
  exit /b 0
)

gh pr create --base projects/summer26/phase-2-learning-app --title "[P2-L1] Submission — studmuffin01" --body "## Summary\n\n- Learning app: **Prompt Like a Pro: The SCORE Method for Copilot** (~60 min) under `submissions/studmuffin01-project-4`\n- Ludwitt wiring verified locally: register → `/launch?token=` session source `ludwitt` → `lesson_started` `mode=live`\n- Hero asset + course UI ready for deploy\n\n## Ludwitt/Hult app ID\n\n_(paste app_id from .env.local — do not paste api_key or jwt_secret)_\n\n## Production listing URL\n\n_(add after Vercel deploy, e.g. https://YOUR_APP.vercel.app)_\n\n## Metrics API snapshot (date-stamped)\n\n_(fill as users accumulate; pass gate ≥25 qualified external users)_\n\n## Promotion channels used\n\n_(list after you start promoting)_\n\n## Test plan\n\n- [x] `npm run dev` — home, modules, quizzes\n- [x] `/integration` secrets OK + ping `lesson_started` live (local API)\n- [x] `mint-launch-token.mjs` → Module 01 via Ludwitt session\n- [ ] Production deploy over HTTPS\n- [ ] Production launch URL + env with `ALLOW_DEV_BYPASS=false`\n- [ ] Metrics climbing toward ≥25 qualified users\n"

echo.
git status -sb
echo Done.
endlocal
