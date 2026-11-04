from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class RecognitionLog(Base):
    __tablename__ = 'recognition_logs'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    recognized_name = Column(String(100), nullable=False)
    recognition_status = Column(String(20), nullable=False) # 'recognized' or 'unknown'
    similarity_score = Column(Float, nullable=True)
    latency_ms = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship('User', back_populates='logs')
