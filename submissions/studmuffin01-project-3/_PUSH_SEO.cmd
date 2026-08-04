@echo off
cd /d C:\Users\raarneaud\Desktop\Ludwitt\hult-cohort-program
git add submissions/studmuffin01-project-3/app/layout.tsx submissions/studmuffin01-project-3/app/robots.ts submissions/studmuffin01-project-3/app/sitemap.ts submissions/studmuffin01-project-3/lib/links.ts submissions/studmuffin01-project-3/.env.example submissions/studmuffin01-project-3/REVIEWER.md
git status -sb
git commit -m "feat(lighthouse): add metadataBase, robots.txt, and sitemap" -m "Address peer review SEO gaps: production metadataBase for OG/canonical URLs, robots.ts, and sitemap.ts covering public routes and profiles."
if errorlevel 1 exit /b 1
git push fork HEAD
echo.
echo After deploy: open /robots.txt and /sitemap.xml
echo Set Vercel env NEXT_PUBLIC_SITE_URL=https://lighthouse-studmuffin01.vercel.app if not already set.
del /F /Q "%~f0" 2>nul
