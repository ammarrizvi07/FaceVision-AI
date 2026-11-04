from app.schemas.user_schema import UserCreate

def validate_registration(data: UserCreate):
    if not data.consent_given:
        raise ValueError('Biometric enrollment requires explicit user consent')
    if not data.name or len(data.name.strip()) < 2:
        raise ValueError('User name must be at least 2 characters long')
    if not data.face_samples or len(data.face_samples) < 3:
        raise ValueError('Please provide at least 3 distinct face samples for robust enrollment')
