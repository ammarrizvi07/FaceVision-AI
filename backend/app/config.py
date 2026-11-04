import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data'
MODELS_DIR = DATA_DIR / 'models'
DB_DIR = DATA_DIR / 'database'
REGISTERED_FACES_DIR = DATA_DIR / 'registered_faces'
EMBEDDINGS_DIR = DATA_DIR / 'embeddings'

for d in [DATA_DIR, MODELS_DIR, DB_DIR, REGISTERED_FACES_DIR, EMBEDDINGS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

class Settings:
    PROJECT_NAME: str = 'FaceVision AI'
    VERSION: str = '1.0.0'
    API_V1_STR: str = '/api'
    DATABASE_URL: str = os.getenv('DATABASE_URL', f'sqlite:///{DB_DIR}/facevision.db')
    
    # Model configuration
    YUNET_MODEL_PATH: Path = MODELS_DIR / 'face_detection_yunet_2023mar.onnx'
    SFACE_MODEL_PATH: Path = MODELS_DIR / 'face_recognition_sface_2021dec.onnx'
    
    # Default Recognition Parameters
    DEFAULT_DETECTION_CONFIDENCE: float = 0.80
    DEFAULT_COSINE_THRESHOLD: float = 0.363  # Calibrated for OpenCV SFace cosine similarity
    DEFAULT_MAX_FACES_PER_FRAME: int = 10
    
    # Preprocessing quality thresholds
    MIN_FACE_SIZE: int = 40
    MIN_LAPLACIAN_VARIANCE: float = 35.0  # Blur detection threshold
    MIN_BRIGHTNESS: float = 30.0
    MAX_BRIGHTNESS: float = 230.0

settings = Settings()
