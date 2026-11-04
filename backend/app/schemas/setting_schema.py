from typing import Optional, Dict, Any
from pydantic import BaseModel

class SystemSettings(BaseModel):
    similarity_threshold: float = 0.363
    detection_confidence: float = 0.80
    frame_rate_limit: int = 10
    save_unknown_faces: bool = False
    retention_days: int = 30
    camera_device_index: int = 0
