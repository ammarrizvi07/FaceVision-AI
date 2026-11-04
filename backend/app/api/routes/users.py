from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserResponse
from app.services.registration_service import RegistrationService

router = APIRouter(prefix='/users', tags=['User Management'])

@router.post('/register', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    service = RegistrationService(db)
    try:
        return service.register_user(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Internal registration error: {str(e)}')

@router.get('', response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    res = []
    for u in users:
        ur = UserResponse.model_validate(u)
        ur.sample_count = len(u.embeddings)
        res.append(ur)
    return res

@router.get('/{user_id}', response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail='User not found')
    ur = UserResponse.model_validate(u)
    ur.sample_count = len(u.embeddings)
    return ur

@router.delete('/{user_id}', status_code=status.HTTP_200_OK)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail='User not found')
    db.delete(u)
    db.commit()
    return {'message': f'User {u.name} and all biometric embeddings successfully deleted.'}

