@echo off
cd /d C:\Users\raarneaud\Desktop\Ludwitt\hult-cohort-program

echo Building Lighthouse...
cd submissions\studmuffin01-project-3
call npm run build
if errorlevel 1 (
  echo BUILD FAILED — fix errors before push.
  exit /b 1
)
cd ..\..

git add submissions/studmuffin01-project-3
git status -sb

git commit -m "fix(lighthouse): public root showcase and honest sample profiles" -m "Make / the public homepage with /signin optional; /home redirects. Sample profiles no longer invent stranger social URLs, fake repos, or PoW. Label /live and Cohort Live as seeded/demo; point Fireside docs at fireside-studmuffin01.vercel.app."
if errorlevel 1 exit /b 1

git push fork HEAD
echo.
echo Pushed to fork. On Vercel: Promote the new Preview to Production.
echo Confirm NEXT_PUBLIC_SITE_URL=https://lighthouse-studmuffin01.vercel.app
del /F /Q "%~f0" 2>nul
