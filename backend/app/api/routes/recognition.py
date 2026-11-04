from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.recognition_log import RecognitionLog
from app.schemas.recognition_schema import FrameRecognitionRequest, FrameRecognitionResponse, RecognitionLogResponse
from app.services.recognition_service import RecognitionService

router = APIRouter(prefix='/recognition', tags=['Live Recognition'])

@router.post('/frame', response_model=FrameRecognitionResponse)
def recognize_frame(request: FrameRecognitionRequest, db: Session = Depends(get_db)):
    service = RecognitionService(db)
    try:
        return service.process_frame(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Inference error: {str(e)}')

@router.get('/history', response_model=List[RecognitionLogResponse])
def get_recognition_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    status_filter: Optional[str] = Query(None, alias='status'),
    db: Session = Depends(get_db)
):
    query = db.query(RecognitionLog)
    if status_filter in ['recognized', 'unknown']:
        query = query.filter(RecognitionLog.recognition_status == status_filter)
    logs = query.order_by(RecognitionLog.timestamp.desc()).offset(offset).limit(limit).all()
    return logs

@router.delete('/history')
def clear_recognition_history(db: Session = Depends(get_db)):
    deleted_count = db.query(RecognitionLog).delete()
    db.commit()
    return {'message': f'Cleared {deleted_count} recognition log entries.'}
