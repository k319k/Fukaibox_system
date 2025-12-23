"""
封解Box Backend - Image Model
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
import uuid

from app.database import Base


class ImageStatus(str, enum.Enum):
    """画像ステータス."""
    PENDING = "pending"       # 保留中
    ADOPTED = "adopted"       # 採用
    REJECTED = "rejected"     # 不採用


class Image(Base):
    """画像モデル."""
    __tablename__ = "images"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=False)  # Resized 640x480
    original_file_path = Column(String(500), nullable=True)  # Original unresized
    thumbnail_path = Column(String(500), nullable=True)
    
    file_size = Column(Integer, nullable=True)
    width = Column(Integer, nullable=True)  # 640 after resize
    height = Column(Integer, nullable=True)  # 480 after resize
    mime_type = Column(String(50), nullable=True)
    
    status = Column(SQLEnum(ImageStatus), default=ImageStatus.PENDING, nullable=False)
    section_index = Column(Integer, nullable=True)  # 対応するセクション番号
    
    is_anonymous = Column(Boolean, default=False, nullable=False)
    comment = Column(Text, nullable=True)  # 投稿者コメント
    
    sheet_id = Column(String(36), ForeignKey("sheets.id"), nullable=False)
    uploader_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    section_id = Column(String(36), ForeignKey("script_sections.id", ondelete="SET NULL"), nullable=True, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    adopted_at = Column(DateTime, nullable=True)
    
    # Relationships
    sheet = relationship("Sheet", back_populates="images")
    uploader = relationship("User", back_populates="images", foreign_keys=[uploader_id])
    section = relationship("ScriptSection", back_populates="images")
