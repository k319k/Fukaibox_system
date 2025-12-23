"""
封解Box Backend - Tool Project Models

ToolProject: サンドボックス・埋め込みプロジェクト
ToolVote: 高評価/低評価
ToolComment: コメント
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Enum as SQLEnum, Text, ForeignKey, BigInteger
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum
import uuid

from app.database import Base


class ProjectType(str, enum.Enum):
    """プロジェクトタイプ."""
    SANDBOX = "sandbox"    # HTML/CSS/JS自作
    EMBED = "embed"        # Canvas埋め込み


class EmbedSource(str, enum.Enum):
    """埋め込みソース."""
    GEMINI_CANVAS = "gemini_canvas"
    GPT_CANVAS = "gpt_canvas"
    CLAUDE_ARTIFACTS = "claude_artifacts"


class ToolProject(Base):
    """ツールプロジェクトモデル."""
    __tablename__ = "tool_projects"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    
    # Basic info
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    
    # Project type
    project_type = Column(SQLEnum(ProjectType), default=ProjectType.SANDBOX, nullable=False)
    
    # Sandbox fields (ProDesk経由)
    html_content = Column(Text, nullable=True)
    status = Column(String(20), default="stopped")  # stopped, running
    storage_used_bytes = Column(BigInteger, default=0)
    
    # Embed fields
    embed_source = Column(SQLEnum(EmbedSource), nullable=True)
    embed_url = Column(Text, nullable=True)
    
    # Stats
    view_count = Column(Integer, default=0, nullable=False)
    
    # Visibility
    is_public = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", backref="tool_projects")
    votes = relationship("ToolVote", back_populates="project", cascade="all, delete-orphan")
    comments = relationship("ToolComment", back_populates="project", cascade="all, delete-orphan")
    
    @property
    def storage_used_mb(self):
        """ストレージ使用量をMB単位で返す."""
        return self.storage_used_bytes / (1024 * 1024)
    
    @property
    def vote_score(self):
        """投票スコア（高評価 - 低評価）を計算."""
        upvotes = sum(1 for v in self.votes if v.is_upvote)
        downvotes = len(self.votes) - upvotes
        return upvotes - downvotes


class ToolVote(Base):
    """ツール投票モデル."""
    __tablename__ = "tool_votes"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("tool_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    
    is_upvote = Column(Boolean, nullable=False)  # True=高評価, False=低評価
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    project = relationship("ToolProject", back_populates="votes")
    user = relationship("User", backref="tool_votes")
    
    # Unique constraint: ユーザーごとプロジェクトごと1投票
    __table_args__ = (
        {"comment": "Unique vote per user per project"},
    )


class ToolComment(Base):
    """ツールコメントモデル."""
    __tablename__ = "tool_comments"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("tool_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    
    content = Column(Text, nullable=False)
    
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("ToolProject", back_populates="comments")
    user = relationship("User", backref="tool_comments")
