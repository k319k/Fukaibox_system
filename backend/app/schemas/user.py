"""
封解Box Backend - User Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.user import UserRole


class UserBase(BaseModel):
    """ユーザー基本スキーマ."""
    username: str = Field(..., min_length=1, max_length=100)
    display_name: Optional[str] = Field(None, max_length=100)


class UserCreate(UserBase):
    """ユーザー作成スキーマ."""
    discord_id: Optional[str] = None
    avatar_url: Optional[str] = None
    email: Optional[str] = None


class UserUpdate(BaseModel):
    """ユーザー更新スキーマ."""
    display_name: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    """ユーザーレスポンススキーマ."""
    id: str
    discord_id: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole
    points: int
    is_blocked: bool
    created_at: datetime
    is_online: bool = False  # Computed from last_seen
    last_seen: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    """DB内ユーザースキーマ."""
    email: Optional[str] = None
    is_active: bool
    last_login_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """トークンレスポンス."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Personal Settings Schemas

class ProfileUpdateRequest(BaseModel):
    """プロフィール更新リクエスト."""
    username: Optional[str] = Field(None, min_length=1, max_length=100)
    display_name: Optional[str] = Field(None, max_length=100)


class AppearancePreferences(BaseModel):
    """外観設定."""
    theme: Optional[str] = Field("light", pattern="^(light|dark|auto)$")  # light, dark, auto
    color: Optional[str] = Field("#1890ff", pattern="^#[0-9A-Fa-f]{6}$")  # Primary color
    language: Optional[str] = Field("ja", pattern="^(ja|en)$")  # ja, en
    fontSize: Optional[int] = Field(14, ge=12, le=20)  # 12-20px


class NotificationPreferences(BaseModel):
    """通知設定."""
    email: bool = False
    browser: bool = True
    upload: bool = True  # Notify on image uploads to sheets you created
    adoption: bool = True  # Notify when your images are adopted
    points: bool = True  # Notify on point changes


class SecuritySettings(BaseModel):
    """セキュリティ設定."""
    loginAlerts: bool = True  # Alert on new login
    twoFactorEnabled: bool = False  # 2FA (future enhancement)


class LinkedAccountsResponse(BaseModel):
    """連携アカウント情報."""
    discord_id: Optional[str] = None
    google_id: Optional[str] = None
    has_password: bool = False  # Whether user has set a password


class PasswordChangeRequest(BaseModel):
    """パスワード変更リクエスト."""
    current_password: Optional[str] = None  # Required if user already has password
    new_password: str = Field(..., min_length=8, max_length=100)

