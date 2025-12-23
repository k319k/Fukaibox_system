"""
封解Box Backend - Sheet Schemas
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from app.models.sheet import SheetPhase


class SheetBase(BaseModel):
    """シート基本スキーマ."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class SheetCreate(SheetBase):
    """シート作成スキーマ."""
    script_content: Optional[str] = None
    is_giin_only: bool = False
    is_anonymous_allowed: bool = False


class SheetUpdate(BaseModel):
    """シート更新スキーマ."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    script_content: Optional[str] = None
    phase: Optional[SheetPhase] = None
    is_giin_only: Optional[bool] = None
    is_anonymous_allowed: Optional[bool] = None
    is_recruitment_closed: Optional[bool] = None
    sections_json: Optional[str] = None


class SheetSettings(BaseModel):
    """シート設定変更スキーマ."""
    is_recruitment_closed: Optional[bool] = None
    is_giin_only: Optional[bool] = None
    is_anonymous_allowed: Optional[bool] = None


class SheetResponse(SheetBase):
    """シートレスポンススキーマ."""
    id: str
    script_content: Optional[str] = None
    phase: SheetPhase
    is_giin_only: bool
    is_anonymous_allowed: bool
    is_recruitment_closed: bool
    sections_json: Optional[str] = None
    creator_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    image_count: int = 0
    
    class Config:
        from_attributes = True
