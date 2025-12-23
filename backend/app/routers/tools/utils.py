"""
封解Box Backend - Tools Utilities

Helper functions for Tools Router
"""
from typing import Optional
import httpx
from fastapi import HTTPException, status

from app.config import settings
from app.models.tool_project import ToolProject as ToolProjectModel
from .schemas import ToolProjectResponse

# ProDesk Sandbox API URL
SANDBOX_URL = f"http://{settings.sandbox_host}:{settings.sandbox_port}"


async def proxy_to_sandbox(
    method: str,
    path: str,
    user_id: str,
    json_data: dict = None
) -> dict:
    """ProDesk サンドボックスへリクエストをプロキシ."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            headers = {"X-User-ID": user_id}
            url = f"{SANDBOX_URL}{path}"
            
            if method == "GET":
                response = await client.get(url, headers=headers)
            elif method == "POST":
                response = await client.post(url, headers=headers, json=json_data or {})
            elif method == "DELETE":
                response = await client.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Project not found")
            elif response.status_code == 403:
                raise HTTPException(status_code=403, detail="Permission denied")
            elif response.status_code == 429:
                raise HTTPException(status_code=429, detail="Maximum running projects reached")
            elif response.status_code >= 400:
                raise HTTPException(status_code=response.status_code, detail=response.text)
            
            return response.json()
        except httpx.ConnectError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Sandbox server (ProDesk) is not available"
            )


def project_to_response(
    project: ToolProjectModel,
    current_user_id: Optional[str] = None
) -> ToolProjectResponse:
    """プロジェクトモデルをレスポンスに変換."""
    upvotes = sum(1 for v in project.votes if v.is_upvote)
    downvotes = len(project.votes) - upvotes
    
    user_vote = None
    if current_user_id:
        for v in project.votes:
            if v.user_id == current_user_id:
                user_vote = v.is_upvote
                break
    
    return ToolProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        thumbnail_url=project.thumbnail_url,
        owner_id=project.owner_id,
        owner_name=project.owner.display_name or project.owner.username if project.owner else None,
        project_type=project.project_type.value,
        status=project.status,
        embed_source=project.embed_source.value if project.embed_source else None,
        embed_url=project.embed_url,
        view_count=project.view_count,
        upvotes=upvotes,
        downvotes=downvotes,
        comment_count=len([c for c in project.comments if not c.is_deleted]),
        user_vote=user_vote,
        is_public=project.is_public,
        created_at=project.created_at
    )
