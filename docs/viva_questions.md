# FaceVision AI — Comprehensive Viva & Interview Preparation (30+ Questions & Answers)

This guide is designed to prepare you for technical defense, project vivas, and machine learning placement interviews.

---

### Q1: What is the primary objective of this project?
**Answer:** The objective is to design and develop an end-to-end, edge-compatible face recognition and biometric management system. It captures video frames via webcam, performs real-time face detection and landmark alignment using a deep CNN (YuNet), extracts 128-dimensional feature embeddings using SFace, and identifies enrolled individuals using Cosine Similarity matching against a local SQLite database.

---

### Q2: Why did you separate Face Detection from Face Recognition?
**Answer:** Face detection answers *"Where is the face in the image?"*, returning bounding box coordinates and landmark coordinates. Face recognition answers *"Whose face is this?"*, matching facial identity. Detection is a necessary prerequisite because feature extraction networks require normalized, tightly cropped, frontalized face regions to generate reliable biometric embeddings.

---

### Q3: Which face detection model did you use, and why?
**Answer:** We used **YuNet** (`face_detection_yunet_2023mar.onnx`), a lightweight, convolutional face detector developed by OpenCV Zoo. It is based on a Feature Pyramid Network (FPN) architecture and runs in real time (~10-25 ms) on standard laptop CPUs. It also regresses 5 key facial landmarks (right eye, left eye, nose, right mouth, left mouth) needed for affine alignment.

---

### Q4: Which feature extraction model did you use?
**Answer:** We used **SFace** (`face_recognition_sface_2021dec.onnx`), an efficient deep CNN model trained with Angular Margin Loss (ArcFace / SphereFace). It extracts a 128-dimensional dense vector representation that encodes facial features into a metric space.

---

### Q5: What is a facial embedding?
**Answer:** A facial embedding is a high-dimensional numerical vector (here, $\mathbb{R}^{128}$) where the semantic geometric and texture properties of a human face are compressed. The model is trained so that photos of the same individual yield vectors with small angular distance, while different individuals yield vectors with large angular distance.

---

### Q6: How does Cosine Similarity work mathematically?
**Answer:** Cosine similarity computes the cosine of the angle $	heta$ between two vectors:
$$	ext{Cosine Similarity}(\mathbf{A}, \mathbf{B}) = rac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\|_2 \|\mathbf{B}\|_2}$$
Because our embeddings are pre-normalized to unit length ($\|\mathbf{A}\|_2 = \|\mathbf{B}\|_2 = 1.0$), the cosine similarity is simply the dot product $\sum_{i=1}^{128} A_i B_i$. It ranges from $-1.0$ to $+1.0$.

---

### Q7: Why is a similarity threshold required?
**Answer:** Without a threshold, a nearest-neighbor matcher would match an unknown or unregistered face to whichever registered person happens to have the highest similarity. The threshold ensures that if the highest match score is below a confident value (default $0.363$), the system marks the person as **Unknown**.

---

### Q8: What does the threshold value of 0.363 mean?
**Answer:** In the OpenCV SFace benchmark evaluation on the LFW (Labeled Faces in the Wild) dataset, a cosine threshold of 0.363 represents the calibrated operating point that achieves high verification accuracy ($> 95\%$) while keeping the False Acceptance Rate (FAR) under $0.1\%$.

---

### Q9: What are False Acceptance Rate (FAR) and False Rejection Rate (FRR)?
**Answer:**
- **FAR (Type I error)**: The probability that an unauthorized/unknown individual is falsely identified as an enrolled user.
- **FRR (Type II error)**: The probability that an authorized, enrolled user is rejected as "Unknown".
Increasing the threshold decreases FAR (improves security) but increases FRR (decreases convenience).

---

### Q10: How do you handle multiple faces in a single frame?
**Answer:** The YuNet detector returns an array of bounding boxes for all detected faces. The backend iterates through every detected face, independently crops and aligns each face, extracts separate 128-dimensional embeddings, matches each against enrolled templates, and returns an array of results with corresponding bounding coordinates.

---

### Q11: What is Facial Landmark Alignment and why is it essential?
**Answer:** When humans look at a camera, their heads may tilt, rotate, or be off-center. Landmark alignment detects 5 points (eyes, nose, mouth corners) and applies a 2D affine transformation to warp the face into a standardized canonical coordinate system. This ensures the neural network receives standardized inputs regardless of head pose.

---

### Q12: How do you prevent blurry images from being registered?
**Answer:** We apply the **Laplacian variance method**:
$$\sigma^2 = 	ext{Var}\left(
abla^2 f(x,y)ight)$$
Edges produce high variance when sharp and low variance when blurry. If the variance is below our calibrated threshold ($35.0$), the sample is flagged as blurry and rejected.

---

### Q13: Why do you store embeddings instead of raw photos?
**Answer:**
1. **Privacy**: Embeddings are mathematical vectors that cannot be easily inverted into original photos.
2. **Storage Efficiency**: A 128-element float array occupies only 512 bytes, compared to megabytes for high-res images.
3. **Speed**: Dot-product matching against numerical arrays in memory takes microseconds.

---

### Q14: How is user data stored in the database?
**Answer:** We use SQLite with SQLAlchemy ORM. The `users` table holds subject metadata (name, identifier, consent timestamp). The `face_embeddings` table holds the 128-dimensional vectors as binary BLOBs linked via foreign key with `ON DELETE CASCADE`.

---

### Q15: What happens when a user is deleted?
**Answer:** When a user is deleted via `DELETE /api/users/{id}`, the foreign key `CASCADE` rule automatically deletes all corresponding biometric embedding records from the database, ensuring complete erasure of biometric data.

---

### Q16: Why did you choose FastAPI over Flask or Django?
**Answer:** FastAPI offers:
1. Native asynchronous event loops for high-concurrency requests.
2. Built-in Pydantic data validation and OpenAPI (Swagger) documentation.
3. Minimal overhead and high execution speed suitable for real-time video streaming.

---

### Q17: Why use Vite instead of Create React App?
**Answer:** Vite uses native ES modules (ESM) and esbuild, resulting in sub-second cold server start, instant Hot Module Replacement (HMR), and optimized production rollups.

---

### Q18: What is temporal smoothing and why is it used?
**Answer:** In video recognition, minor lighting fluctuations or motion blur in an isolated frame might cause a score to dip temporarily. Temporal smoothing buffers results over consecutive frames to avoid flickering labels and maintain stable tracking.

---

### Q19: Why does the system run on CPU rather than GPU?
**Answer:** While GPU acceleration is supported via CUDA/DirectML, utilizing CPU-optimized ONNX Runtime ensures accessibility. The models (YuNet at ~232 KB and SFace at ~38 MB) were specifically designed to achieve 20-30 FPS on ordinary laptop processors without requiring expensive discrete graphics cards.

---

### Q20: How does the system protect biometric privacy?
**Answer:**
1. Explicit opt-in consent is enforced programmatically before registration.
2. Processing is 100% local — zero data is transmitted over the internet.
3. Users can inspect and delete their data at any time.
4. Camera status is always visible, preventing covert capture.

---

### Q21: What is L2 Normalization and why is it performed?
**Answer:** L2 normalization scales a vector $\mathbf{v}$ so that its Euclidean norm is $1$:
$$\mathbf{v}_{	ext{norm}} = rac{\mathbf{v}}{\sqrt{\sum_{i} v_i^2}}$$
When vectors are L2-normalized, Euclidean distance and Cosine similarity become mathematically equivalent:
$$\|\mathbf{u} - \mathbf{v}\|_2^2 = 2 - 2(\mathbf{u} \cdot \mathbf{v})$$
This allows similarity calculations to use fast dot products.

---

### Q22: What is the difference between Verification and Identification?
**Answer:**
- **Verification (1:1 matching)**: *"Is this person who they claim to be?"* (e.g., unlocking a phone).
- **Identification (1:N matching)**: *"Who is this person among all $N$ registered users?"* (implemented in this project).

---

### Q23: What is the purpose of collecting multiple face samples during registration?
**Answer:** Facial appearance varies with subtle angle changes, facial expressions, and lighting. Enrolling 3 to 10 samples per person creates a richer prototype representation, boosting recognition accuracy.

---

### Q24: What is ONNX and why is it used?
**Answer:** **ONNX** (Open Neural Network Exchange) is an open format for representing deep learning models. It enables models trained in PyTorch or TensorFlow to run via optimized inference engines like OpenCV DNN or ONNX Runtime across different hardware architectures.

---

### Q25: Can this system be spoofed by a photograph?
**Answer:** Standard RGB appearance models without active infrared depth sensors (like Apple FaceID) can theoretically be vulnerable to 2D photo replay. Real-world anti-spoofing typically employs passive liveness detection (blink detection, micro-texture analysis) or structured light sensors.

---

### Q26: How is CORS handled between frontend and backend?
**Answer:** FastAPI's `CORSMiddleware` is configured to allow cross-origin requests from `http://localhost:5173` and `http://127.0.0.1:5173` with full HTTP method support (`GET`, `POST`, `PUT`, `DELETE`).

---

### Q27: How does the frontend video overlay maintain accurate coordinates?
**Answer:** The frontend computes dynamic scale ratios:
$$	ext{scaleX} = rac{	ext{canvasWidth}}{	ext{videoWidth}}, \quad 	ext{scaleY} = rac{	ext{canvasHeight}}{	ext{videoHeight}}$$
Coordinates returned by the backend are multiplied by these scaling factors to render bounding boxes accurately on different screen sizes.

---

### Q28: What database indices were created and why?
**Answer:** Indices were created on `User.name`, `User.identifier`, `FaceEmbedding.user_id`, and `RecognitionLog.timestamp` to ensure sub-millisecond retrieval speeds during high-frequency live recognition.

---

### Q29: What are the main limitations of the current system?
**Answer:**
1. Significant facial occlusion (e.g. heavy sunglasses or masks) reduces feature extraction fidelity.
2. Extreme lighting conditions (pitch black or intense glare) degrade image quality.
3. 2D RGB camera cannot guarantee hardware-level liveness verification.

---

### Q30: How would you scale this system to 100,000 users?
**Answer:**
For 100,000+ users, brute-force linear search ($O(N)$) would introduce latency. We would introduce an **Approximate Nearest Neighbor (ANN)** vector database index (such as **FAISS**, **HNSW**, or **Milvus**) which reduces search complexity to $O(\log N)$, allowing sub-10ms matching across millions of embeddings.
