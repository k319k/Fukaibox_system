"""
封解Box Backend - Point Schemas
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

from app.models.point import PointAction


class PointAdjust(BaseModel):
    """点数調整リクエスト（Public API）."""
    uid: str
    points: int  # 変動量（+ or -）
    reason: Optional[str] = None


class PointResponse(BaseModel):
    """点数照会レスポンス."""
    uid: str
    username: str
    points: int
    rank: int


class PointHistoryResponse(BaseModel):
    """点数履歴レスポンス."""
    id: str
    action: PointAction
    points_change: int
    points_after: int
    reason: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class RankingEntry(BaseModel):
    """ランキングエントリー."""
    rank: int
    uid: str
    username: str
    display_name: Optional[str] = None
    points: int


class RankingResponse(BaseModel):
    """ランキングレスポンス."""
    rankings: List[RankingEntry]
    total: int


class BaseRewardSetting(BaseModel):
    """基本報酬設定."""
    image_adopted_points: int = 10
    bonus_multiplier: float = 1.0
