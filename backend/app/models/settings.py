"""
封解Box Backend - Reward Settings Model
報酬設定のDBモデル（投稿点、採用点など）
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Text
import uuid

from app.database import Base


class RewardSettings(Base):
    """報酬設定モデル（シングルトン想定）."""
    __tablename__ = "reward_settings"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # 点数設定
    upload_points = Column(Integer, default=5, nullable=False)  # 画像投稿時の点数
    adoption_points = Column(Integer, default=20, nullable=False)  # 画像採用時の追加点数
    bonus_multiplier = Column(Float, default=1.0, nullable=False)  # ボーナス倍率
    
    # メタ情報
    updated_by = Column(String(64), nullable=True)  # 最終更新者
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = Column(Text, nullable=True)  # 設定メモ
