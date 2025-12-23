"""
封解Box Backend - Admin Router
"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User, UserRole
from app.models.api_key import ApiKey
from app.middleware.auth import get_current_user, require_gicho

router = APIRouter()


class ApiKeyCreate(BaseModel):
    """APIキー作成スキーマ."""
    name: str
    description: str = None


class ApiKeyResponse(BaseModel):
    """APIキーレスポンス."""
    id: str
    key: str  # Only shown once on creation
    name: str
    description: str = None
    is_active: bool
    created_at: datetime
    last_used_at: datetime = None


class ApiKeyListResponse(BaseModel):
    """APIキー一覧レスポンス（キー本体は非表示）."""
    id: str
    name: str
    description: str = None
    is_active: bool
    created_at: datetime
    last_used_at: datetime = None


class BlockUserRequest(BaseModel):
    """ユーザーブロックリクエスト."""
    block: bool = True
    reason: str = None


@router.get("/api-keys", response_model=List[ApiKeyListResponse])
async def list_api_keys(
    current_user: User = Depends(require_gicho),
    db: AsyncSession = Depends(get_db)
):
    """外部用APIキーの一覧管理."""
    result = await db.execute(select(ApiKey).order_by(ApiKey.created_at.desc()))
    keys = result.scalars().all()
    return [ApiKeyListResponse.model_validate(k.__dict__) for k in keys]


@router.post("/api-keys", response_model=ApiKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    data: ApiKeyCreate,
    current_user: User = Depends(require_gicho),
    db: AsyncSession = Depends(get_db)
):
    """外部用APIキーの発行."""
    api_key = ApiKey(
        name=data.name,
        description=data.description,
        created_by=current_user.id,
    )
    db.add(api_key)
    await db.commit()
    await db.refresh(api_key)
    
    return ApiKeyResponse(
        id=api_key.id,
        key=api_key.key,  # Only shown once
        name=api_key.name,
        description=api_key.description,
        is_active=api_key.is_active,
        created_at=api_key.created_at,
        last_used_at=api_key.last_used_at,
    )


@router.delete("/api-keys/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    key_id: str,
    current_user: User = Depends(require_gicho),
    db: AsyncSession = Depends(get_db)
):
    """APIキー無効化."""
    result = await db.execute(select(ApiKey).where(ApiKey.id == key_id))
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")
    
    api_key.is_active = False
    await db.commit()


@router.post("/users/{uid}/block")
async def block_user(
    uid: str,
    reason: str,
    current_user: User = Depends(require_gicho),
    db: AsyncSession = Depends(get_db)
):
    """ユーザーをブロック（儀長のみ）"""
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user.role == UserRole.GICHO:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot block Gicho")
    
    user.is_blocked = True
    user.blocked_at = datetime.utcnow()
    user.blocked_by = current_user.id
    user.block_reason = reason
    
    await db.commit()
    await db.refresh(user)
    
    return {
        "success": True,
        "message": "User blocked successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "is_blocked": user.is_blocked,
            "blocked_at": user.blocked_at,
            "block_reason": user.block_reason
        }
    }


@router.post("/users/{uid}/unblock")
async def unblock_user(
    uid: str,
    current_user: User = Depends(require_gicho),
    db: AsyncSession = Depends(get_db)
):
    """ユーザーのブロックを解除（儀長のみ）"""
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.is_blocked = False
    user.blocked_at = None
    user.blocked_by = None
    user.block_reason = None
    
    await db.commit()
    await db.refresh(user)
    
    return {
        "success": True,
        "message": "User unblocked successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "is_blocked": user.is_blocked
        }
    }


@router.get("/users/blocked")
async def get_blocked_users(
    current_user: User = Depends(require_gicho),
    db: AsyncSession = Depends(get_db)
):
    """ブロックされたユーザー一覧取得（儀長のみ）"""
    result = await db.execute(
        select(User)
        .where(User.is_blocked == True)
        .order_by(User.blocked_at.desc())
    )
    users = result.scalars().all()
    
    return [
        {
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "blocked_at": user.blocked_at,
            "blocked_by": user.blocked_by,
            "block_reason": user.block_reason
        }
        for user in users
    ]
