@echo off
title FaceVision AI - Backend Service
cd /d "%~dp0"
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
if %errorlevel% neq 0 (
    echo [ERROR] Backend exited with code %errorlevel%
    pause
)
