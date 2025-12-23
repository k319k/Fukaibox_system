"""
封解Box Backend - Sheets CRUD

Basic CRUD operations for sheets
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.sheet import Sheet, SheetPhase
from app.models.image import Image
from app.models.user import User, UserRole
from app.schemas.sheet import SheetCreate, SheetResponse
from app.middleware.auth import get_current_user
from app.services.firebase_sync import sync_sheet_to_firebase

router = APIRouter()


@router.get("/", response_model=List[SheetResponse])
async def list_sheets(
    phase: Optional[str] = Query(None),
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """シート一覧取得."""
    query = select(Sheet)
    
    if phase:
        try:
            phase_enum = SheetPhase(phase)
            query = query.where(Sheet.phase == phase_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid phase. Must be one of: {[p.value for p in SheetPhase]}"
            )
    
    # Non-giin can only see non-giin-only sheets
    if current_user.role == UserRole.GUEST:
        query = query.where(Sheet.is_giin_only == False)
    
    query = query.order_by(Sheet.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    sheets = result.scalars().all()
    
    # Add image count
    response = []
    for sheet in sheets:
        count_result = await db.execute(
            select(func.count()).select_from(Image).where(Image.sheet_id == sheet.id)
        )
        sheet_dict = {
            **sheet.__dict__,
            "image_count": count_result.scalar() or 0
        }
        response.append(SheetResponse.model_validate(sheet_dict))
    
    return response


@router.post("/", response_model=SheetResponse, status_code=status.HTTP_201_CREATED)
async def create_sheet(
    sheet_data: SheetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """新規シート作成."""
    if current_user.role == UserRole.GUEST:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Guests cannot create sheets"
        )
    
    sheet = Sheet(
        title=sheet_data.title,
        description=sheet_data.description,
        script_content=sheet_data.script_content,
        is_giin_only=sheet_data.is_giin_only,
        is_anonymous_allowed=sheet_data.is_anonymous_allowed,
        creator_id=current_user.id,
    )
    db.add(sheet)
    await db.commit()
    await db.refresh(sheet)
    
    # Sync to Firebase
    await sync_sheet_to_firebase(sheet)
    
    return SheetResponse.model_validate({**sheet.__dict__, "image_count": 0})


@router.get("/{sheet_id}", response_model=SheetResponse)
async def get_sheet(
    sheet_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """特定シートの詳細取得."""
    result = await db.execute(select(Sheet).where(Sheet.id == sheet_id))
    sheet = result.scalar_one_or_none()
    
    if not sheet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sheet not found")
    
    if sheet.is_giin_only and current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    count_result = await db.execute(
        select(func.count()).select_from(Image).where(Image.sheet_id == sheet.id)
    )
    
    return SheetResponse.model_validate({
        **sheet.__dict__, 
        "image_count": count_result.scalar() or 0
    })


@router.delete("/{sheet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sheet(
    sheet_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """シート削除."""
    result = await db.execute(select(Sheet).where(Sheet.id == sheet_id))
    sheet = result.scalar_one_or_none()
    
    if not sheet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sheet not found")
    
    if sheet.creator_id != current_user.id and current_user.role != UserRole.GICHO:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    
    await db.delete(sheet)
    await db.commit()
