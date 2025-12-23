"""
封解Box Backend - Images Adoption

Image adoption and bulk adoption endpoints with point rewards
"""
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.image import Image, ImageStatus
from app.models.user import User, UserRole
from app.models.point import PointHistory, PointAction
from app.models.settings import RewardSettings
from app.schemas.image import ImageResponse, ImageAdoptRequest
from app.middleware.auth import get_current_user

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


@router.post("/{img_id}/adopt", response_model=ImageResponse)
async def adopt_image(
    img_id: str,
    request: ImageAdoptRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """画像の採用/不採用切り替え（点数加算）."""
    if current_user.role not in [UserRole.GICHO]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only gicho can adopt images")
    
    result = await db.execute(select(Image).where(Image.id == img_id))
    image = result.scalar_one_or_none()
    
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    
    # Update status
    if request.adopt:
        image.status = ImageStatus.ADOPTED
        image.adopted_at = datetime.utcnow()
        
        # Award points to uploader
        uploader_result = await db.execute(select(User).where(User.id == image.uploader_id))
        uploader = uploader_result.scalar_one_or_none()
        
        if uploader:
            uploader.points += request.points_awarded
            
            # Record point history
            history = PointHistory(
                user_id=uploader.id,
                action=PointAction.IMAGE_ADOPTED,
                points_change=request.points_awarded,
                points_after=uploader.points,
                reason=f"Image adopted for sheet",
                related_image_id=image.id,
                related_sheet_id=image.sheet_id,
                created_by=current_user.id,
            )
            db.add(history)
    else:
        image.status = ImageStatus.REJECTED
        image.adopted_at = None
    
    await db.commit()
    await db.refresh(image)
    
    # Import here to avoid circular dependency
    from app.services.firebase_sync import sync_image_to_firebase
    await sync_image_to_firebase(image)
    
    return ImageResponse.model_validate(image.__dict__)


class BulkAdoptRequest(BaseModel):
    """一括採用リクエスト."""
    image_ids: List[str]
    adopt: bool = True


@router.post("/adopt-bulk")
async def adopt_images_bulk(
    request: BulkAdoptRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """複数画像一括採用."""
    if current_user.role != UserRole.GICHO:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only gicho can adopt images")
    
    if not request.image_ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No image IDs provided")
    
    reward_settings = await get_reward_settings(db)
    results = []
    
    for img_id in request.image_ids:
        result = await db.execute(select(Image).where(Image.id == img_id))
        image = result.scalar_one_or_none()
        
        if not image:
            results.append({"id": img_id, "success": False, "error": "Not found"})
            continue
        
        if request.adopt:
            image.status = ImageStatus.ADOPTED
            image.adopted_at = datetime.utcnow()
            
            # 採用点加算
            uploader_result = await db.execute(select(User).where(User.id == image.uploader_id))
            uploader = uploader_result.scalar_one_or_none()
            
            if uploader and uploader.discord_id:
                uploader.points += reward_settings.adoption_points
                
                history = PointHistory(
                    user_id=uploader.id,
                    action=PointAction.IMAGE_ADOPTED,
                    points_change=reward_settings.adoption_points,
                    points_after=uploader.points,
                    reason="Image adopted (bulk)",
                    related_image_id=image.id,
                    related_sheet_id=image.sheet_id,
                    created_by=current_user.id,
                )
                db.add(history)
        else:
            image.status = ImageStatus.REJECTED
            image.adopted_at = None
        
        results.append({"id": img_id, "success": True, "status": image.status.value})
    
    await db.commit()
    
    return {"processed": len(results), "results": results}
