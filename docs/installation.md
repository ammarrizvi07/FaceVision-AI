# Detailed Installation & Environment Guide

## Prerequisites
- **Operating System**: Windows 10 or Windows 11 (64-bit)
- **Python**: 3.11, 3.12, 3.13, or 3.14 (Ensure "Add Python to PATH" was checked during install)
- **Node.js**: v18.0.0 or higher
- **VS Code**: Recommended IDE

---

## Step-by-Step Manual Installation

### 1. Backend Setup
```powershell
cd backend

# Create virtual environment
python -m venv .venv

# Activate venv
.\.venv\Scripts\Activate.ps1

# Upgrade pip and install pinned dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 2. Frontend Setup
```powershell
cd ..\frontend
npm.cmd install
```

### 3. Verify ML Models
The backend automatically downloads the two required pretrained ONNX models on initial run. You can also verify them in:
```
backend/data/models/face_detection_yunet_2023mar.onnx (~232 KB)
backend/data/models/face_recognition_sface_2021dec.onnx (~38.7 MB)
```

---

## Execution
Use `start_project.bat` in the project root, or launch manually using the commands detailed in `HOW_TO_RUN.md`.
