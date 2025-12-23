"""
封解Box Backend - Tools Sandbox Operations

Sandbox execution control and health check (ProDesk Proxy)
"""
from typing import List
import httpx
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.tool_project import ToolProject as ToolProjectModel
from app.middleware.auth import get_current_user
from .schemas import ProjectLog
from .utils import proxy_to_sandbox, SANDBOX_URL

router = APIRouter()


@router.post("/projects/{project_id}/run")
async def run_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Sandboxプロジェクト実行（最大3件制限）(ProDesk経由)."""
    result = await proxy_to_sandbox("POST", f"/projects/{project_id}/run", current_user.id)
    
    # Update status in DB
    query = select(ToolProjectModel).where(ToolProjectModel.id == project_id)
    db_result = await db.execute(query)
    project = db_result.scalar_one_or_none()
    if project:
        project.status = "running"
    
    return result


@router.post("/projects/{project_id}/stop")
async def stop_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Sandboxプロジェクト停止 (ProDesk経由)."""
    result = await proxy_to_sandbox("POST", f"/projects/{project_id}/stop", current_user.id)
    
    # Update status in DB
    query = select(ToolProjectModel).where(ToolProjectModel.id == project_id)
    db_result = await db.execute(query)
    project = db_result.scalar_one_or_none()
    if project:
        project.status = "stopped"
    
    return result


@router.get("/projects/{project_id}/logs", response_model=List[ProjectLog])
async def get_project_logs(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """実行ログ取得 (ProDesk経由)."""
    result = await proxy_to_sandbox("GET", f"/projects/{project_id}/logs", current_user.id)
    return [ProjectLog(**log) for log in result]


@router.get("/health")
async def sandbox_health():
    """サンドボックス接続状態を確認."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{SANDBOX_URL}/health")
            sandbox_status = response.json() if response.status_code == 200 else None
    except Exception:
        sandbox_status = None
    
    return {
        "rpi_backend": "ok",
        "sandbox_host": settings.sandbox_host,
        "sandbox_port": settings.sandbox_port,
        "sandbox_status": sandbox_status or "unreachable"
    }
