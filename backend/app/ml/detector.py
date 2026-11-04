import cv2
import numpy as np
from typing import List, Dict, Any, Tuple
from app.ml.model_loader import get_model_manager
from app.config import settings

class FaceDetector:
    def __init__(self, confidence_threshold: float = None):
        self.model_mgr = get_model_manager()
        self.confidence_threshold = confidence_threshold or settings.DEFAULT_DETECTION_CONFIDENCE

    def detect_faces(self, image: np.ndarray) -> Tuple[np.ndarray, List[Dict[str, Any]]]:
        if image is None:
            return None, []
        
        h, w = image.shape[:2]
        self.model_mgr.detector.setInputSize((w, h))
        self.model_mgr.detector.setScoreThreshold(self.confidence_threshold)

        _, raw_faces = self.model_mgr.detector.detect(image)
        if raw_faces is None or len(raw_faces) == 0:
            return None, []

        parsed_faces = []
        for i, face_arr in enumerate(raw_faces):
            x, y, box_w, box_h = int(face_arr[0]), int(face_arr[1]), int(face_arr[2]), int(face_arr[3])
            score = float(face_arr[14])
            
            # Clamp coordinates to frame boundaries
            x = max(0, x)
            y = max(0, y)
            box_w = min(box_w, w - x)
            box_h = min(box_h, h - y)

            landmarks = [
                [int(face_arr[4]), int(face_arr[5])],    # Right eye
                [int(face_arr[6]), int(face_arr[7])],    # Left eye
                [int(face_arr[8]), int(face_arr[9])],    # Nose tip
                [int(face_arr[10]), int(face_arr[11])],  # Right mouth corner
                [int(face_arr[12]), int(face_arr[13])]   # Left mouth corner
            ]

            parsed_faces.append({
                'index': i,
                'bounding_box': {'x': x, 'y': y, 'width': box_w, 'height': box_h},
                'confidence': score,
                'landmarks': landmarks,
                'raw_face': face_arr
            })

        return raw_faces, parsed_faces
