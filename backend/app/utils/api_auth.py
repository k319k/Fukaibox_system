"""
API Key Authentication Utilities
Handles API key generation, hashing, and verification for public API access.
"""

import secrets
import bcrypt
from typing import Optional
from fastapi import Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime

from ..database import get_db
from ..models import ApiKey, User


def generate_api_key() -> str:
    """
    Generate a secure random API key.
    Format: fkb_live_[40 random chars]
    """
    random_part = secrets.token_urlsafe(30)  # ~40 chars in base64
    return f"fkb_live_{random_part}"


def hash_api_key(key: str) -> str:
    """Hash an API key using bcrypt."""
    return bcrypt.hashpw(key.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_api_key_hash(key: str, key_hash: str) -> bool:
    """Verify an API key against its hash."""
    try:
        return bcrypt.checkpw(key.encode('utf-8'), key_hash.encode('utf-8'))
    except Exception:
        return False


async def verify_api_key(
    x_api_key: str = Header(..., description="API Key for authentication"),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    FastAPI dependency to verify X-API-KEY header.
    Returns the API key record with user information.
    """
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key is required")
    
    # Query all active API keys (we need to check hash for each)
    result = await db.execute(
        select(ApiKey, User)
        .join(User, ApiKey.user_id == User.id)
        .where(ApiKey.is_active == True)
    )
    api_keys = result.all()
    
    # Check each key hash
    for api_key, user in api_keys:
        if verify_api_key_hash(x_api_key, api_key.key_hash):
            # Update last_used_at
            await db.execute(
                update(ApiKey)
                .where(ApiKey.id == api_key.id)
                .values(last_used_at=datetime.utcnow())
            )
            await db.commit()
            
            return {
                "api_key_id": str(api_key.id),
                "user_id": user.id,
                "username": user.username,
                "permissions": api_key.permissions,
                "is_gicho": user.is_gicho
            }
    
    raise HTTPException(status_code=401, detail="Invalid API key")


async def verify_api_key_permission(
    permission: str,
    api_key_info: dict = Depends(verify_api_key)
) -> dict:
    """
    Verify that the API key has a specific permission.
    
    Args:
        permission: Permission to check (e.g., "write_points")
        api_key_info: Authenticated API key info from verify_api_key
    """
    permissions = api_key_info.get("permissions", {})
    
    if not permissions.get(permission, False):
        raise HTTPException(
            status_code=403,
            detail=f"API key does not have '{permission}' permission"
        )
    
    return api_key_info
