"""
封解Box Backend - Tools Schemas

Pydantic schemas for Tools API
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class ToolProjectResponse(BaseModel):
    """ツールプロジェクトレスポンス."""
    id: str
    name: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    owner_id: str
    owner_name: Optional[str] = None
    project_type: str
    status: str = "stopped"
    embed_source: Optional[str] = None
    embed_url: Optional[str] = None
    view_count: int = 0
    upvotes: int = 0
    downvotes: int = 0
    comment_count: int = 0
    user_vote: Optional[bool] = None  # True=upvote, False=downvote, None=no vote
    is_public: bool = True
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProjectCreateRequest(BaseModel):
    """プロジェクト作成リクエスト."""
    name: str
    description: Optional[str] = None
    project_type: str = "sandbox"  # sandbox or embed
    html_content: Optional[str] = None
    embed_source: Optional[str] = None  # gemini_canvas, gpt_canvas, claude_artifacts
    embed_url: Optional[str] = None


class VoteRequest(BaseModel):
    """投票リクエスト."""
    is_upvote: bool


class CommentResponse(BaseModel):
    """コメントレスポンス."""
    id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class CommentCreateRequest(BaseModel):
    """コメント作成リクエスト."""
    content: str


class ProjectLog(BaseModel):
    """実行ログ."""
    timestamp: datetime
    level: str
    message: str
