"""
封解Box Backend - Point History Model
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
import uuid

from app.database import Base


class PointAction(str, enum.Enum):
    """点数変動アクション."""
    IMAGE_ADOPTED = "image_adopted"       # 画像採用
    IMAGE_REJECTED = "image_rejected"     # 画像不採用（減点なし）
    MANUAL_ADJUST = "manual_adjust"       # 手動調整
    BASE_REWARD = "base_reward"           # 基本報酬
    PENALTY = "penalty"                   # ペナルティ
    BONUS = "bonus"                       # ボーナス


class PointHistory(Base):
    """点数履歴モデル."""
    __tablename__ = "point_history"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    action = Column(SQLEnum(PointAction), nullable=False)
    points_change = Column(Integer, nullable=False)  # 変動量（+ or -）
    points_after = Column(Integer, nullable=False)   # 変動後の総点数
    
    reason = Column(Text, nullable=True)
    related_image_id = Column(String(36), nullable=True)  # 関連画像ID
    related_sheet_id = Column(String(36), nullable=True)  # 関連シートID
    
    created_by = Column(String(64), nullable=True)  # 実行者ID（手動調整の場合）
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="point_history")
