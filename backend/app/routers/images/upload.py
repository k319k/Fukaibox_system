"""
封解Box Backend - Images Upload

Image upload endpoints with automatic point rewards
"""
from datetime import datetime
import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.sheet import Sheet, SheetPhase
from app.models.image import Image, ImageStatus
from app.models.user import User, UserRole
from app.models.point import PointHistory, PointAction
from app.models.settings import RewardSettings
from app.schemas.image import ImageResponse
from app.middleware.auth import get_current_user
from app.services.image_processor import process_and_save_image
from app.services.firebase_sync import sync_image_to_firebase

router = APIRouter()


async def get_reward_settings(db: AsyncSession) -> RewardSettings:
    """報酬設定を取得（なければデフォルト作成）."""
    result = await db.execute(select(RewardSettings).limit(1))
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = RewardSettings()
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    
    return settings


@router.post("/{sheet_id}/upload", response_model=ImageResponse, status_code=status.HTTP_201_CREATED)
async def upload_image(
    sheet_id: str,
    file: UploadFile = File(...),
    section_index: int = Form(None),
    is_anonymous: bool = Form(False),
    comment: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """画像投稿 (Pillow 640x480リサイズ実行) + 投稿点自動加算."""
    # Get sheet
    result = await db.execute(select(Sheet).where(Sheet.id == sheet_id))
    sheet = result.scalar_one_or_none()
    
    if not sheet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sheet not found")
    
    if sheet.is_recruitment_closed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Recruitment is closed")
    
    if sheet.phase != SheetPhase.UPLOAD:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sheet is not accepting uploads")
    
    if sheet.is_giin_only and current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only members can upload")
    
    if not sheet.is_anonymous_allowed and is_anonymous:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Anonymous uploads not allowed")
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type")
    
    # Process and save image
    file_content = await file.read()
    filename, file_path, original_file_path, thumbnail_path, width, height = await process_and_save_image(
        file_content,
        file.filename,
        sheet_id
    )
    
    # Create image record
    image = Image(
        filename=filename,
        original_filename=file.filename,
        file_path=file_path,
        original_file_path=original_file_path,
        thumbnail_path=thumbnail_path,
        file_size=len(file_content),
        width=width,
        height=height,
        mime_type=file.content_type,
        section_index=section_index,
        is_anonymous=is_anonymous,
        comment=comment,
        sheet_id=sheet_id,
        uploader_id=current_user.id,
    )
    db.add(image)
    
    # 投稿点加算（Discord連携ユーザーのみ）
    upload_points = 0
    if current_user.discord_id:  # Discord連携済みユーザーのみ点数加算
        reward_settings = await get_reward_settings(db)
        upload_points = reward_settings.upload_points
        current_user.points += upload_points
        
        # 点数履歴記録
        history = PointHistory(
            user_id=current_user.id,
            action=PointAction.BASE_REWARD,
            points_change=upload_points,
            points_after=current_user.points,
            reason=f"Image uploaded to sheet: {sheet.title}",
            related_image_id=image.id,
            related_sheet_id=sheet_id,
        )
        db.add(history)
    
    await db.commit()
    await db.refresh(image)
    
    await sync_image_to_firebase(image)
    
    return ImageResponse.model_validate({
        **image.__dict__,
        "uploader_name": None if is_anonymous else current_user.display_name or current_user.username
    })


@router.delete("/{img_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_image(
    img_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """投稿の取り下げ・削除."""
    result = await db.execute(select(Image).where(Image.id == img_id))
    image = result.scalar_one_or_none()
    
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    
    if image.uploader_id != current_user.id and current_user.role != UserRole.GICHO:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    
    # Delete actual file
    if os.path.exists(image.file_path):
        os.remove(image.file_path)
    if image.thumbnail_path and os.path.exists(image.thumbnail_path):
        os.remove(image.thumbnail_path)
    
    await db.delete(image)
    await db.commit()
