"""
封解Box Backend - Tools Gallery Endpoints

Gallery-related endpoints for public and personal projects
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.tool_project import ToolProject as ToolProjectModel
from app.middleware.auth import get_current_user, get_optional_user
from .schemas import ToolProjectResponse
from .utils import project_to_response

router = APIRouter()


@router.get("/gallery", response_model=List[ToolProjectResponse])
async def get_gallery(
    sort: str = Query("popular", description="popular, newest, oldest"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """公開プロジェクト一覧（Gallery）取得."""
    query = select(ToolProjectModel).options(
        selectinload(ToolProjectModel.owner),
        selectinload(ToolProjectModel.votes),
        selectinload(ToolProjectModel.comments)
    ).where(
        ToolProjectModel.is_public == True,
        ToolProjectModel.is_deleted == False
    )
    
    if sort == "newest":
        query = query.order_by(ToolProjectModel.created_at.desc())
    elif sort == "oldest":
        query = query.order_by(ToolProjectModel.created_at.asc())
    else:  # popular - sort by vote score (needs subquery)
        query = query.order_by(ToolProjectModel.view_count.desc())  # Simplified: sort by views
    
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    projects = result.scalars().all()
    
    user_id = current_user.id if current_user else None
    return [project_to_response(p, user_id) for p in projects]


@router.get("/my-projects", response_model=List[ToolProjectResponse])
async def get_my_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """自分のプロジェクト一覧取得."""
    query = select(ToolProjectModel).options(
        selectinload(ToolProjectModel.owner),
        selectinload(ToolProjectModel.votes),
        selectinload(ToolProjectModel.comments)
    ).where(
        ToolProjectModel.owner_id == current_user.id,
        ToolProjectModel.is_deleted == False
    ).order_by(ToolProjectModel.created_at.desc())
    
    result = await db.execute(query)
    projects = result.scalars().all()
    
    return [project_to_response(p, current_user.id) for p in projects]
