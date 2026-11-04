import time
from datetime import datetime
import numpy as np
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.face_embedding import FaceEmbedding
from app.models.recognition_log import RecognitionLog
from app.models.setting import AppSetting
from app.schemas.recognition_schema import FrameRecognitionRequest, FrameRecognitionResponse, DetectedFaceResult, BoundingBox
from app.utils.image_utils import base64_to_cv2
from app.ml.detector import FaceDetector
from app.ml.preprocessing import FacePreprocessor
from app.ml.embeddings import FeatureExtractor
from app.ml.recognizer import FaceRecognizer
from app.config import settings

class RecognitionService:
    def __init__(self, db: Session):
        self.db = db
        self.detector = FaceDetector()
        self.extractor = FeatureExtractor()
        self.recognizer = FaceRecognizer()

    def _get_active_threshold(self) -> float:
        setting = self.db.query(AppSetting).filter(AppSetting.key == 'similarity_threshold').first()
        if setting:
            try:
                return float(setting.value)
            except ValueError:
                pass
        return settings.DEFAULT_COSINE_THRESHOLD

    def _get_enrolled_users(self):
        users = self.db.query(User).all()
        enrolled = []
        for u in users:
            embs = [FeatureExtractor.deserialize_embedding(e.embedding_data) for e in u.embeddings]
            if embs:
                enrolled.append({
                    'id': u.id,
                    'name': u.name,
                    'embeddings': embs
                })
        return enrolled

    def process_frame(self, request: FrameRecognitionRequest) -> FrameRecognitionResponse:
        start_time = time.perf_counter()
        
        img = base64_to_cv2(request.frame)
        threshold = request.threshold or self._get_active_threshold()
        
        raw_faces, parsed_faces = self.detector.detect_faces(img)
        detected_results = []
        
        if parsed_faces:
            enrolled = self._get_enrolled_users()

            for face in parsed_faces:
                bbox = face['bounding_box']
                raw_face = face['raw_face']
                landmarks = face['landmarks']

                aligned = FacePreprocessor.align_and_crop(img, raw_face)
                embedding = self.extractor.extract_feature(aligned)
                match_result = self.recognizer.identify_face(embedding, enrolled, custom_threshold=threshold)

                q_info = FacePreprocessor.check_quality(img, bbox)
                quality_val = float(q_info.get('laplacian_var', 50.0))

                face_res = DetectedFaceResult(
                    bounding_box=BoundingBox(**bbox),
                    name=match_result['name'],
                    user_id=match_result['user_id'],
                    similarity=match_result['similarity'],
                    status=match_result['status'],
                    quality=quality_val,
                    landmarks=landmarks
                )
                detected_results.append(face_res)

                log = RecognitionLog(
                    user_id=match_result['user_id'],
                    recognized_name=match_result['name'],
                    recognition_status=match_result['status'],
                    similarity_score=match_result['similarity'],
                    latency_ms=round((time.perf_counter() - start_time) * 1000, 2),
                    timestamp=datetime.utcnow()
                )
                self.db.add(log)

            self.db.commit()

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return FrameRecognitionResponse(
            faces=detected_results,
            faces_detected=len(detected_results),
            processing_time_ms=elapsed_ms,
            timestamp=datetime.utcnow().isoformat()
        )
