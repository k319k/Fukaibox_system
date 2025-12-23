"""
封解Box Backend - Auth Utils

Helper functions for authentication
"""
from datetime import datetime, timedelta
import httpx
from jose import jwt

from app.config import settings
from app.models.user import UserRole

DISCORD_API_URL = "https://discord.com/api/v10"


def create_access_token(data: dict) -> str:
    """JWTアクセストークンを生成."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def is_gicho(discord_id: str) -> bool:
    """Discord IDから儀長かどうかを判定."""
    return discord_id in settings.gicho_ids_list


async def check_giin_role(access_token: str, discord_id: str) -> bool:
    """Discord Guild Membershipと儀員ロールを確認.
    
    Args:
        access_token: Discord OAuth access token
        discord_id: User's Discord ID        
    Returns:
        True if user has Giin role in the configured guild
    """
    if not settings.has_giin_role_config:
        # 設定がない場合はデフォルトで儀員として扱う
        return True
    
    try:
        async with httpx.AsyncClient() as client:
            # Get guild member info
            response = await client.get(
                f"{DISCORD_API_URL}/users/@me/guilds/{settings.discord_guild_id}/member",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if response.status_code == 200:
                member_data = response.json()
                user_roles = member_data.get("roles", [])
                
                # Check if user has Giin role
                return settings.discord_giin_role_id in user_roles
            else:
                # Not a member of the guild
                return False
                
    except Exception as e:
        print(f"Error checking Giin role: {e}")
        return False


def determine_user_role(discord_id: str, has_giin_role: bool) -> UserRole:
    """ユーザーのロールを判定.
    
    Priority:
    1. Gicho (GICHO_DISCORD_IDS)
    2. Giin (has guild role)
    3. Guest (no Discord or no role)
    """
    # Check Gicho first
    if is_gicho(discord_id):
        return UserRole.GICHO
    
    # Check Giin role
    if has_giin_role:
        return UserRole.GIIN
    
    # Default to Guest
    return UserRole.GUEST
