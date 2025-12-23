"""
封解Box Backend - Sheet Model
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
import uuid

from app.database import Base


class SheetPhase(str, enum.Enum):
    """シートフェーズ."""
    DRAFT = "draft"         # 下書き
    UPLOAD = "upload"       # 画像募集中
    SELECT = "select"       # 選考中
    COMPLETE = "complete"   # 完了
    ARCHIVED = "archived"   # アーカイブ済み


class Sheet(Base):
    """シート（台本）モデル."""
    __tablename__ = "sheets"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    script_content = Column(Text, nullable=True)  # 台本本文
    
    phase = Column(SQLEnum(SheetPhase), default=SheetPhase.DRAFT, nullable=False)
    is_giin_only = Column(Boolean, default=False, nullable=False)  # 儀員限定
    is_anonymous_allowed = Column(Boolean, default=False, nullable=False)  # 匿名投稿許可
    is_recruitment_closed = Column(Boolean, default=False, nullable=False)  # 募集停止
    
    # Section management
    sections_json = Column(Text, nullable=True)  # JSON array of sections
    
    creator_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = relationship("User", back_populates="sheets", foreign_keys=[creator_id])
    images = relationship("Image", back_populates="sheet", cascade="all, delete-orphan")
    sections = relationship("ScriptSection", back_populates="sheet", order_by="ScriptSection.order", cascade="all, delete-orphan")
