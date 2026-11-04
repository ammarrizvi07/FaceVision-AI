# FaceVision AI — Intelligent Face Recognition System

[![Python 3.11+](https://img.shields.io/badge/Python-3.11%20%7C%203.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![OpenCV](https://img.shields.io/badge/OpenCV-YuNet%20%7C%20SFace-5C3EE8.svg)](https://opencv.org)
[![React Vite](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-61DAFB.svg)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intelligent, production-style Face Recognition and Biometric Management System designed for academic evaluation, final-year demonstration, and portfolio presentation. Operates completely locally on Windows CPU without requiring external paid cloud APIs.

---

## 🌟 Key Features

1. **Real Deep Learning Pipeline**:
   - **YuNet Face Detector**: High-speed convolutional neural network running on CPU, detecting multi-face bounding boxes and 5 facial landmarks (eyes, nose, mouth).
   - **SFace Recognizer**: Deep facial feature extractor outputting 128-dimensional L2-normalized vectors.
   - **Mathematical Cosine Matching**: Compares facial vectors in high-dimensional space with calibrated thresholding (`0.363`).

2. **Ethical Biometric Architecture**:
   - Explicit opt-in consent agreement required prior to sample extraction.
   - Local-only data storage in SQLite (`backend/data/database/facevision.db`).
   - One-click biometric data eradication (`CASCADE` deletion of all embeddings).
   - Zero covert tracking or unauthorized surveillance.

3. **Modern SaaS UI/UX**:
   - Built with React, Vite, Tailwind CSS, Lucide Icons, and Recharts.
   - Real-time video canvas with color-coded bounding boxes and facial landmark points.
   - Multi-face recognition in a single frame.
   - Real-time telemetry: FPS meter, inference latency (ms), and sensitivity tuning slider.

4. **Production-Ready Architecture**:
   - FastAPI REST API with Swagger documentation (`/docs`).
   - Automated unit tests covering ML similarity, user validation, and API routes.
   - One-click Windows launchers (`start_project.bat` and `stop_project.bat`).

---

## 📁 System Architecture

```text
              REACT FRONTEND (Vite / Tailwind)
                            |
                     Webcam Frames (JPEG)
                            |
                            v
              FASTAPI REST BACKEND (:8000)
                            |
                            v
             YUNET CONVOLUTIONAL DETECTOR
               (Bounding Box + Landmarks)
                            |
                            v
             LANDMARK AFFINE ALIGNMENT
                (112x112 Canonical Face)
                            |
                            v
             SFACE FEATURE EXTRACTOR
            (128-d L2-Normalized Embedding)
                            |
                            v
             COSINE SIMILARITY MATCHER
            (Threshold Calibration = 0.363)
                   /                \
                  v                  v
          KNOWN INDIVIDUAL        UNKNOWN FACE
                  \                /
                   v              v
               SQLITE DATABASE (:memory / disk)
                            |
                   JSON API RESPONSE
                            |
                            v
             REACT HUD & ANALYTICS DASHBOARD
```

---

## 🚀 Quick Launch

Simply double-click **`start_project.bat`** in the project root!

Or run manually:
```powershell
# Terminal 1: Backend
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm.cmd run dev
```

---

## 📚 Academic Documentation
Detailed documentation is provided in the `docs/` directory:
- [System Architecture](docs/architecture.md)
- [Machine Learning Principles & Math](docs/ml_explanation.md)
- [REST API Specifications](docs/api_documentation.md)
- [Installation & Windows Configuration](docs/installation.md)
- [College Viva / Interview Q&A (30+ Questions)](docs/viva_questions.md)
