@echo off
title NTUST Calendar Launcher
cls
echo ==================================================
echo   Starting NTUST Student Calendar Server...
echo ==================================================

set "NODE_EXE=C:\Users\user\AppData\Local\ms-playwright-go\1.57.0\node.exe"

if not exist "%NODE_EXE%" (
    set "NODE_EXE=node"
)

echo 1. Starting Backend Server (Port 3001)...
start "NTUST_Server" "%NODE_EXE%" server/index.js

timeout /t 2 > nul

echo 2. Opening Browser at http://localhost:3001 ...
start http://localhost:3001

echo.
echo ==================================================
echo   Success! App opened in your web browser.
echo ==================================================
echo.
pause
