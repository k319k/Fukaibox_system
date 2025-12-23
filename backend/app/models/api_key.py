"""
封解Box Backend - API Key Model
"""
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text
import uuid
import secrets

from app.database import Base


class ApiKey(Base):
    """外部APIキーモデル."""
    __tablename__ = "api_keys"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    key = Column(String(64), unique=True, nullable=False, index=True, 
                 default=lambda: secrets.token_urlsafe(32))
    name = Column(String(100), nullable=False)  # キー名（識別用）
    description = Column(Text, nullable=True)
    
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_by = Column(String(64), nullable=False)  # 発行者のユーザーID
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
