@echo off
setlocal
cd /d "%~dp0"

if not exist ".env" (
  echo Missing .env. Copy .env.example to .env and fill in the Cognito outputs first.
  pause
  exit /b 1
)

where aws >nul 2>nul
if errorlevel 1 (
  echo AWS CLI was not found. Install AWS CLI v2, then reopen this window.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js, then reopen this window.
  pause
  exit /b 1
)

echo Signing in with the Student Drive AWS SSO profile...
aws sso login --profile student-drive
if errorlevel 1 (
  echo AWS sign-in failed. Resolve the SSO prompt and run this file again.
  pause
  exit /b 1
)

echo Starting Student Drive in AWS mode. Keep this window open while presenting.
echo Open http://localhost:3001 in your browser.
node server.js

pause
