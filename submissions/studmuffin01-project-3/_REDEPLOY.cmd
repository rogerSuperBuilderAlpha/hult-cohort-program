@echo off
setlocal
cd /d C:\Users\raarneaud\Desktop\Ludwitt\hult-cohort-program\submissions\studmuffin01-project-3

echo Current commit on this branch:
cd /d C:\Users\raarneaud\Desktop\Ludwitt\hult-cohort-program
git log -1 --oneline
echo.

where vercel >nul 2>&1
if errorlevel 1 (
  echo vercel CLI not found. Opening Vercel dashboard...
  start "" "https://vercel.com/dashboard"
  echo.
  echo In the lighthouse-studmuffin01 project:
  echo   1. Settings -^> Git — confirm Production Branch is:
  echo      participants/summer26/phase-1-project-3/studmuffin01
  echo   2. Deployments -^> find commit c8db864 or 394ef6b
  echo   3. If missing: Deployments -^> ... -^> Redeploy, OR push an empty commit
  echo.
  echo Empty commit push option:
  echo   git commit --allow-empty -m "chore: trigger vercel redeploy"
  echo   git push fork HEAD
  goto :end
)

echo Deploying to Vercel production from this folder...
vercel --prod --yes
if errorlevel 1 (
  echo vercel deploy failed — open dashboard and redeploy manually.
  start "" "https://vercel.com/dashboard"
)

:end
echo.
echo When Ready, open:
echo   https://lighthouse-studmuffin01.vercel.app/developers/nikjain15
echo It should NOT say Developer not found.
pause
del /F /Q "%~f0" 2>nul
endlocal
