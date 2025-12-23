"""
封解Box Backend - JWT Authentication Middleware
"""
from datetime import datetime
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.models.user import User, UserRole

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """現在のログインユーザーを取得."""
    token = credentials.credentials
    
    try:
        payload = jwt.decode(
            token, 
            settings.jwt_secret, 
            algorithms=[settings.jwt_algorithm]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is blocked"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive"
        )
    
    return user


async def require_gicho(
    current_user: User = Depends(get_current_user)
) -> User:
    """儀長権限を要求."""
    if current_user.role != UserRole.GICHO:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Gicho privileges required"
        )
    return current_user


async def require_giin_or_above(
    current_user: User = Depends(get_current_user)
) -> User:
    """儀員以上の権限を要求."""
    if current_user.role == UserRole.GUEST:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Giin privileges required"
        )
    return current_user


# Optional bearer for endpoints that work with or without auth
optional_security = HTTPBearer(auto_error=False)


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(optional_security),
    db: AsyncSession = Depends(get_db)
) -> User | None:
    """オプショナル認証 - ログインしていなくてもNoneを返す."""
    if not credentials:
        return None
    
    token = credentials.credentials
    
    try:
        payload = jwt.decode(
            token, 
            settings.jwt_secret, 
            algorithms=[settings.jwt_algorithm]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None or user.is_blocked or not user.is_active:
        return None
    
    return user
