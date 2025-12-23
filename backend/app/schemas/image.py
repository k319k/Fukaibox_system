"""
封解Box Backend - Image Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.models.image import ImageStatus


class ImageCreate(BaseModel):
    """画像投稿スキーマ."""
    section_index: Optional[int] = None
    is_anonymous: bool = False
    comment: Optional[str] = None


class ImageResponse(BaseModel):
    """画像レスポンススキーマ."""
    id: str
    filename: str
    original_filename: Optional[str] = None
    file_path: str
    thumbnail_path: Optional[str] = None
    
    file_size: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    
    status: ImageStatus
    section_index: Optional[int] = None
    is_anonymous: bool
    comment: Optional[str] = None
    
    sheet_id: str
    uploader_id: str
    uploader_name: Optional[str] = None
    
    created_at: datetime
    adopted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ImageAdoptRequest(BaseModel):
    """画像採用リクエスト."""
    adopt: bool = True
    points_awarded: int = 10  # 採用時に付与する点数
