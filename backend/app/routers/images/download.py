"""
封解Box Backend - Images Download

Image download and export endpoints
"""
from typing import List
import os
import zipfile
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.sheet import Sheet
from app.models.image import Image, ImageStatus
from app.models.user import User, UserRole
from app.schemas.image import ImageResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/{sheet_id}/export")
async def export_images(
    sheet_id: str,
    size: str = "resized",  # "resized" or "original"
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """サーバー内画像をZIP生成（リサイズ版/オリジナル版選択可能）"""
    # Get sheet
    result = await db.execute(select(Sheet).where(Sheet.id == sheet_id))
    sheet = result.scalar_one_or_none()
    
    if not sheet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sheet not found")
    
    if current_user.role != UserRole.GICHO and sheet.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    
    # Get adopted images
    images_result = await db.execute(
        select(Image)
        .where(Image.sheet_id == sheet_id)
        .where(Image.status == ImageStatus.ADOPTED)
        .order_by(Image.section_index, Image.created_at)
    )
    images = images_result.scalars().all()
    
    if not images:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No adopted images found")
    
    # Create ZIP
    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for i, image in enumerate(images):
            # Select file path based on size parameter
            if size == "original" and image.original_file_path and os.path.exists(image.original_file_path):
                file_path = image.original_file_path
            elif os.path.exists(image.file_path):
                file_path = image.file_path
            else:
                continue  # Skip if file doesn't exist
            
            # Get uploader name for filename
            uploader_result = await db.execute(select(User).where(User.id == image.uploader_id))
            uploader = uploader_result.scalar_one_or_none()
            uploader_name = uploader.display_name or uploader.username if uploader else "unknown"
            
            ext = os.path.splitext(image.filename)[1]
            size_suffix = "_original" if size == "original" else ""
            archive_name = f"{i+1:03d}_{uploader_name}{size_suffix}{ext}"
            
            zip_file.write(file_path, archive_name)
    
    zip_buffer.seek(0)
    
    size_label = "original" if size == "original" else "resized"
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{sheet.title}_images_{size_label}.zip"'}
    )


@router.get("/{img_id}/download")
async def download_image(
    img_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """画像単体ダウンロード."""
    result = await db.execute(select(Image).where(Image.id == img_id))
    image = result.scalar_one_or_none()
    
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    
    if not os.path.exists(image.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found on server")
    
    # ファイル名生成
    uploader_result = await db.execute(select(User).where(User.id == image.uploader_id))
    uploader = uploader_result.scalar_one_or_none()
    uploader_name = uploader.display_name or uploader.username if uploader else "unknown"
    
    ext = os.path.splitext(image.filename)[1]
    download_name = f"{uploader_name}_{image.id[:8]}{ext}"
    
    return FileResponse(
        image.file_path,
        filename=download_name,
        media_type=image.mime_type or "image/jpeg"
    )


@router.get("/{sheet_id}/list", response_model=List[ImageResponse])
async def list_sheet_images(
    sheet_id: str,
    status_filter: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """シートの画像一覧取得."""
    result = await db.execute(select(Sheet).where(Sheet.id == sheet_id))
    sheet = result.scalar_one_or_none()
    
    if not sheet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sheet not found")
    
    if sheet.is_giin_only and current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    query = select(Image).where(Image.sheet_id == sheet_id)
    
    if status_filter:
        try:
            filter_status = ImageStatus(status_filter)
            query = query.where(Image.status == filter_status)
        except ValueError:
            pass
    
    query = query.order_by(Image.section_index, Image.created_at)
    images_result = await db.execute(query)
    images = images_result.scalars().all()
    
    response = []
    for image in images:
        uploader_result = await db.execute(select(User).where(User.id == image.uploader_id))
        uploader = uploader_result.scalar_one_or_none()
        uploader_name = None
        if not image.is_anonymous and uploader:
            uploader_name = uploader.display_name or uploader.username
        
        response.append(ImageResponse.model_validate({
            **image.__dict__,
            "uploader_name": uploader_name
        }))
    
    return response
