@echo off
title FaceVision AI - Frontend Service
cd /d "%~dp0"
echo Starting Vite Frontend on http://localhost:5173 ...
call npm.cmd run dev -- --host 127.0.0.1 --port 5173
if %errorlevel% neq 0 (
    echo [ERROR] Frontend exited with code %errorlevel%
    pause
)
