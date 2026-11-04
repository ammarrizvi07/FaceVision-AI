import cv2
import numpy as np
from app.config import settings

class FacePreprocessor:
    @staticmethod
    def align_and_crop(image: np.ndarray, raw_face: np.ndarray) -> np.ndarray:
        from app.ml.model_loader import get_model_manager
        mgr = get_model_manager()
        # SFace alignCrop warps face into standard 112x112 canonical frontal representation
        aligned = mgr.recognizer.alignCrop(image, raw_face)
        return aligned

    @staticmethod
    def check_quality(image: np.ndarray, bbox: dict) -> dict:
        x, y, w, h = bbox['x'], bbox['y'], bbox['width'], bbox['height']
        if w < settings.MIN_FACE_SIZE or h < settings.MIN_FACE_SIZE:
            return {'passed': False, 'reason': f'Face size ({w}x{h}) is too small'}

        face_roi = image[y:y+h, x:x+w]
        if face_roi.size == 0:
            return {'passed': False, 'reason': 'Invalid face crop'}

        gray_roi = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        lap_var = float(cv2.Laplacian(gray_roi, cv2.CV_64F).var())
        brightness = float(np.mean(gray_roi))

        if lap_var < settings.MIN_LAPLACIAN_VARIANCE:
            return {'passed': False, 'reason': f'Face image is blurry (clarity score: {lap_var:.1f})', 'laplacian_var': lap_var}
        if brightness < settings.MIN_BRIGHTNESS:
            return {'passed': False, 'reason': f'Lighting is too dark (brightness: {brightness:.1f})', 'brightness': brightness}
        if brightness > settings.MAX_BRIGHTNESS:
            return {'passed': False, 'reason': f'Lighting is overexposed (brightness: {brightness:.1f})', 'brightness': brightness}

        return {
            'passed': True,
            'laplacian_var': lap_var,
            'brightness': brightness,
            'reason': 'Quality check passed'
        }
