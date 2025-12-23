"""
API Key Management Router
Handles CRUD operations for API keys (DevStudio backend).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from pydantic import BaseModel
from datetime import datetime

from ..database import get_db
from ..models import ApiKey, User
from ..middleware.auth import get_current_user
from ..utils.api_auth import generate_api_key, hash_api_key

router = APIRouter(prefix="/api/dev-studio", tags=["API Keys"])


# Schemas
class APIKeyCreate(BaseModel):
    name: str
    permissions: dict = {"read_points": True, "write_points": False}


class APIKeyResponse(BaseModel):
    id: str
    name: str
    key_prefix: str
    permissions: dict
    created_at: datetime
    last_used_at: datetime | None
    is_active: bool

    class Config:
        from_attributes = True


class APIKeyCreatedResponse(BaseModel):
    id: str
    name: str
    key: str  # Full key, only shown once
    key_prefix: str
    permissions: dict
    created_at: datetime


# Dependencies
async def verify_api_key_access(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Verify user can manage API keys (儀長 or permitted 儀員)"""
    if not current_user.can_manage_api_keys and not current_user.is_gicho:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to manage API keys"
        )
    return current_user


@router.post("/keys", response_model=APIKeyCreatedResponse)
async def create_api_key(
    key_data: APIKeyCreate,
    current_user: User = Depends(verify_api_key_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a new API key.
    Returns the full key ONLY in this response (it won't be shown again).
    """
    # Generate key
    full_key = generate_api_key()
    key_hash = hash_api_key(full_key)
    key_prefix = full_key[:12]  # "fkb_live_xxx"
    
    # Create database record
    new_key = ApiKey(
        user_id=current_user.id,
        key_hash=key_hash,
        key_prefix=key_prefix,
        name=key_data.name,
        permissions=key_data.permissions,
        is_active=True
    )
    
    db.add(new_key)
    await db.commit()
    await db.refresh(new_key)
    
    return {
        "id": str(new_key.id),
        "name": new_key.name,
        "key": full_key,  # Only shown once!
        "key_prefix": new_key.key_prefix,
        "permissions": new_key.permissions,
        "created_at": new_key.created_at
    }


@router.get("/keys", response_model=List[APIKeyResponse])
async def list_api_keys(
    current_user: User = Depends(verify_api_key_access),
    db: AsyncSession = Depends(get_db)
):
    """List all API keys for the current user."""
    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.user_id == current_user.id)
        .order_by(ApiKey.created_at.desc())
    )
    keys = result.scalars().all()
    
    return [
        {
            "id": str(key.id),
            "name": key.name,
            "key_prefix": key.key_prefix,
            "permissions": key.permissions,
            "created_at": key.created_at,
            "last_used_at": key.last_used_at,
            "is_active": key.is_active
        }
        for key in keys
    ]


@router.delete("/keys/{key_id}")
async def delete_api_key(
    key_id: str,
    current_user: User = Depends(verify_api_key_access),
    db: AsyncSession = Depends(get_db)
):
    """Delete an API key (only if it belongs to the current user)."""
    # Verify ownership
    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.id == key_id, ApiKey.user_id == current_user.id)
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    await db.delete(api_key)
    await db.commit()
    
    return {"message": "API key deleted successfully"}


@router.put("/keys/{key_id}/permissions")
async def update_api_key_permissions(
    key_id: str,
    permissions: dict,
    current_user: User = Depends(verify_api_key_access),
    db: AsyncSession = Depends(get_db)
):
    """Update permissions for an API key."""
    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.id == key_id, ApiKey.user_id == current_user.id)
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    api_key.permissions = permissions
    await db.commit()
    
    return {"message": "Permissions updated successfully"}
