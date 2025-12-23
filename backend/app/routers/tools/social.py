"""
封解Box Backend - Tools Social Features

Vote and Comment endpoints for projects
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.tool_project import ToolProject as ToolProjectModel, ToolVote, ToolComment
from app.middleware.auth import get_current_user
from .schemas import VoteRequest, CommentResponse, CommentCreateRequest

router = APIRouter()


# =====================
# Vote Endpoints
# =====================

@router.post("/projects/{project_id}/vote")
async def vote_project(
    project_id: str,
    data: VoteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """プロジェクトに投票."""
    # Check project exists
    query = select(ToolProjectModel).where(
        ToolProjectModel.id == project_id,
        ToolProjectModel.is_deleted == False
    )
    result = await db.execute(query)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check existing vote
    vote_query = select(ToolVote).where(
        ToolVote.project_id == project_id,
        ToolVote.user_id == current_user.id
    )
    vote_result = await db.execute(vote_query)
    existing_vote = vote_result.scalar_one_or_none()
    
    if existing_vote:
        # Update existing vote
        existing_vote.is_upvote = data.is_upvote
    else:
        # Create new vote
        vote = ToolVote(
            project_id=project_id,
            user_id=current_user.id,
            is_upvote=data.is_upvote
        )
        db.add(vote)
    
    return {"success": True, "is_upvote": data.is_upvote}


@router.delete("/projects/{project_id}/vote", status_code=status.HTTP_204_NO_CONTENT)
async def remove_vote(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """投票を取り消し."""
    vote_query = select(ToolVote).where(
        ToolVote.project_id == project_id,
        ToolVote.user_id == current_user.id
    )
    result = await db.execute(vote_query)
    vote = result.scalar_one_or_none()
    
    if vote:
        await db.delete(vote)


# =====================
# Comment Endpoints
# =====================

@router.get("/projects/{project_id}/comments", response_model=List[CommentResponse])
async def get_comments(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """コメント一覧取得."""
    query = select(ToolComment).options(
        selectinload(ToolComment.user)
    ).where(
        ToolComment.project_id == project_id,
        ToolComment.is_deleted == False
    ).order_by(ToolComment.created_at.desc())
    
    result = await db.execute(query)
    comments = result.scalars().all()
    
    return [
        CommentResponse(
            id=c.id,
            user_id=c.user_id,
            user_name=c.user.display_name or c.user.username,
            user_avatar=c.user.avatar_url,
            content=c.content,
            created_at=c.created_at
        )
        for c in comments
    ]


@router.post("/projects/{project_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    project_id: str,
    data: CommentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """コメント投稿."""
    # Check project exists
    query = select(ToolProjectModel).where(
        ToolProjectModel.id == project_id,
        ToolProjectModel.is_deleted == False
    )
    result = await db.execute(query)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    comment = ToolComment(
        project_id=project_id,
        user_id=current_user.id,
        content=data.content
    )
    db.add(comment)
    await db.flush()
    
    return CommentResponse(
        id=comment.id,
        user_id=current_user.id,
        user_name=current_user.display_name or current_user.username,
        user_avatar=current_user.avatar_url,
        content=comment.content,
        created_at=comment.created_at
    )


@router.delete("/projects/{project_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    project_id: str,
    comment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """コメント削除（論理削除）."""
    query = select(ToolComment).where(ToolComment.id == comment_id)
    result = await db.execute(query)
    comment = result.scalar_one_or_none()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    comment.is_deleted = True
