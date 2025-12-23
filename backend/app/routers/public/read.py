"""
Public API - Read Endpoints

Points retrieval and ranking endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.utils.api_auth import verify_api_key
from .schemas import UserPointsResponse, RankingEntry, HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint (no authentication required).
    Use this to verify the API is alive.
    """
    return {
        "status": "ok",
        "message": "FukaiBox Public API is running",
        "timestamp": datetime.utcnow()
    }


@router.get("/points/{user_id}", response_model=UserPointsResponse)
async def get_user_points(
    user_id: int,
    api_key_info: dict = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Get points for a specific user.
    Requires valid API key with read_points permission.
    """
    # Verify read permission
    if not api_key_info["permissions"].get("read_points", False):
        raise HTTPException(
            status_code=403,
            detail="API key does not have read_points permission"
        )
    
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user_id": user.id,
        "username": user.username,
        "points": user.points,
        "is_gicho": user.is_gicho
    }


@router.get("/points/ranking", response_model=List[RankingEntry])
async def get_ranking(
    limit: int = 10,
    api_key_info: dict = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Get top users by points (ranking).
    Requires valid API key with read_points permission.
    """
    # Verify read permission
    if not api_key_info["permissions"].get("read_points", False):
        raise HTTPException(
            status_code=403,
            detail="API key does not have read_points permission"
        )
    
    result = await db.execute(
        select(User)
        .where(User.is_blocked == False)
        .order_by(User.points.desc())
        .limit(min(limit, 100))  # Max 100
    )
    users = result.scalars().all()
    
    return [
        {
            "rank": idx + 1,
            "user_id": user.id,
            "username": user.username,
            "points": user.points,
            "is_gicho": user.is_gicho
        }
        for idx, user in enumerate(users)
    ]
