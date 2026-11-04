from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    identifier = Column(String(50), unique=True, nullable=True, index=True)
    consent_given = Column(Integer, default=1, nullable=False) # 1 = Yes
    consent_version = Column(String(20), default='v1.0')
    consent_timestamp = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    embeddings = relationship('FaceEmbedding', back_populates='user', cascade='all, delete-orphan')
    logs = relationship('RecognitionLog', back_populates='user')
