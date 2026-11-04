import numpy as np
import cv2
from app.ml.model_loader import get_model_manager

class FeatureExtractor:
    def __init__(self):
        self.mgr = get_model_manager()

    def extract_feature(self, aligned_face: np.ndarray) -> np.ndarray:
        # SFace extracts 128-d L2-normalized deep embedding
        feature = self.mgr.recognizer.feature(aligned_face)
        # Ensure 1D flattened float32 vector
        feature = feature.flatten().astype(np.float32)
        norm = np.linalg.norm(feature)
        if norm > 0:
            feature = feature / norm
        return feature

    @staticmethod
    def serialize_embedding(embedding: np.ndarray) -> bytes:
        return embedding.tobytes()

    @staticmethod
    def deserialize_embedding(data: bytes) -> np.ndarray:
        return np.frombuffer(data, dtype=np.float32)
