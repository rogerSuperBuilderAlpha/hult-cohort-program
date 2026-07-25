@echo off
setlocal enabledelayedexpansion

REM Commit and push README update only.

set "FORK_URL=https://github.com/Studmuffin01/hult-cohort-program.git"
set "BRANCH=participants/summer26/phase-1-project-1/studmuffin01"
set "README=submissions/studmuffin01-project-1/README.md"
set "COMMIT_MSG=INITIARA: update README for Phase B and Supabase persistence"

cd /d "%~dp0..\..\.."
echo Repo root: %CD%

if not exist ".git" (
  echo ERROR: Not a git repository at %CD%
  exit /b 1
)

git remote get-url fork >nul 2>&1
if errorlevel 1 (
  git remote add fork %FORK_URL%
) else (
  git remote set-url fork %FORK_URL%
)

git show-ref --verify --quiet refs/heads/%BRANCH%
if errorlevel 1 (
  git checkout -b %BRANCH%
) else (
  git checkout %BRANCH%
)

git add %README%
git status -sb

git diff --cached --quiet
if errorlevel 1 (
  git commit -m "%COMMIT_MSG%"
  echo Created commit.
) else (
  echo Nothing new to commit.
)

git push -u fork %BRANCH%
if errorlevel 1 (
  echo PUSH FAILED.
  exit /b 1
)

echo.
echo Done.
echo https://github.com/Studmuffin01/hult-cohort-program/tree/%BRANCH%

endlocal
