@echo off
title ExamIQ Launcher
echo ==========================================
echo   ExamIQ - AI Exam Prep App Launcher
echo ==========================================
echo.

REM ---- 1. Make sure MongoDB service is running ----
sc query MongoDB 2>NUL | find "RUNNING" >NUL
if %ERRORLEVEL%==0 (
  echo [OK] MongoDB service is running
) else (
  echo [..] Starting MongoDB service...
  net start MongoDB
  echo [OK] MongoDB service started
)

REM ---- 2. Start backend (port 5000) ----
echo [..] Starting backend server...
start "ExamIQ Backend (port 5000)" cmd /k "cd /d "%~dp0backend" && node server.js"

REM ---- 3. Start frontend (port 3000) ----
echo [..] Starting frontend (takes ~30-40s to compile)...
start "ExamIQ Frontend (port 3000)" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo Both servers are starting in their own windows.
echo Wait ~40 seconds, then open:  http://localhost:3000
echo.
echo Tips:
echo   - Keep the two new windows open while using the app.
echo   - The "Frontend" window shows "Compiled successfully!" when ready.
echo   - Ctrl+C in a server window stops just that server.
pause
