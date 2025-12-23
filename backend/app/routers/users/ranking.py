"""
封解Box Backend - Users Ranking

User ranking and public user info endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.schemas.point import RankingEntry, RankingResponse

router = APIRouter()


@router.get("/ranking", response_model=RankingResponse)
async def get_user_ranking(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """ニックネーム形式の点数ランキング取得."""
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


@router.get("/list")
async def get_user_list(db: AsyncSession = Depends(get_db)):
    """全ユーザー一覧取得（名前順・点数順ソート用）."""
    result = await db.execute(
        select(User)
        .where(User.is_active == True)
        .where(User.is_blocked == False)
    )
    users = result.scalars().all()
    
    # Return user data with necessary fields
    return [
        {
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "points": user.points,
            "avatar_url": user.avatar_url,
            "profile_image_url": user.profile_image_url,
            "is_online": user.is_online,
            "is_gicho": user.is_gicho
        }
        for user in users
    ]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """特定ユーザー情報取得."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user
