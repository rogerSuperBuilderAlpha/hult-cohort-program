@echo off

setlocal enabledelayedexpansion



REM Push INITIARA submission to fork, commit, and open PR.

REM Run from CMD:

REM   cd submissions\studmuffin01-project-1

REM   scripts\push-to-fork.bat



set "FORK_URL=https://github.com/Studmuffin01/hult-cohort-program.git"

set "BRANCH=participants/summer26/phase-1-project-1/studmuffin01"

set "SUBMISSION=submissions/studmuffin01-project-1"



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

git reset HEAD -- %SUBMISSION%\.env.local 2>nul

git reset HEAD -- %SUBMISSION%\_commit_pr_report.txt 2>nul

git reset HEAD -- %SUBMISSION%\git-status.txt 2>nul

git reset HEAD -- %SUBMISSION%\shell-test.txt 2>nul

git reset HEAD -- %SUBMISSION%\ci-output.txt 2>nul

git reset HEAD -- %SUBMISSION%\test-out.txt 2>nul

git reset HEAD -- %SUBMISSION%\push-log.txt 2>nul



echo.

echo --- Status ---

git status -sb



git diff --cached --quiet

if errorlevel 1 (

  git commit -m "Complete Phase B rubric: team members, assignee picker, task filters, initiative edit/archive." -m "Supabase auth polish, mobile Command Center, Vitest tests, REVIEWER_RUBRIC.md, and UX polish for INITIARA submission."

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

echo --- Pull request ---

set "PR_BODY=%TEMP%\initiara-pr-body.md"

(

  echo ## Summary

  echo - Phase B rubric completion: team members roster, assignee picker, task filters, initiative edit/archive

  echo - Supabase auth and per-user persistence; Command Center sidebar, AI Assistant, motivation tools

  echo - Mobile Command Center drawer in page header, dark mode contrast, and UX polish

  echo - Vitest coverage and REVIEWER_RUBRIC.md for reviewers

  echo.

  echo ## Production URL
  echo.
  echo https://initiara-rawle.vercel.app
  echo.
  echo ## Test plan

  echo - [ ] Map deliverables to submissions/studmuffin01-project-1/REVIEWER_RUBRIC.md

  echo - [ ] cd submissions/studmuffin01-project-1 ^&^& npm test

  echo - [ ] npm run lint

  echo - [ ] npm run build

  echo - [ ] Sign in on production, create initiative, add team member, assign task, filter, archive

) > "%PR_BODY%"



gh pr view --json url >nul 2>&1

if errorlevel 1 (

  gh pr create --title "studmuffin01 Project 1: Phase B rubric completion" --body-file "%PR_BODY%"

) else (

  echo PR already exists:

  gh pr view --json url --jq .url

)



echo.

echo Done.
echo.
echo Open or update your cohort PR ^(base/head must match SUBMISSION.md^):
echo https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/compare/projects/summer26/phase-1-project-1...Studmuffin01:participants/summer26/phase-1-project-1/studmuffin01
echo.
echo Submission: https://github.com/Studmuffin01/hult-cohort-program/tree/%BRANCH%/%SUBMISSION%



endlocal

