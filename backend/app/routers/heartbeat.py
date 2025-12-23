"""
封解Box Backend - Heartbeat Router
ユーザーのオンラインステータス管理
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/heartbeat", tags=["heartbeat"])


@router.post("")
async def send_heartbeat(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    ハートビート送信 - ユーザーのlast_seenを更新
    
    クライアントから60秒ごとに送信され、ユーザーのオンラインステータスを更新する。
    """
    try:
        # Re-fetch the user to ensure we have a fresh instance attached to this session
        result = await db.execute(select(User).where(User.id == current_user.id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update last_seen to current time
        user.last_seen = datetime.utcnow()
        await db.commit()
        await db.refresh(user)
        
        return {
            "status": "ok",
            "last_seen": user.last_seen,
            "is_online": user.is_online
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update heartbeat: {str(e)}")
