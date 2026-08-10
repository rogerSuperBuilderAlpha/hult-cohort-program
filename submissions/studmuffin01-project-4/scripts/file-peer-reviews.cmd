@echo off
setlocal
cd /d "%~dp0\.."

if "%GITHUB_TOKEN%"=="" (
  echo.
  echo GITHUB_TOKEN is not set in this window.
  echo.
  echo 1. Sign in to GitHub as Studmuffin01
  echo 2. Create a classic token: https://github.com/settings/tokens
  echo    Enable scope: repo
  echo 3. Then run:
  echo    set GITHUB_TOKEN=ghp_your_token_here
  echo 4. Re-run this script.
  echo.
  exit /b 1
)

echo.
echo === Project 1 dry-run ===
node scripts\file-peer-reviews.mjs --project 1 --dry-run
if errorlevel 1 exit /b 1

echo.
set /p GO1=File remaining Project 1 reviews now? (y/N): 
if /I not "%GO1%"=="y" goto P2

echo === Project 1 execute ===
node scripts\file-peer-reviews.mjs --project 1 --execute
if errorlevel 1 exit /b 1

:P2
echo.
echo === Project 2 dry-run ===
node scripts\file-peer-reviews.mjs --project 2 --dry-run
if errorlevel 1 exit /b 1

echo.
set /p GO2=File remaining Project 2 reviews now? (y/N): 
if /I not "%GO2%"=="y" goto DONE

echo === Project 2 execute ===
node scripts\file-peer-reviews.mjs --project 2 --execute
if errorlevel 1 exit /b 1

:DONE
echo.
echo Done. Refresh the cohort dashboard in about 1 minute.
endlocal
