@echo off
cd /d C:\Users\raarneaud\Desktop\Ludwitt\hult-cohort-program
echo Opening GitHub compare page to create the PR...
start "" "https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/compare/projects/summer26/phase-1-project-3...Studmuffin01:participants/summer26/phase-1-project-3/studmuffin01?expand=1"
echo.
echo Paste this title:
echo fix(lighthouse): real cohort profiles + sample-data badges
echo.
echo Paste this body:
echo.
echo ## Summary
echo - Add 9 real Summer Pilot profiles from merged submission PRs with verified public deploys
echo - Badge remaining seed people/testimonials/partners as Sample data; block intros for demo handles
echo - Soften Cohort Live / PM snapshot copy so demo data is not presented as live sync
echo.
echo Addresses peer review feedback on seed-roster fiction (e.g. issue #200).
echo.
echo ## Test plan
echo - [ ] /developers shows 9 real profiles without Sample badge
echo - [ ] Sample profiles/testimonials/partners show Sample data badge
echo - [ ] Partners intro form only lists real public handles
echo - [ ] Cohort Live / PM panel say demo/illustrative
echo - [ ] Vercel redeploy includes commits 394ef6b and c8db864
echo - [ ] npm run build in submissions/studmuffin01-project-3
echo.
echo Then: Vercel -^> lighthouse-studmuffin01 -^> Deployments -^> Redeploy from this branch.
pause
del /F /Q "%~f0" 2>nul
