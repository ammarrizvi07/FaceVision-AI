from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int

class DetectedFaceResult(BaseModel):
    bounding_box: BoundingBox
    name: str
    user_id: Optional[int] = None
    similarity: float
    status: str  # 'recognized' or 'unknown'
    quality: float
    landmarks: Optional[List[List[int]]] = None

class FrameRecognitionRequest(BaseModel):
    frame: str = Field(..., description='Base64 encoded JPEG or PNG image')
    threshold: Optional[float] = Field(None, ge=0.1, le=0.9, description='Custom cosine similarity threshold')

class FrameRecognitionResponse(BaseModel):
    faces: List[DetectedFaceResult]
    faces_detected: int
    processing_time_ms: float
    timestamp: str

class RecognitionLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    recognized_name: str
    recognition_status: str
    similarity_score: Optional[float]
    latency_ms: float
    timestamp: datetime

    model_config = {'from_attributes': True}
