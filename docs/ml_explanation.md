# Machine Learning & Computer Vision Foundations

This document provides a comprehensive academic explanation of the machine learning, deep learning, and computer vision concepts utilized in **FaceVision AI**.

---

## 1. Computer Vision: Detection vs. Recognition

A common point of confusion in computer vision is the distinction between **Detection** and **Recognition**:

| Task | Question Answered | Output | Algorithmic Mechanism |
| :--- | :--- | :--- | :--- |
| **Face Detection** | *"Is there a human face in this image, and where is it?"* | Bounding box $(x, y, w, h)$ + landmarks | Object detection CNN (e.g., YuNet) |
| **Face Recognition** | *"Whose face is this?"* | Identity string or "Unknown" | Deep Metric Learning & Embedding vector comparison |

Face recognition cannot succeed without accurate detection: the detector isolates the region of interest (ROI) and locates facial landmarks before the recognition model processes the face.

---

## 2. Deep Metric Learning & Face Embeddings

Traditional machine learning classifiers (such as Softmax over $K$ output classes) fail for biometric systems because:
1. Adding a new user would require retraining the entire neural network.
2. The number of enrolled users is unbounded.

### The Solution: Feature Embeddings
Modern face recognition uses **Deep Metric Learning**. Instead of classifying into fixed classes, the neural network acts as a **feature extractor**:
- It maps an input image $I$ to a point $\mathbf{e} = f(I)$ in a high-dimensional vector space $\mathbb{R}^{128}$.
- The network is trained using **Angular Margin Loss** (ArcFace / CosFace) to enforce:
  - **Intra-class compactness**: Different photos of the *same* person map to points very close together.
  - **Inter-class discrepancy**: Photos of *different* people map to points far apart.

---

## 3. The Cosine Similarity Metric

To compare two facial embedding vectors $\mathbf{u}$ and $\mathbf{v}$:

$$\cos(	heta) = rac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|} = rac{\sum_{i=1}^{d} u_i v_i}{\sqrt{\sum_{i=1}^{d} u_i^2} \sqrt{\sum_{i=1}^{d} v_i^2}}$$

- **Geometric Intuition**: Cosine similarity measures the angle $	heta$ between two vectors in 128-dimensional hyperspace.
  - If $	heta = 0^\circ \implies \cos(	heta) = 1.0$ (Identical direction).
  - If $	heta = 90^\circ \implies \cos(	heta) = 0.0$ (Orthogonal / unrelated features).
  - If $	heta = 180^\circ \implies \cos(	heta) = -1.0$ (Opposite features).

---

## 4. Threshold Calibration & Error Rates

In any biometric authentication system, setting the decision threshold $	au$ determines the trade-off between two fundamental error types:

1. **False Acceptance Rate (FAR)**: The probability that an unauthorized/unknown face is mistakenly classified as a registered user (Security Risk).
2. **False Rejection Rate (FRR)**: The probability that a genuine enrolled user is rejected as "Unknown" (Usability Frustration).

$$	ext{Equal Error Rate (EER)}: 	ext{The point where } 	ext{FAR} = 	ext{FRR}$$

In FaceVision AI, the default threshold is set to **0.363**, corresponding to the benchmark calibration for OpenCV's SFace model, yielding FAR $< 0.1\%$ while maintaining genuine recognition rate $> 95\%$ under normal illumination.
