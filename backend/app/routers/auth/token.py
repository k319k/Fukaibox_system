"""
封解Box Backend - Auth Token Management

Token refresh and user info endpoints
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, TokenResponse
from app.middleware.auth import get_current_user
from .utils import create_access_token

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """ログインユーザー情報取得."""
    return current_user


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """リフレッシュトークンで新しいアクセストークンを取得.
    
    既存のトークンを使用して新しいトークンを発行します。
    ブロックされたユーザーは拒否されます。
    """
    # Check if user is blocked
    if current_user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked"
        )
    
    # Update last login
    current_user.last_login_at = datetime.utcnow()
    await db.commit()
    
    # Generate new access token
    access_token = create_access_token({"sub": current_user.id})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer"
    )
