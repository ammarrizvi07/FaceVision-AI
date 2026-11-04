# REST API Documentation

Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.

---

## Base URL
```
http://127.0.0.1:8000/api
```

---

## 1. System Health
### `GET /health`
Returns system status, active models, and total enrolled users.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "detector": "YuNet (ONNX)",
  "recognizer": "SFace (ONNX)",
  "registered_users": 3
}
```

---

## 2. User Management
### `POST /users/register`
Enrolls a new user with explicit biometric consent and facial sample images.

**Request Body:**
```json
{
  "name": "Syed Rizvi",
  "identifier": "CS-2026-081",
  "notes": "Project lead",
  "consent_given": true,
  "consent_version": "v1.0-explicit-opt-in",
  "face_samples": [
    "data:image/jpeg;base64,...",
    "data:image/jpeg;base64,...",
    "data:image/jpeg;base64,..."
  ]
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Syed Rizvi",
  "identifier": "CS-2026-081",
  "notes": "Project lead",
  "consent_given": true,
  "consent_version": "v1.0-explicit-opt-in",
  "consent_timestamp": "2026-10-28T11:20:00Z",
  "created_at": "2026-10-28T11:20:00Z",
  "sample_count": 5
}
```

### `GET /users`
Lists all enrolled users.

### `DELETE /users/{user_id}`
Permanently deletes a user and cascades deletion of all corresponding biometric embeddings.

---

## 3. Real-Time Recognition
### `POST /recognition/frame`
Processes a single base64 webcam frame and returns detected subjects.

**Request Body:**
```json
{
  "frame": "data:image/jpeg;base64,...",
  "threshold": 0.363
}
```

**Response (200 OK):**
```json
{
  "faces": [
    {
      "bounding_box": { "x": 140, "y": 90, "width": 180, "height": 220 },
      "name": "Syed Rizvi",
      "user_id": 1,
      "similarity": 0.8421,
      "status": "recognized",
      "quality": 84.5,
      "landmarks": [[185, 150], [245, 148], [215, 185], [190, 220], [240, 218]]
    }
  ],
  "faces_detected": 1,
  "processing_time_ms": 38.4,
  "timestamp": "2026-10-28T11:25:30.123456"
}
```
