@echo off
cd /d "%~dp0.."
echo Clearing .next cache...
if exist .next rmdir /s /q .next
echo Done.
echo Now run: npm run dev
