"""
封解Box Backend - Tools CRUD Endpoints

Create, Read, Delete operations for projects
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.tool_project import ToolProject as ToolProjectModel, ProjectType, EmbedSource
from app.middleware.auth import get_current_user, get_optional_user
from .schemas import ToolProjectResponse, ProjectCreateRequest
from .utils import proxy_to_sandbox, project_to_response

router = APIRouter()


@router.post("/projects", response_model=ToolProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """新規プロジェクト作成."""
    project_type = ProjectType(data.project_type)
    
    # Sandbox projects go through ProDesk
    if project_type == ProjectType.SANDBOX:
        try:
            sandbox_data = {
                "name": data.name,
                "description": data.description,
                "html_content": data.html_content,
                "owner_id": current_user.id,
            }
            sandbox_result = await proxy_to_sandbox("POST", "/projects", current_user.id, sandbox_data)
            project_id = sandbox_result.get("id")
        except HTTPException as e:
            if e.status_code == 503:
                # ProDesk unavailable, create local-only project
                project_id = None
            else:
                raise
    else:
        project_id = None
    
    # Create DB record
    embed_source = None
    if data.embed_source:
        embed_source = EmbedSource(data.embed_source)
    
    project = ToolProjectModel(
        id=project_id,  # Will use default UUID if None
        owner_id=current_user.id,
        name=data.name,
        description=data.description,
        project_type=project_type,
        html_content=data.html_content if project_type == ProjectType.SANDBOX else None,
        embed_source=embed_source,
        embed_url=data.embed_url if project_type == ProjectType.EMBED else None,
    )
    
    db.add(project)
    await db.flush()
    await db.refresh(project, ["owner", "votes", "comments"])
    
    return project_to_response(project, current_user.id)


@router.get("/projects/{project_id}", response_model=ToolProjectResponse)
async def get_project(
    project_id: str,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """プロジェクト詳細取得 + 閲覧数カウント."""
    query = select(ToolProjectModel).options(
        selectinload(ToolProjectModel.owner),
        selectinload(ToolProjectModel.votes),
        selectinload(ToolProjectModel.comments)
    ).where(
        ToolProjectModel.id == project_id,
        ToolProjectModel.is_deleted == False
    )
    
    result = await db.execute(query)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check visibility
    if not project.is_public:
        if not current_user or current_user.id != project.owner_id:
            raise HTTPException(status_code=403, detail="This project is private")
    
    # Increment view count
    project.view_count += 1
    
    user_id = current_user.id if current_user else None
    return project_to_response(project, user_id)


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """プロジェクト削除（論理削除）."""
    query = select(ToolProjectModel).where(ToolProjectModel.id == project_id)
    result = await db.execute(query)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Sandbox projects: delete from ProDesk too
    if project.project_type == ProjectType.SANDBOX:
        try:
            await proxy_to_sandbox("DELETE", f"/projects/{project_id}", current_user.id)
        except HTTPException:
            pass  # Ignore ProDesk errors
    
    project.is_deleted = True
