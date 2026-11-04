from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, LargeBinary, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class FaceEmbedding(Base):
    __tablename__ = 'face_embeddings'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    embedding_data = Column(LargeBinary, nullable=False) # serialized numpy vector
    model_version = Column(String(50), default='sface_2021dec')
    quality_score = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='embeddings')
