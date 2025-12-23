"""
封解Box Backend - Settings Router
報酬設定、ユーザー管理、ランキング
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.database import get_db
from app.models.settings import RewardSettings
from app.models.user import User, UserRole
from app.models.point import PointHistory, PointAction
from app.middleware.auth import get_current_user, require_gicho

router = APIRouter()


# === 報酬設定 ===

@router.get("/rewards")
async def get_reward_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """報酬設定取得"""
    result = await db.execute(select(RewardSettings).limit(1))
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = RewardSettings()
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    
    return settings


class RewardSettingsUpdate(BaseModel):
    """報酬設定更新リクエスト"""
    upload_points: int
    adoption_points: int


@router.put("/rewards")
async def update_reward_settings(
    request: RewardSettingsUpdate,
    current_user: User = Depends(require_gicho),
    db: AsyncSession = Depends(get_db)
):
    """報酬設定更新（儀長のみ）"""
    result = await db.execute(select(RewardSettings).limit(1))
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = RewardSettings()
        db.add(settings)
    
    settings.upload_points = request.upload_points
    settings.adoption_points = request.adoption_points
    
    await db.commit()
    await db.refresh(settings)
    
    return settings


# === 点数調整 ===

class PointAdjustRequest(BaseModel):
    """点数調整リクエスト"""
    points_change: int  # 正の数で加算、負の数で減算
    reason: str


@router.post("/users/{user_id}/points/adjust")
async def adjust_user_points(
    user_id: str,
    request: PointAdjustRequest,
    current_user: User = Depends(require_gicho),
    db: AsyncSession = Depends(get_db)
):
    """ユーザー点数調整（儀長のみ）"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # 点数更新
    user.points += request.points_change
    
    # 履歴記録
    history = PointHistory(
        user_id=user.id,
        action=PointAction.MANUAL_ADJUSTMENT,
        points_change=request.points_change,
        points_after=user.points,
        reason=request.reason,
        created_by=current_user.id,
    )
    db.add(history)
    
    await db.commit()
    await db.refresh(user)
    
    return {
        "user_id": user.id,
        "username": user.username,
        "display_name": user.display_name,
        "points": user.points,
        "points_change": request.points_change
    }


# === ランキング ===

@router.get("/users/ranking")
async def get_user_ranking(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """ユーザーランキング取得（点数順）"""
    result = await db.execute(
        select(User)
        .where(User.discord_id.isnot(None))  # Discord連携ユーザーのみ
        .order_by(User.points.desc())
        .limit(limit)
    )
    users = result.scalars().all()
    
    ranking = []
    for rank, user in enumerate(users, 1):
        ranking.append({
            "rank": rank,
            "user_id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "points": user.points,
            "is_gicho": user.role == UserRole.GICHO
        })
    
    return ranking


# === 点数履歴 ===

@router.get("/users/{user_id}/points/history")
async def get_point_history(
    user_id: str,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """点数履歴取得"""
    # 自分の履歴または儀長のみ閲覧可能
    if user_id != current_user.id and current_user.role != UserRole.GICHO:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    
    result = await db.execute(
        select(PointHistory)
        .where(PointHistory.user_id == user_id)
        .order_by(PointHistory.created_at.desc())
        .limit(limit)
    )
    history = result.scalars().all()
    
    return history
