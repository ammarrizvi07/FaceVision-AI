# System Architecture & Technical Specifications

## 1. Overview
FaceVision AI is organized as a decoupled, multi-tier client-server architecture designed for real-time edge computer vision inference on commodity CPU hardware.

---

## 2. Component Diagram

```text
+-------------------------------------------------------------+
|                     PRESENTATION TIER                       |
|  React 18 / Vite 5 / Tailwind CSS / Recharts / Lucide Icons |
|                                                             |
|  [Dashboard] [Live View] [Register Wizard] [Users] [Logs]   |
+------------------------------+------------------------------+
                               | HTTP / REST (Axios)
                               v
+-------------------------------------------------------------+
|                     APPLICATION TIER                        |
|              FastAPI (Asynchronous Python 3.11+)            |
|                                                             |
|  [Health API]  [Users API]  [Recognition API]  [Settings]   |
+------------------------------+------------------------------+
                               |
        +----------------------+----------------------+
        |                                             |
        v                                             v
+-----------------------------+     +-----------------------------+
|     DATA ACCESS TIER        |     |     MACHINE LEARNING TIER   |
|   SQLAlchemy 2.0 ORM        |     |  OpenCV DNN & ONNX Runtime  |
|                             |     |                             |
|  - Users Table              |     |  - YuNet CNN Detector       |
|  - FaceEmbeddings Table     |     |  - Affine Crop Preprocessor |
|  - RecognitionLogs Table    |     |  - SFace Embedding Model    |
|  - AppSettings Table        |     |  - Cosine Distance Matcher  |
|  - SQLite (Local DB)        |     +-----------------------------+
+-----------------------------+
```

---

## 3. Machine Learning Pipeline Details

### A. YuNet Face Detection
- **Architecture**: Lightweight single-stage convolutional detector with Feature Pyramid Network (FPN) and scale-aware bounding box regression.
- **Input Shape**: Dynamically resized to match incoming video frame dimensions (typically 640x480).
- **Outputs**:
  - `x, y, width, height`: Bounding box of detected face.
  - `(x1, y1) ... (x5, y5)`: 5 key landmarks: Right Eye, Left Eye, Nose Tip, Right Mouth Corner, Left Mouth Corner.
  - `score`: Detection confidence score (thresholded at `0.80`).

### B. Preprocessing & Facial Landmark Alignment
- Landmark alignment is mathematically critical. Faces tilted or rotated undergo a similarity transformation (affine rotation and scaling) so that eyes are horizontally leveled and the nose/mouth are centered in a canonical 112x112 RGB matrix.
- Laplacian variance blur detection:
  $$\sigma^2 = 	ext{Var}\left(
abla^2 f(x, y)ight)$$
  Frames with $\sigma^2 < 35.0$ are rejected as blurry.

### C. SFace Feature Extraction
- **Input**: 112x112 canonical aligned face tensor.
- **Output**: 128-dimensional dense feature representation:
  $$\mathbf{e} = [e_1, e_2, \dots, e_{128}] \in \mathbb{R}^{128}, \quad \|\mathbf{e}\|_2 = 1.0$$
- Embeddings are serialized as IEEE 754 32-bit floats directly into SQLite `LargeBinary` BLOB columns.

### D. Cosine Similarity Matching
- Two vectors $\mathbf{A}$ and $\mathbf{B}$ are compared via:
  $$	ext{Cosine Similarity}(\mathbf{A}, \mathbf{B}) = rac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\|_2 \|\mathbf{B}\|_2}$$
- Since both vectors are L2-normalized ($\|\mathbf{A}\| = \|\mathbf{B}\| = 1$), the calculation simplifies to an efficient inner product:
  $$	ext{Similarity} = \sum_{i=1}^{128} A_i B_i$$
- Classification decision rule:
  $$	ext{Subject} = egin{cases} 	ext{User}_k & 	ext{if } \max_k(	ext{sim}_k) \ge 	au \ 	ext{Unknown} & 	ext{otherwise} \end{cases}$$
  where default calibrated threshold $	au = 0.363$.
