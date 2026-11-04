@echo off
setlocal enabledelayedexpansion
title FaceVision AI - Stopping Services
color 0E

echo =====================================================================
echo                 FaceVision AI - Process Termination
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/2] Finding and terminating backend process on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Terminating backend PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo [2/2] Finding and terminating frontend dev server on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Terminating frontend PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo =====================================================================
echo  FaceVision AI services have been stopped successfully!
echo =====================================================================
echo.
ping 127.0.0.1 -n 3 >nul
