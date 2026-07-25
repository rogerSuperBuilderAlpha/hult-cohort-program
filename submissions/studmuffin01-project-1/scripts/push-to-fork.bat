@echo off
setlocal enabledelayedexpansion

REM Push INITIARA submission to your GitHub fork.
REM Run from CMD:
REM   cd submissions\studmuffin01-project-1
REM   scripts\push-to-fork.bat

set "FORK_URL=https://github.com/Studmuffin01/hult-cohort-program.git"
set "BRANCH=participants/summer26/phase-1-project-1/studmuffin01"
set "SUBMISSION=submissions/studmuffin01-project-1"

REM Repo root = three levels up from scripts\
cd /d "%~dp0..\..\.."
echo Repo root: %CD%

if not exist ".git" (
  echo ERROR: Not a git repository at %CD%
  exit /b 1
)

echo.
echo --- Remotes ---
git remote -v

git remote get-url fork >nul 2>&1
if errorlevel 1 (
  echo Adding remote fork -^> %FORK_URL%
  git remote add fork %FORK_URL%
) else (
  git remote set-url fork %FORK_URL%
)

echo.
echo --- Branch ---
git show-ref --verify --quiet refs/heads/%BRANCH%
if errorlevel 1 (
  git checkout -b %BRANCH%
) else (
  git checkout %BRANCH%
)

echo.
echo --- Stage submission (.env.local is gitignored) ---
git add %SUBMISSION%

echo.
echo --- Status ---
git status -sb

git diff --cached --quiet
if errorlevel 1 (
  git commit -m "INITIARA: Supabase auth, server persistence, and Phase A docs"
  echo Created commit.
) else (
  echo Nothing new to commit.
)

echo.
echo --- Push to fork ---
echo Branch: %BRANCH%
echo Remote: fork
git push -u fork %BRANCH%

if errorlevel 1 (
  echo.
  echo PUSH FAILED. Check GitHub login and that the fork exists:
  echo   https://github.com/Studmuffin01/hult-cohort-program
  exit /b 1
)

echo.
echo Done.
echo Next steps:
echo   1. Verify on GitHub: Studmuffin01/hult-cohort-program branch %BRANCH%
echo   2. Vercel: import that repo, branch %BRANCH%, root %SUBMISSION%
echo   3. When ready: open a PR from your fork to the cohort upstream repo

endlocal
