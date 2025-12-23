"""
封解Box Backend - ScriptSection Model
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class ScriptSection(Base):
    """台本セクションモデル."""
    __tablename__ = "script_sections"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sheet_id = Column(String(36), ForeignKey("sheets.id", ondelete="CASCADE"), nullable=False, index=True)
    order = Column(Integer, nullable=False, index=True)  # Display order (0-indexed)
    title = Column(String(200), nullable=True)  # Section title (optional)
    content = Column(Text, nullable=False, default="")  # Script content for this section
    
    # Image management
    image_instructions = Column(Text, nullable=True)  # 画像指示
    reference_image_urls = Column(JSON, nullable=True)  # List of reference image URLs
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sheet = relationship("Sheet", back_populates="sections")
    images = relationship("Image", back_populates="section", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ScriptSection(id={self.id}, sheet_id={self.sheet_id}, order={self.order})>"
