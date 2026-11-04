from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.setting import AppSetting
from app.schemas.setting_schema import SystemSettings
from app.config import settings

router = APIRouter(prefix='/settings', tags=['Configuration'])

@router.get('', response_model=SystemSettings)
def get_settings(db: Session = Depends(get_db)):
    settings_records = db.query(AppSetting).all()
    settings_dict = {s.key: s.value for s in settings_records}
    
    return SystemSettings(
        similarity_threshold=float(settings_dict.get('similarity_threshold', settings.DEFAULT_COSINE_THRESHOLD)),
        detection_confidence=float(settings_dict.get('detection_confidence', settings.DEFAULT_DETECTION_CONFIDENCE)),
        frame_rate_limit=int(settings_dict.get('frame_rate_limit', 10)),
        save_unknown_faces=settings_dict.get('save_unknown_faces', 'false').lower() == 'true',
        retention_days=int(settings_dict.get('retention_days', 30)),
        camera_device_index=int(settings_dict.get('camera_device_index', 0))
    )

@router.put('', response_model=SystemSettings)
def update_settings(payload: SystemSettings, db: Session = Depends(get_db)):
    updates = {
        'similarity_threshold': str(payload.similarity_threshold),
        'detection_confidence': str(payload.detection_confidence),
        'frame_rate_limit': str(payload.frame_rate_limit),
        'save_unknown_faces': str(payload.save_unknown_faces).lower(),
        'retention_days': str(payload.retention_days),
        'camera_device_index': str(payload.camera_device_index)
    }

    for key, val in updates.items():
        record = db.query(AppSetting).filter(AppSetting.key == key).first()
        if record:
            record.value = val
        else:
            db.add(AppSetting(key=key, value=val))

    db.commit()
    return payload
