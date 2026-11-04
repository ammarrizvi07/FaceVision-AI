from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix='/dashboard', tags=['Dashboard & Analytics'])

@router.get('/stats')
def get_dashboard_stats(db: Session = Depends(get_db)):
    service = DashboardService(db)
    return service.get_stats()

@router.get('/trends')
def get_dashboard_trends(db: Session = Depends(get_db)):
    service = DashboardService(db)
    return service.get_trends()
