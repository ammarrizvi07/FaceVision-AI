import time
import os
import cv2
import numpy as np
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.face_embedding import FaceEmbedding
from app.schemas.user_schema import UserCreate, UserResponse
from app.utils.image_utils import base64_to_cv2, evaluate_image_quality
from app.ml.detector import FaceDetector
from app.ml.preprocessing import FacePreprocessor
from app.ml.embeddings import FeatureExtractor
from app.config import settings

class RegistrationService:
    def __init__(self, db: Session):
        self.db = db
        self.detector = FaceDetector(confidence_threshold=0.75)
        self.extractor = FeatureExtractor()

    def register_user(self, payload: UserCreate) -> UserResponse:
        if not payload.consent_given:
            raise ValueError('Registration failed: Biometric consent is mandatory.')

        if not payload.face_samples or len(payload.face_samples) < 3:
            raise ValueError('At least 3 valid face samples are required for registration.')

        if payload.identifier:
            existing = self.db.query(User).filter(User.identifier == payload.identifier).first()
            if existing:
                raise ValueError(f'A user with identifier "{payload.identifier}" is already registered.')

        valid_embeddings = []
        quality_scores = []

        for idx, b64_img in enumerate(payload.face_samples):
            try:
                img = base64_to_cv2(b64_img)
            except Exception:
                continue

            raw_faces, parsed_faces = self.detector.detect_faces(img)
            if not parsed_faces:
                continue

            if len(parsed_faces) > 1:
                # Multiple faces in sample -> reject for enrollment integrity
                continue

            face = parsed_faces[0]
            quality = FacePreprocessor.check_quality(img, face['bounding_box'])
            if not quality['passed']:
                continue

            aligned_face = FacePreprocessor.align_and_crop(img, face['raw_face'])
            embedding = self.extractor.extract_feature(aligned_face)

            valid_embeddings.append(embedding)
            quality_scores.append(quality.get('laplacian_var', 50.0))

        if len(valid_embeddings) < 2:
            raise ValueError('Insufficient high-quality face samples detected. Please ensure good lighting and look directly at the camera.')

        new_user = User(
            name=payload.name.strip(),
            identifier=payload.identifier.strip() if payload.identifier else None,
            consent_given=1 if payload.consent_given else 0,
            consent_version=payload.consent_version,
            notes=payload.notes
        )
        self.db.add(new_user)
        self.db.flush()

        for emb, q_score in zip(valid_embeddings, quality_scores):
            emb_record = FaceEmbedding(
                user_id=new_user.id,
                embedding_data=FeatureExtractor.serialize_embedding(emb),
                model_version='sface_2021dec',
                quality_score=q_score
            )
            self.db.add(emb_record)

        self.db.commit()
        self.db.refresh(new_user)

        response = UserResponse.model_validate(new_user)
        response.sample_count = len(valid_embeddings)
        return response
