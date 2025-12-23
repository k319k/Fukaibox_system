"""
封解Box Backend - Users Profile Management

Personal profile and settings endpoints
"""
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
import os
from pathlib import Path

from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserResponse, UserUpdate, ProfileUpdateRequest,
    AppearancePreferences, NotificationPreferences, SecuritySettings,
    LinkedAccountsResponse, PasswordChangeRequest
)
from app.middleware.auth import get_current_user

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.get("/me/profile", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    """現在のユーザーの詳細プロフィール取得."""
    return current_user


@router.put("/me/profile", response_model=UserResponse)
async def update_my_profile(
    update: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """プロフィール更新."""
    if update.username is not None:
        # Check username uniqueness
        result = await db.execute(
            select(User).where(User.username == update.username, User.id != current_user.id)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.username = update.username
    
    if update.display_name is not None:
        current_user.display_name = update.display_name
    
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/me/profile/image")
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """プロフィール画像アップロード."""
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Create profile images directory
    upload_dir = Path("uploads/profile_images")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{current_user.id}{file_ext}"
    file_path = upload_dir / filename
    
    # Save file
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Update user profile_image_url
    current_user.profile_image_url = f"/uploads/profile_images/{filename}"
    await db.commit()
    await db.refresh(current_user)
    
    return {"profile_image_url": current_user.profile_image_url}


@router.patch("/me", response_model=UserResponse)
async def update_current_user(
    update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """現在のユーザー情報更新."""
    if update.display_name is not None:
        current_user.display_name = update.display_name
    if update.avatar_url is not None:
        current_user.avatar_url = update.avatar_url
    
    await db.commit()
    await db.refresh(current_user)
    
    return current_user


@router.get("/me/preferences", response_model=Dict[str, Any])
async def get_appearance_preferences(
    current_user: User = Depends(get_current_user)
):
    """外観設定取得."""
    return current_user.appearance_preferences or {}


@router.put("/me/preferences", response_model=Dict[str, Any])
async def update_appearance_preferences(
    preferences: AppearancePreferences,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """外観設定更新."""
    current_user.appearance_preferences = preferences.model_dump(exclude_none=True)
    await db.commit()
    await db.refresh(current_user)
    return current_user.appearance_preferences


@router.get("/me/notifications", response_model=Dict[str, Any])
async def get_notification_preferences(
    current_user: User = Depends(get_current_user)
):
    """通知設定取得."""
    return current_user.notification_preferences or {
        "email": False,
        "browser": True,
        "upload": True,
        "adoption": True,
        "points": True
    }


@router.put("/me/notifications", response_model=Dict[str, Any])
async def update_notification_preferences(
    preferences: NotificationPreferences,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """通知設定更新."""
    current_user.notification_preferences = preferences.model_dump()
    await db.commit()
    await db.refresh(current_user)
    return current_user.notification_preferences


@router.get("/me/security", response_model=Dict[str, Any])
async def get_security_settings(
    current_user: User = Depends(get_current_user)
):
    """セキュリティ設定取得."""
    return current_user.security_settings or {"loginAlerts": True}


@router.put("/me/security", response_model=Dict[str, Any])
async def update_security_settings(
    settings: SecuritySettings,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """セキュリティ設定更新."""
    current_user.security_settings = settings.model_dump()
    await db.commit()
    await db.refresh(current_user)
    return current_user.security_settings


@router.get("/me/linked-accounts", response_model=LinkedAccountsResponse)
async def get_linked_accounts(
    current_user: User = Depends(get_current_user)
):
    """連携アカウント情報取得."""
    return LinkedAccountsResponse(
        discord_id=current_user.discord_id,
        google_id=current_user.google_id,
        has_password=bool(current_user.hashed_password)
    )


@router.post("/me/change-password")
async def change_password(
    request: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """パスワード変更 (非Discordユーザー用)."""
    # Verify current password if user already has one
    if current_user.hashed_password:
        if not request.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required"
            )
        if not pwd_context.verify(request.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
    
    # Set new password
    current_user.hashed_password = pwd_context.hash(request.new_password)
    await db.commit()
    
    return {"message": "Password changed successfully"}
