"""
封解Box Backend - Discord OAuth

Discord OAuth2 authentication endpoints
"""
from datetime import datetime
from urllib.parse import urlencode
from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.models.user import User
from .utils import create_access_token, is_gicho, check_giin_role, determine_user_role

router = APIRouter()

DISCORD_API_URL = "https://discord.com/api/v10"
DISCORD_OAUTH_URL = "https://discord.com/api/oauth2/authorize"
DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token"


@router.get("/discord/login")
async def discord_login():
    """Discord OAuth2認証開始."""
    params = {
        "client_id": settings.discord_client_id,
        "redirect_uri": settings.discord_redirect_uri,
        "response_type": "code",
        "scope": "identify email guilds.members.read",  # Added guilds.members.read
    }
    url = f"{DISCORD_OAUTH_URL}?" + "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(url=url)


@router.get("/discord/callback")
async def discord_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Discord OAuth2コールバック処理."""
    try:
        # Exchange code for token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                DISCORD_TOKEN_URL,
                data={
                    "client_id": settings.discord_client_id,
                    "client_secret": settings.discord_client_secret,
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": settings.discord_redirect_uri,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            
            if token_response.status_code != 200:
                # Redirect to frontend with error
                error_params = urlencode({"error": "token_exchange_failed"})
                return RedirectResponse(url=f"{settings.frontend_url}/auth/callback?{error_params}")
            
            tokens = token_response.json()
            access_token = tokens.get("access_token")
            
            # Get user info from Discord
            user_response = await client.get(
                f"{DISCORD_API_URL}/users/@me",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if user_response.status_code != 200:
                error_params = urlencode({"error": "user_info_failed"})
                return RedirectResponse(url=f"{settings.frontend_url}/auth/callback?{error_params}")
            
            discord_user = user_response.json()
        
        # Find or create user
        discord_id = discord_user["id"]
        
        # NEW: Check Giin role membership
        has_giin_role = await check_giin_role(access_token, discord_id)
        
        # Determine role based on Discord ID and guild role
        user_role = determine_user_role(discord_id, has_giin_role)
        
        result = await db.execute(select(User).where(User.discord_id == discord_id))
        user = result.scalar_one_or_none()
        
        if not user:
            # Create new user
            avatar_hash = discord_user.get("avatar")
            avatar_url = None
            if avatar_hash:
                avatar_url = f"https://cdn.discordapp.com/avatars/{discord_id}/{avatar_hash}.png"
            
            user = User(
                id=f"discord_{discord_id}",
                discord_id=discord_id,
                username=discord_user["username"],
                display_name=discord_user.get("global_name") or discord_user["username"],
                avatar_url=avatar_url,
                email=discord_user.get("email"),
                role=user_role,
            )
            db.add(user)
        else:
            # Update existing user
            user.last_login_at = datetime.utcnow()
            user.role = user_role  # Always update role based on current settings
            avatar_hash = discord_user.get("avatar")
            if avatar_hash:
                user.avatar_url = f"https://cdn.discordapp.com/avatars/{discord_id}/{avatar_hash}.png"
        
        await db.commit()
        await db.refresh(user)
        
        # Generate JWT
        jwt_token = create_access_token({
            "sub": user.id, 
            "discord_id": discord_id,
            "role": user.role.value
        })
        
        # Redirect to frontend with token
        success_params = urlencode({
            "token": jwt_token,
            "user_id": user.id,
            "username": user.display_name or user.username,
            "role": user.role.value,
            "avatar_url": user.avatar_url or "",
        })
        return RedirectResponse(url=f"{settings.frontend_url}/auth/callback?{success_params}")
        
    except Exception as e:
        error_params = urlencode({"error": str(e)})
        return RedirectResponse(url=f"{settings.frontend_url}/auth/callback?{error_params}")
