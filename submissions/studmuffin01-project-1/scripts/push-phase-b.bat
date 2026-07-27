@echo off
setlocal enabledelayedexpansion

REM Push Phase B INITIARA changes to your GitHub fork (no PR).

set "FORK_URL=https://github.com/Studmuffin01/hult-cohort-program.git"
set "BRANCH=participants/summer26/phase-1-project-1/studmuffin01"
set "SUBMISSION=submissions/studmuffin01-project-1"
set "COMMIT_MSG=INITIARA: Phase B — initiative archive/edit, team roster, task filters"

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

git add %SUBMISSION%
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
echo Done. Branch pushed to fork (no PR created):
echo   https://github.com/Studmuffin01/hult-cohort-program/tree/%BRANCH%

endlocal
