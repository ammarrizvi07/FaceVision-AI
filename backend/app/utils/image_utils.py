import base64
import cv2
import numpy as np

def base64_to_cv2(base64_str: str) -> np.ndarray:
    if ',' in base64_str:
        base64_str = base64_str.split(',', 1)[1]
    img_data = base64.b64decode(base64_str)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError('Invalid image data or corrupted format')
    return img

def cv2_to_base64(img: np.ndarray, format: str = '.jpg') -> str:
    success, buffer = cv2.imencode(format, img)
    if not success:
        raise ValueError('Could not encode image to base64')
    b64_str = base64.b64encode(buffer).decode('utf-8')
    mime = 'image/jpeg' if format in ['.jpg', '.jpeg'] else 'image/png'
    return f'data:{mime};base64,{b64_str}'

def evaluate_image_quality(img: np.ndarray) -> dict:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(np.mean(gray))
    h, w = gray.shape
    
    is_blurry = laplacian_var < 30.0
    is_too_dark = brightness < 25.0
    is_too_bright = brightness > 235.0
    
    return {
        'laplacian_var': laplacian_var,
        'brightness': brightness,
        'width': w,
        'height': h,
        'is_blurry': is_blurry,
        'is_too_dark': is_too_dark,
        'is_too_bright': is_too_bright,
        'is_acceptable': not (is_blurry or is_too_dark or is_too_bright)
    }
