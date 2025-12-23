"""
封解Box Backend - User Model
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    """ユーザーロール."""
    GIIN = "giin"           # 儀員（一般メンバー）
    GICHO = "gicho"         # 儀長（管理者）
    GUEST = "guest"         # ゲスト


class User(Base):
    """ユーザーモデル."""
    __tablename__ = "users"
    
    id = Column(String(64), primary_key=True)  # Discord ID or FukaiBox ID
    discord_id = Column(String(64), unique=True, nullable=True, index=True)
    username = Column(String(100), nullable=False)
    display_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    email = Column(String(255), nullable=True)
    
    # Personal Settings
    profile_image_url = Column(Text, nullable=True)  # Custom profile image (separate from Discord avatar)
    google_id = Column(String(64), unique=True, nullable=True, index=True)  # Google OAuth ID
    hashed_password = Column(String(255), nullable=True)  # For non-Discord users
    appearance_preferences = Column(JSONB, default={}, nullable=False)  # Theme, color, language, fontSize
    notification_preferences = Column(JSONB, default={"email": False, "browser": True, "upload": True, "adoption": True, "points": True}, nullable=False)
    security_settings = Column(JSONB, default={"loginAlerts": True}, nullable=False)
    
    role = Column(SQLEnum(UserRole), default=UserRole.GIIN, nullable=False)
    points = Column(Integer, default=0, nullable=False)
    
    is_blocked = Column(Boolean, default=False, nullable=False)
    blocked_at = Column(DateTime, nullable=True)
    blocked_by = Column(String(64), nullable=True)  # User ID of Gicho who blocked
    block_reason = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)
    last_seen = Column(DateTime, nullable=True)  # For online status tracking
    
    @property
    def is_online(self) -> bool:
        """ユーザーがオンラインかどうかを判定（last_seenが120秒以内）."""
        if not self.last_seen:
            return False
        return (datetime.utcnow() - self.last_seen).total_seconds() < 120
    
    # Relationships
    sheets = relationship("Sheet", back_populates="creator", foreign_keys="Sheet.creator_id")
    images = relationship("Image", back_populates="uploader", foreign_keys="Image.uploader_id")
    point_history = relationship("PointHistory", back_populates="user")
