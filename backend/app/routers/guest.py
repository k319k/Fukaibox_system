"""
封解Box Backend - Guest Authentication Router
ゲストログイン（30日有効期限）
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt
import uuid

from app.config import settings
from app.database import get_db
from app.models.user import User, UserRole

router = APIRouter()

# ゲストアカウント有効期限
GUEST_EXPIRY_DAYS = 30


class GuestLoginRequest(BaseModel):
    """ゲストログインリクエスト."""
    username: str


class GuestLoginResponse(BaseModel):
    """ゲストログインレスポンス."""
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    expires_at: datetime


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """JWTアクセストークンを生成."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=GUEST_EXPIRY_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


@router.post("/guest", response_model=GuestLoginResponse)
async def guest_login(
    request: GuestLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    ゲストログイン.
    
    - ユーザー名のみで仮ID発行
    - 30日間有効
    - Discord連携で正式アカウント化可能
    """
    username = request.username.strip()
    
    if not username or len(username) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be at least 2 characters"
        )
    
    if len(username) > 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be 20 characters or less"
        )
    
    # 既存のゲストユーザー名チェック（重複許可だがユニーク推奨）
    # Note: ゲストは同じ名前で複数作成可能（一意性は保証しない）
    
    # 新規ゲストユーザー作成
    guest_id = f"guest_{uuid.uuid4().hex[:12]}"
    expires_at = datetime.utcnow() + timedelta(days=GUEST_EXPIRY_DAYS)
    
    user = User(
        id=guest_id,
        discord_id=None,
        username=username,
        display_name=username,
        role=UserRole.GUEST,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # JWT生成
    access_token = create_access_token(
        data={"sub": user.id, "type": "guest"},
        expires_delta=timedelta(days=GUEST_EXPIRY_DAYS)
    )
    
    return GuestLoginResponse(
        access_token=access_token,
        user_id=user.id,
        username=user.username,
        expires_at=expires_at
    )


@router.post("/guest/{guest_id}/link-discord")
async def link_discord_to_guest(
    guest_id: str,
    discord_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    ゲストアカウントをDiscordに連携して正式化.
    
    Note: 実際のOAuth2フローは別途実装が必要
    """
    result = await db.execute(select(User).where(User.id == guest_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest user not found"
        )
    
    if user.discord_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already linked to Discord"
        )
    
    # Discordリンク
    user.discord_id = discord_id
    user.role = UserRole.GIIN  # ゲストから儀員へ昇格
    
    await db.commit()
    await db.refresh(user)
    
    return {"success": True, "user_id": user.id, "role": user.role.value}
