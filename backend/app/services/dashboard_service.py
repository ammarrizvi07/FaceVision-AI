from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.recognition_log import RecognitionLog
from app.ml.model_loader import get_model_manager

class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_stats(self):
        total_users = self.db.query(func.count(User.id)).scalar() or 0
        total_logs = self.db.query(func.count(RecognitionLog.id)).scalar() or 0
        known_count = self.db.query(func.count(RecognitionLog.id)).filter(RecognitionLog.recognition_status == 'recognized').scalar() or 0
        unknown_count = self.db.query(func.count(RecognitionLog.id)).filter(RecognitionLog.recognition_status == 'unknown').scalar() or 0
        
        avg_latency = self.db.query(func.avg(RecognitionLog.latency_ms)).scalar() or 0.0

        model_mgr = get_model_manager()
        model_ready = model_mgr.initialized

        known_pct = round((known_count / total_logs * 100), 1) if total_logs > 0 else 0.0

        return {
            'total_registered_users': total_users,
            'total_recognition_events': total_logs,
            'known_recognitions': known_count,
            'unknown_recognitions': unknown_count,
            'match_accuracy_rate': known_pct,
            'average_latency_ms': round(float(avg_latency), 1),
            'model_status': 'Ready' if model_ready else 'Loading',
            'detector_name': 'YuNet (OpenCV CNN)',
            'recognizer_name': 'SFace (OpenCV Deep Embedding)'
        }

    def get_trends(self):
        today = datetime.utcnow().date()
        days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
        
        trends = []
        for d in days:
            start_dt = datetime(d.year, d.month, d.day, 0, 0, 0)
            end_dt = datetime(d.year, d.month, d.day, 23, 59, 59)
            
            known = self.db.query(func.count(RecognitionLog.id)).filter(
                RecognitionLog.timestamp >= start_dt,
                RecognitionLog.timestamp <= end_dt,
                RecognitionLog.recognition_status == 'recognized'
            ).scalar() or 0

            unknown = self.db.query(func.count(RecognitionLog.id)).filter(
                RecognitionLog.timestamp >= start_dt,
                RecognitionLog.timestamp <= end_dt,
                RecognitionLog.recognition_status == 'unknown'
            ).scalar() or 0

            trends.append({
                'date': d.strftime('%b %d'),
                'known': known,
                'unknown': unknown,
                'total': known + unknown
            })

        return trends
