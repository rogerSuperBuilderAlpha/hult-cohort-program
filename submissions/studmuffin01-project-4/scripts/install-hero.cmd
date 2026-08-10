@echo off
setlocal
cd /d "%~dp0.."

set "DEST=public\images\score-goal.png"
set "SRC1=C:\Users\raarneaud\.cursor\projects\c-Users-raarneaud-Desktop-Ludwitt-hult-cohort-program-submissions-studmuffin01-project-4\assets\score-goal.png"
set "SRC2=C:\Users\raarneaud\.cursor\projects\c-Users-raarneaud-Desktop-Ludwitt-hult-cohort-program-submissions-studmuffin01-project-4\assets\c__Users_raarneaud_AppData_Roaming_Cursor_User_workspaceStorage_1ed4d013749561502db3de05bb5710f5_images_image-7e42fba1-62fb-4737-b1cc-addc949cb895.png"

mkdir public\images 2>nul

if exist "%SRC1%" (
  copy /Y "%SRC1%" "%DEST%" >nul
  echo Installed generated hero: %DEST%
  goto :done
)

if exist "%SRC2%" (
  copy /Y "%SRC2%" "%DEST%" >nul
  echo Installed reference hero: %DEST%
  goto :done
)

echo Could not find hero source images.
exit /b 1

:done
dir "%DEST%"
endlocal
