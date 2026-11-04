@echo off
setlocal enabledelayedexpansion
title FaceVision AI - Launcher
color 0B

echo =====================================================================
echo           FaceVision AI - Intelligent Face Recognition System
echo               College Final-Year Project and Placement Demo
echo =====================================================================
echo.

cd /d "%~dp0"

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Python is not found in system PATH.
    echo Please install Python 3.11+ and ensure 'Add Python to PATH' is checked.
    pause
    exit /b 1
)

:: Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not found in system PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check Backend Virtual Environment
if not exist "backend\.venv\Scripts\python.exe" (
    color 0C
    echo [ERROR] Virtual environment backend\.venv was not found!
    echo Please run: cd backend ^&^& python -m venv .venv ^&^& .venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)

:: Check Frontend Node Modules
if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend npm dependencies...
    cd frontend
    call npm.cmd install
    cd ..
)

echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "FaceVision AI - Backend" /d "%~dp0backend" cmd /c "run_backend.bat"

echo [2/3] Starting React/Vite Frontend on http://localhost:5173 ...
start "FaceVision AI - Frontend" /d "%~dp0frontend" cmd /c "run_frontend.bat"

echo [3/3] Waiting for services to initialize...
ping 127.0.0.1 -n 4 >nul

echo Opening browser at http://localhost:5173 ...
start "" "http://localhost:5173"

echo.
echo =====================================================================
echo  FaceVision AI is running!
echo  - Frontend:  http://localhost:5173
echo  - Backend:   http://127.0.0.1:8000
echo  - Swagger:   http://127.0.0.1:8000/docs
echo.
echo  To stop the application cleanly, run: stop_project.bat
echo =====================================================================
echo.
pause
