@echo off
cd /d "%~dp0"
echo Minting local Ludwitt launch URL from .env.local ...
node scripts\mint-launch-token.mjs
echo.
pause
