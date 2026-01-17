@echo off
echo ===========================================
echo   PREPARING ULTIMATE EXTENSION FOR CHROME
echo ===========================================
echo.
echo [1/3] Installing dependencies...
call npm install
echo.
echo [2/3] Building extension (Ultimate Edition)...
call npm run build-only
echo.
echo [DONE] Opening 'dist' folder...
start .
start dist
echo.
echo ===========================================
echo               BUILD COMPLETE
echo ===========================================
echo.
echo HOW TO INSTALL:
echo 1. Open Chrome and go to chrome://extensions/
echo 2. Enable 'Developer mode' (top right).
echo 3. Click 'Load unpacked'.
echo 4. Select the 'dist' folder in this directory.
echo.
pause
