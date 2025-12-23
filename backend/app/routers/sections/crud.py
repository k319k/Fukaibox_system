"""
封解Box Backend - Script Sections CRUD

Section management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.database import get_db
from app.models.user import User
from app.models.sheet import Sheet
from app.models.script_section import ScriptSection
from app.schemas.script_section import (
    SectionCreate, 
    SectionUpdate, 
    SectionResponse,
    SectionReorderRequest
)
from app.middleware.auth import get_current_user, require_gicho

router = APIRouter()


@router.get("/sheets/{sheet_id}/sections", response_model=List[SectionResponse])
async def list_sections(
    sheet_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all sections for a sheet"""
    result = await db.execute(select(Sheet).where(Sheet.id == sheet_id))
    sheet = result.scalar_one_or_none()
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
    
    result = await db.execute(
        select(ScriptSection)
        .where(ScriptSection.sheet_id == sheet_id)
        .order_by(ScriptSection.order)
    )
    sections = result.scalars().all()
    
    return sections


@router.post("/sheets/{sheet_id}/sections", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
async def create_section(
    sheet_id: str,
    section: SectionCreate,
    current_user: User = Depends(require_gicho),
    db: AsyncSession = Depends(get_db)
):
    """Create a new section (Gicho only)"""
    result = await db.execute(select(Sheet).where(Sheet.id == sheet_id))
    sheet = result.scalar_one_or_none()
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
    
    new_section = ScriptSection(
        id=str(uuid.uuid4()),
        sheet_id=sheet_id,
        order=section.order,
        title=section.title,
        content=section.content,
        image_instructions=section.image_instructions,
        reference_image_urls=section.reference_image_urls or []
    )
    
    db.add(new_section)
    await db.commit()
    await db.refresh(new_section)
    
    return new_section


@router.put("/sections/{section_id}", response_model=SectionResponse)
async def update_section(
    section_id: str,
    section: SectionUpdate,
    current_user: User = Depends(require_gicho),
    db: AsyncSession = Depends(get_db)
):
    """Update a section (Gicho only)"""
    result = await db.execute(select(ScriptSection).where(ScriptSection.id == section_id))
    db_section = result.scalar_one_or_none()
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    if section.title is not None:
        db_section.title = section.title
    if section.content is not None:
        db_section.content = section.content
    if section.image_instructions is not None:
        db_section.image_instructions = section.image_instructions
    if section.reference_image_urls is not None:
        db_section.reference_image_urls = section.reference_image_urls
    if section.order is not None:
        db_section.order = section.order
    
    await db.commit()
    await db.refresh(db_section)
    
    return db_section


@router.delete("/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_section(
    section_id: str,
    current_user: User = Depends(require_gicho),
    db: AsyncSession = Depends(get_db)
):
    """Delete a section (Gicho only)"""
    result = await db.execute(select(ScriptSection).where(ScriptSection.id == section_id))
    db_section = result.scalar_one_or_none()
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    await db.delete(db_section)
    await db.commit()
    
    return None


@router.post("/sheets/{sheet_id}/sections/reorder", response_model=List[SectionResponse])
async def reorder_sections(
    sheet_id: str,
    reorder_request: SectionReorderRequest,
    current_user: User = Depends(require_gicho),
    db: AsyncSession = Depends(get_db)
):
    """Reorder sections (Gicho only)"""
    result = await db.execute(select(Sheet).where(Sheet.id == sheet_id))
    sheet = result.scalar_one_or_none()
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
    
    for index, section_id in enumerate(reorder_request.section_ids):
        result = await db.execute(
            select(ScriptSection)
            .where(ScriptSection.id == section_id)
            .where(ScriptSection.sheet_id == sheet_id)
        )
        db_section = result.scalar_one_or_none()
        
        if db_section:
            db_section.order = index
    
    await db.commit()
    
    result = await db.execute(
        select(ScriptSection)
        .where(ScriptSection.sheet_id == sheet_id)
        .order_by(ScriptSection.order)
    )
    return result.scalars().all()
