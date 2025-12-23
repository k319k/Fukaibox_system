"""
封解Box Backend - Sheets Management

Sheet settings, phase management, and archive operations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
import zipfile
from io import BytesIO
import os

from app.database import get_db
from app.models.sheet import Sheet, SheetPhase
from app.models.image import Image, ImageStatus
from app.models.user import User, UserRole
from app.schemas.sheet import SheetSettings, SheetResponse
from app.middleware.auth import get_current_user
from app.services.firebase_sync import sync_sheet_to_firebase

router = APIRouter()


class PhaseChangeRequest(BaseModel):
    """フェーズ変更リクエスト."""
    phase: str


@router.put("/{sheet_id}/script", response_model=SheetResponse)
async def update_sheet_script(
    sheet_id: str,
    script_content: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """台本の更新およびセクション再分割."""
    result = await db.execute(select(Sheet).where(Sheet.id == sheet_id))
    sheet = result.scalar_one_or_none()
    
    if not sheet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sheet not found")
    
    if sheet.creator_id != current_user.id and current_user.role != UserRole.GICHO:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    
    sheet.script_content = script_content
    # TODO: Parse script and update sections_json
    
    await db.commit()
    await db.refresh(sheet)
    await sync_sheet_to_firebase(sheet)
    
    count_result = await db.execute(
        select(func.count()).select_from(Image).where(Image.sheet_id == sheet.id)
    )
    
    return SheetResponse.model_validate({
        **sheet.__dict__,
        "image_count": count_result.scalar() or 0
    })


@router.patch("/{sheet_id}/settings", response_model=SheetResponse)
async def update_sheet_settings(
    sheet_id: str,
    settings: SheetSettings,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """募集停止・儀員限定・匿名許可の切替."""
    result = await db.execute(select(Sheet).where(Sheet.id == sheet_id))
    sheet = result.scalar_one_or_none()
    
    if not sheet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sheet not found")
    
    if sheet.creator_id != current_user.id and current_user.role != UserRole.GICHO:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    
    if settings.is_recruitment_closed is not None:
        sheet.is_recruitment_closed = settings.is_recruitment_closed
    if settings.is_giin_only is not None:
        sheet.is_giin_only = settings.is_giin_only
    if settings.is_anonymous_allowed is not None:
        sheet.is_anonymous_allowed = settings.is_anonymous_allowed
    
    await db.commit()
    await db.refresh(sheet)
    await sync_sheet_to_firebase(sheet)
    
    count_result = await db.execute(
        select(func.count()).select_from(Image).where(Image.sheet_id == sheet.id)
    )
    
    return SheetResponse.model_validate({
        **sheet.__dict__,
        "image_count": count_result.scalar() or 0
    })


@router.post("/{sheet_id}/phase", response_model=SheetResponse)
async def change_sheet_phase(
    sheet_id: str,
    request: PhaseChangeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """シートフェーズを明示的に変更."""
    result = await db.execute(select(Sheet).where(Sheet.id == sheet_id))
    sheet = result.scalar_one_or_none()
    
    if not sheet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sheet not found")
    
    if sheet.creator_id != current_user.id and current_user.role != UserRole.GICHO:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    
    try:
        new_phase = SheetPhase(request.phase)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid phase. Must be one of: {[p.value for p in SheetPhase]}"
        )
    
    sheet.phase = new_phase
    await db.commit()
    await db.refresh(sheet)
    await sync_sheet_to_firebase(sheet)
    
    count_result = await db.execute(
        select(func.count()).select_from(Image).where(Image.sheet_id == sheet.id)
    )
    
    return SheetResponse.model_validate({
        **sheet.__dict__,
        "image_count": count_result.scalar() or 0
    })


@router.post("/{sheet_id}/archive")
async def archive_sheet(
    sheet_id: str,
    backup_to_drive: bool = True,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """シートをアーカイブ（Google Driveバックアップ付き）."""
    result = await db.execute(select(Sheet).where(Sheet.id == sheet_id))
    sheet = result.scalar_one_or_none()
    
    if not sheet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sheet not found")
    
    if sheet.creator_id != current_user.id and current_user.role != UserRole.GICHO:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    
    # Google Driveバックアップ
    drive_file_id = None
    if backup_to_drive:
        from app.services.google_drive import backup_sheet_to_drive
        
        # 採用画像を取得してZIP作成
        images_result = await db.execute(
            select(Image)
            .where(Image.sheet_id == sheet_id)
            .where(Image.status == ImageStatus.ADOPTED)
            .order_by(Image.section_index)
        )
        images = images_result.scalars().all()
        
        if images:
            zip_buffer = BytesIO()
            with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
                for i, image in enumerate(images):
                    if os.path.exists(image.file_path):
                        ext = os.path.splitext(image.filename)[1]
                        zip_file.write(image.file_path, f"{i+1:03d}{ext}")
            
            zip_buffer.seek(0)
            drive_file_id = await backup_sheet_to_drive(
                zip_buffer.getvalue(),
                f"{sheet_id}.zip",
                sheet.title
            )
    
    # フェーズをアーカイブに変更
    sheet.phase = SheetPhase.ARCHIVED
    await db.commit()
    await db.refresh(sheet)
    await sync_sheet_to_firebase(sheet)
    
    return {
        "success": True,
        "sheet_id": sheet_id,
        "phase": sheet.phase.value,
        "drive_backup_id": drive_file_id
    }
