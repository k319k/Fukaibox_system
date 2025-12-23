from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import uuid


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    discord_id = Column(String, unique=True, nullable=True, index=True)
    discord_username = Column(String, nullable=True)
    is_gicho = Column(Boolean, default=False)
    is_blocked = Column(Boolean, default=False)
    block_reason = Column(Text, nullable=True)
    points = Column(Integer, default=0)
    can_manage_api_keys = Column(Boolean, default=False)  # New field
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    sheets = relationship("Sheet", back_populates="creator")
    uploaded_images = relationship("Image", back_populates="uploader")
    point_history = relationship("PointHistory", back_populates="user")
    api_keys = relationship("APIKey", back_populates="user", cascade="all, delete-orphan")  # New relationship


class Sheet(Base):
    __tablename__ = "sheets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_giin_only = Column(Boolean, default=False)
    current_phase = Column(String, default="draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    creator = relationship("User", back_populates="sheets")
    sections = relationship("ScriptSection", back_populates="sheet", cascade="all, delete-orphan")
    images = relationship("Image", back_populates="sheet", cascade="all, delete-orphan")


class ScriptSection(Base):
    __tablename__ = "script_sections"

    id = Column(Integer, primary_key=True, index=True)
    sheet_id = Column(Integer, ForeignKey("sheets.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    image_instruction = Column(Text, nullable=True)
    reference_images = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    sheet = relationship("Sheet", back_populates="sections")


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    sheet_id = Column(Integer, ForeignKey("sheets.id"), nullable=False)
    section_id = Column(Integer, nullable=True)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_path = Column(String, nullable=False)
    original_file_path = Column(String, nullable=True)
    is_selected = Column(Boolean, default=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    sheet = relationship("Sheet", back_populates="images")
    uploader = relationship("User", back_populates="uploaded_images")


class PointHistory(Base):
    __tablename__ = "point_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    points_change = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="point_history")


class RewardSettings(Base):
    __tablename__ = "reward_settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String, unique=True, nullable=False)
    setting_value = Column(Integer, nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class APIKey(Base):
    """API Keys for accessing public FukaiBox APIs"""
    __tablename__ = "api_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    key_hash = Column(String(255), unique=True, nullable=False)
    key_prefix = Column(String(12), nullable=False)
    name = Column(String(100), nullable=False)
    permissions = Column(JSON, default={"read_points": True, "write_points": False})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="api_keys")
