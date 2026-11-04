# FaceVision AI — Setup & Execution Guide

Welcome to **FaceVision AI**, an intelligent, deep learning-powered face recognition system running locally on Windows.

---

## ⚡ Quick Start: One-Click Launchers

The easiest way to run the entire system (FastAPI backend + React frontend):

1. **Start the System**:
   Double-click `start_project.bat` in the project root folder.
   - It verifies your Python and Node environments.
   - Launches the FastAPI backend on `http://127.0.0.1:8000`.
   - Launches the React/Vite frontend on `http://localhost:5173`.
   - Automatically opens your default web browser to the dashboard.

2. **Stop the System**:
   Double-click `stop_project.bat` in the project root folder.
   - Targets and safely terminates only the processes running on ports `8000` and `5173`.
   - Leaves all other background Python or Node processes untouched.

---

## 💻 Manual Execution via Terminal (VS Code)

### Step 1: Open Project in VS Code
Open Visual Studio Code, click **File > Open Folder...**, and select:
```
C:\Users\Syed ammaar rizvi\OneDrive\Desktop\FaceVision-AI
```

### Step 2: Start the Backend (Terminal 1)
Open a terminal in VS Code (`Ctrl + ~`) and execute:
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
# (Or if PowerShell script execution is restricted, run: cmd /c ".venv\Scripts\activate.bat && uvicorn app.main:app --reload")
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Verify backend is running by opening: `http://127.0.0.1:8000/docs` (Interactive Swagger UI).

### Step 3: Start the Frontend (Terminal 2)
Open a second terminal split in VS Code and execute:
```powershell
cd frontend
npm.cmd run dev
```
- Open `http://localhost:5173` in your browser.

---

## 📷 How to Test Live Face Recognition & Registration

### 1. Register Your Face
1. Navigate to the **Register Face** page in the left sidebar.
2. Enter your **Name** (e.g. *Syed Rizvi*) and optional Student ID.
3. Review and check the mandatory **Explicit Biometric Consent Agreement**.
4. Click **Proceed to Camera Capture**.
5. When your browser prompts for **Camera Access**, click **Allow**.
6. Center your face in the oval guide and click **Capture Sample**.
7. Capture 3 to 10 distinct samples (looking straight, smiling slightly, turning head slightly).
8. Click **Review Enrollment** &rarr; **Finalize & Save Registration**.

### 2. Live Face Recognition
1. Navigate to **Live Recognition** in the sidebar.
2. Click **Start Camera** (if not already running).
3. Click **Start Recognition**.
4. The system will detect your face in real-time, generate 128-dimensional deep feature embeddings, compare them against the SQLite database using Cosine Similarity, and render a bright cyan bounding box with your name and confidence percentage!
5. When an unregistered individual looks at the camera, the system marks them as **Unknown** (amber bounding box) because their similarity is below the calibrated threshold (`0.363`).

### 3. Review Analytics & Audit Logs
- Check **Dashboard** to see live recognition trends, match accuracy %, and average CPU latency.
- Check **Recognition Logs** to view historical audit entries.
- Check **Registered Users** to review enrolled subjects or perform permanent biometric data deletion.

---

## 🛠️ Common Windows Troubleshooting

- **PowerShell Execution Policy Error**:
  - *Error*: `File ... cannot be loaded because running scripts is disabled on this system.`
  - *Fix*: Use `npm.cmd` instead of `npm`, or run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.
- **Camera Permission Blocked in Browser**:
  - *Fix*: Look at the left side of your browser URL address bar, click the camera icon / site settings, set Camera to **Allow**, and refresh.
- **Port 8000 or 5173 already in use**:
  - *Fix*: Run `stop_project.bat` to clear hanging ports.
