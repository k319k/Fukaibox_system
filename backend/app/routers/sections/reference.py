"""
封解Box Backend - Script Sections Reference Images

Reference image upload and management
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import os
import shutil

from app.database import get_db
from app.models.user import User
from app.models.script_section import ScriptSection
from app.middleware.auth import require_gicho
from app.config import settings

router = APIRouter()


@router.post("/sections/{section_id}/reference-images")
async def upload_reference_image(
    section_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_gicho),
    db: AsyncSession = Depends(get_db)
):
    """Upload a reference image for a section (Gicho only)"""
    result = await db.execute(select(ScriptSection).where(ScriptSection.id == section_id))
    db_section = result.scalar_one_or_none()
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Save file
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(settings.upload_dir, "reference", filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Add URL to section's reference_image_urls
    reference_urls = db_section.reference_image_urls or []
    reference_urls.append(f"/uploads/reference/{filename}")
    db_section.reference_image_urls = reference_urls
    
    await db.commit()
    await db.refresh(db_section)
    
    return {"url": f"/uploads/reference/{filename}"}


@router.delete("/sections/{section_id}/reference-images/{image_index}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reference_image(
    section_id: str,
    image_index: int,
    current_user: User = Depends(require_gicho),
    db: AsyncSession = Depends(get_db)
):
    """Delete a reference image from a section (Gicho only)"""
    result = await db.execute(select(ScriptSection).where(ScriptSection.id == section_id))
    db_section = result.scalar_one_or_none()
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    reference_urls = db_section.reference_image_urls or []
    if image_index < 0 or image_index >= len(reference_urls):
        raise HTTPException(status_code=400, detail="Invalid image index")
    
    # Remove from list
    url = reference_urls.pop(image_index)
    db_section.reference_image_urls = reference_urls
    
    # Delete file from disk
    try:
        filename = url.split("/")[-1]
        filepath = os.path.join(settings.upload_dir, "reference", filename)
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception as e:
        print(f"Error deleting reference image file: {e}")
    
    await db.commit()
    
    return None
