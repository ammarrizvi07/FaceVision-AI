from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.ml.model_loader import get_model_manager
from app.models.user import User

router = APIRouter(prefix='/health', tags=['Health & Status'])

@router.get('')
def health_check(db: Session = Depends(get_db)):
    mgr = get_model_manager()
    user_count = db.query(User).count()
    return {
        'status': 'healthy',
        'model_loaded': mgr.initialized,
        'detector': 'YuNet (ONNX)',
        'recognizer': 'SFace (ONNX)',
        'registered_users': user_count
    }
