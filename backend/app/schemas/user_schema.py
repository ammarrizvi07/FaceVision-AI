from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description='Full name of the user')
    identifier: Optional[str] = Field(None, max_length=50, description='Optional unique student/employee ID')
    notes: Optional[str] = None

class UserCreate(UserBase):
    consent_given: bool = Field(..., description='Explicit consent for biometric enrollment')
    consent_version: str = Field('v1.0', description='Version of consent agreement')
    face_samples: List[str] = Field(..., min_length=3, max_length=20, description='List of base64 encoded face images')

class UserResponse(UserBase):
    id: int
    consent_given: bool
    consent_version: str
    consent_timestamp: datetime
    created_at: datetime
    sample_count: int = 0

    model_config = {'from_attributes': True}
