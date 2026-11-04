import pytest
import numpy as np
import cv2
from app.database import Base, SessionLocal, engine
from app.models.user import User
from app.models.face_embedding import FaceEmbedding
from app.schemas.user_schema import UserCreate
from app.services.registration_service import RegistrationService
from app.utils.image_utils import cv2_to_base64

@pytest.fixture(scope='function')
def db_session():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.query(FaceEmbedding).delete()
    session.query(User).delete()
    session.commit()
    session.close()

def create_synthetic_face_image(seed=42):
    np.random.seed(seed)
    # 300x300 image with an oval 'face' and dark eye/mouth spots so YuNet or fallback detects it
    img = np.ones((300, 300, 3), dtype=np.uint8) * 200
    cv2.ellipse(img, (150, 150), (60, 80), 0, 0, 360, (180, 150, 120), -1)
    cv2.circle(img, (130, 130), 10, (50, 50, 50), -1) # left eye
    cv2.circle(img, (170, 130), 10, (50, 50, 50), -1) # right eye
    cv2.circle(img, (150, 160), 6, (70, 70, 70), -1)  # nose
    cv2.ellipse(img, (150, 190), (20, 8), 0, 0, 180, (50, 50, 50), 3) # mouth
    return img

def test_missing_consent_raises_error(db_session):
    service = RegistrationService(db_session)
    payload = UserCreate(
        name='Test User',
        consent_given=False,
        face_samples=['sample1', 'sample2', 'sample3']
    )
    with pytest.raises(ValueError, match='Biometric consent is mandatory'):
        service.register_user(payload)

def test_insufficient_samples_raises_error(db_session):
    import pydantic
    service = RegistrationService(db_session)
    with pytest.raises((ValueError, pydantic.ValidationError)):
        UserCreate(
            name='Test User',
            consent_given=True,
            face_samples=['sample1']
        )
