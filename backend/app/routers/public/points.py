"""
封解Box Backend - Public Points API Router (X-API-KEY認証)
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.user import User
from app.models.point import PointHistory, PointAction
from app.schemas.point import PointAdjust, PointResponse, RankingEntry, RankingResponse, BaseRewardSetting
from app.middleware.api_key import verify_api_key
from app.services.firebase_sync import sync_user_points_to_firebase

router = APIRouter()

# Global settings (in production, store in DB)
_base_reward_settings = BaseRewardSetting()


@router.get("/points/{uid}", response_model=PointResponse)
async def get_points(
    uid: str,
    db: AsyncSession = Depends(get_db)
):
    """点数・ランク照会（認証不要）."""
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Calculate rank
    rank_result = await db.execute(
        select(func.count())
        .select_from(User)
        .where(User.points > user.points)
        .where(User.is_active == True)
    )
    rank = (rank_result.scalar() or 0) + 1
    
    return PointResponse(
        uid=user.id,
        username=user.display_name or user.username,
        points=user.points,
        rank=rank
    )


@router.post("/points/adjust", response_model=PointResponse)
async def adjust_points(
    data: PointAdjust,
    api_key: str = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """点数増減 (X-API-KEY認証、Server DB記録後Sync)."""
    result = await db.execute(select(User).where(User.id == data.uid))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Update points
    user.points += data.points
    if user.points < 0:
        user.points = 0  # Prevent negative points
    
    # Record history
    history = PointHistory(
        user_id=user.id,
        action=PointAction.MANUAL_ADJUST,
        points_change=data.points,
        points_after=user.points,
        reason=data.reason,
    )
    db.add(history)
    
    await db.commit()
    await db.refresh(user)
    
    # Sync to Firebase
    await sync_user_points_to_firebase(user)
    
    # Calculate rank
    rank_result = await db.execute(
        select(func.count())
        .select_from(User)
        .where(User.points > user.points)
        .where(User.is_active == True)
    )
    rank = (rank_result.scalar() or 0) + 1
    
    return PointResponse(
        uid=user.id,
        username=user.display_name or user.username,
        points=user.points,
        rank=rank
    )


@router.put("/points", response_model=BaseRewardSetting)
async def update_base_reward(
    settings: BaseRewardSetting,
    api_key: str = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """基本報酬点数の設定変更 (X-API-KEY認証)."""
    global _base_reward_settings
    _base_reward_settings = settings
    return _base_reward_settings


@router.get("/users/list", response_model=RankingResponse)
async def list_users_ranking(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """ランキング取得（認証不要）."""
    # Count total
    count_result = await db.execute(
        select(func.count()).select_from(User).where(User.is_active == True)
    )
    total = count_result.scalar()
    
    # Get ranking
    result = await db.execute(
        select(User)
        .where(User.is_active == True)
        .where(User.is_blocked == False)
        .order_by(User.points.desc())
        .offset(offset)
        .limit(limit)
    )
    users = result.scalars().all()
    
    rankings = [
        RankingEntry(
            rank=offset + i + 1,
            uid=user.id,
            username=user.username,
            display_name=user.display_name,
            points=user.points
        )
        for i, user in enumerate(users)
    ]
    
    return RankingResponse(rankings=rankings, total=total)


@router.get("/health")
async def api_health():
    """API alive エンドポイント."""
    return {"status": "ok", "api": "fukaibox-public-points", "version": "1.0.0"}
