import os
import urllib.request
import logging
import cv2
from pathlib import Path
from app.config import settings

logger = logging.getLogger(__name__)

class ModelManager:
    _instance = None
    
    def __init__(self):
        self.detector = None
        self.recognizer = None
        self.initialized = False
        self._ensure_models_exist()
        self._load_models()

    def _ensure_models_exist(self):
        models = {
            settings.YUNET_MODEL_PATH: 'https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx',
            settings.SFACE_MODEL_PATH: 'https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx'
        }
        for path, url in models.items():
            if not path.exists() or path.stat().st_size < 10000:
                logger.info(f'Downloading model {path.name} from {url}...')
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as resp, open(path, 'wb') as f:
                    f.write(resp.read())
                logger.info(f'Model downloaded: {path.name} ({path.stat().st_size} bytes)')

    def _load_models(self):
        try:
            logger.info('Initializing OpenCV YuNet Face Detector...')
            self.detector = cv2.FaceDetectorYN.create(
                model=str(settings.YUNET_MODEL_PATH),
                config='',
                input_size=(320, 320),
                score_threshold=settings.DEFAULT_DETECTION_CONFIDENCE,
                nms_threshold=0.3,
                top_k=settings.DEFAULT_MAX_FACES_PER_FRAME
            )
            
            logger.info('Initializing OpenCV SFace Face Recognizer...')
            self.recognizer = cv2.FaceRecognizerSF.create(
                model=str(settings.SFACE_MODEL_PATH),
                config=''
            )
            self.initialized = True
            logger.info('ML Models successfully initialized and loaded into CPU memory.')
        except Exception as e:
            logger.error(f'Error initializing ML models: {e}')
            raise e

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ModelManager()
        return cls._instance

def get_model_manager() -> ModelManager:
    return ModelManager.get_instance()
