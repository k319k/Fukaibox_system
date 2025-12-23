"""
Public API - Write Endpoints

Points modification endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.database import get_db
from app.models.user import User
from app.models.point import PointHistory
from app.utils.api_auth import verify_api_key
from .schemas import PointsModifyRequest

router = APIRouter()


@router.post("/points/{user_id}/add")
async def add_user_points(
    user_id: int,
    request: PointsModifyRequest,
    api_key_info: dict = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Add points to a user's account.
    Requires valid API key with write_points permission.
    """
    # Verify write permission
    if not api_key_info["permissions"].get("write_points", False):
        raise HTTPException(
            status_code=403,
            detail="API key does not have write_points permission"
        )
    
    # Get user
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update points
    new_points = user.points + request.amount
    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(points=new_points)
    )
    
    # Record history
    history = PointHistory(
        user_id=user_id,
        points_change=request.amount,
        reason=f"API: {request.reason} (by {api_key_info['username']})"
    )
    db.add(history)
    await db.commit()
    
    return {
        "message": "Points added successfully",
        "user_id": user_id,
        "old_points": user.points,
        "points_added": request.amount,
        "new_points": new_points
    }


@router.post("/points/{user_id}/set")
async def set_user_points(
    user_id: int,
    request: PointsModifyRequest,
    api_key_info: dict = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Set a user's points to a specific value.
    Requires valid API key with write_points permission.
    """
    # Verify write permission
    if not api_key_info["permissions"].get("write_points", False):
        raise HTTPException(
            status_code=403,
            detail="API key does not have write_points permission"
        )
    
    # Get user
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    old_points = user.points
    points_change = request.amount - old_points
    
    # Update points
    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(points=request.amount)
    )
    
    # Record history
    history = PointHistory(
        user_id=user_id,
        points_change=points_change,
        reason=f"API SET: {request.reason} (by {api_key_info['username']})"
    )
    db.add(history)
    await db.commit()
    
    return {
        "message": "Points set successfully",
        "user_id": user_id,
        "old_points": old_points,
        "new_points": request.amount,
        "change": points_change
    }
