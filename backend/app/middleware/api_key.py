"""
封解Box Backend - API Key Middleware
"""
from datetime import datetime
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.models.api_key import ApiKey


async def verify_api_key(
    x_api_key: str = Header(..., alias="X-API-KEY"),
    db: AsyncSession = Depends(get_db)
) -> str:
    """X-API-KEY ヘッダーを検証."""
    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.key == x_api_key)
        .where(ApiKey.is_active == True)
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or inactive API key"
        )
    
    # Check expiration
    if api_key.expires_at and api_key.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key has expired"
        )
    
    # Update last used
    api_key.last_used_at = datetime.utcnow()
    await db.commit()
    
    return api_key.key


async def optional_api_key(
    x_api_key: str = Header(None, alias="X-API-KEY"),
    db: AsyncSession = Depends(get_db)
) -> str | None:
    """オプションのAPI Key検証."""
    if not x_api_key:
        return None
    
    return await verify_api_key(x_api_key, db)
