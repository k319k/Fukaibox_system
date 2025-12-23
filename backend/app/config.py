"""
封解Box Backend - Configuration
"""
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    """Application settings from environment variables."""
    
    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://fukaibox:fukaibox@localhost:5432/fukaibox",
        validation_alias="DATABASE_URL"
    )
    
    # Discord OAuth2
    discord_client_id: str = Field(default="", validation_alias="DISCORD_CLIENT_ID")
    discord_client_secret: str = Field(default="", validation_alias="DISCORD_CLIENT_SECRET")
    discord_redirect_uri: str = Field(
        default="http://localhost:8000/auth/discord/callback",
        validation_alias="DISCORD_REDIRECT_URI"
    )
    
    # JWT
    jwt_secret: str = Field(default="your-super-secret-jwt-key", validation_alias="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(default=60 * 24 * 7, validation_alias="JWT_EXPIRE_MINUTES")  # 7 days
    
    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000,https://fukaibox.kanjousekai.jp"
    
    # Firebase
    firebase_credentials_path: str = "./firebase-credentials.json"
    
    # Google Drive
    google_credentials_path: str = "./google-credentials.json"
    
    # API Keys
    api_key_header: str = "X-API-KEY"
    
    # Sandbox (ProDesk)
    sandbox_host: str = "192.168.1.14"
    sandbox_port: int = 9000
    
    # Public domain
    public_domain: str = "fukaibox.kanjousekai.jp"
    
    # Frontend URL for redirects
    frontend_url: str = "http://localhost:3000"
    
    # Gicho Discord IDs (comma-separated)
    gicho_discord_ids: str = Field(default="", validation_alias="GICHO_DISCORD_IDS")
    
    # Discord Guild and Role for Giin detection
    discord_guild_id: str = Field(default="", validation_alias="DISCORD_GUILD_ID")
    discord_giin_role_id: str = Field(default="", validation_alias="DISCORD_GIIN_ROLE_ID")
    
    @property
    def gicho_ids_list(self) -> List[str]:
        """Parse Gicho Discord IDs as list."""
        if not self.gicho_discord_ids:
            return []
        return [id.strip() for id in self.gicho_discord_ids.split(",") if id.strip()]
    
    @property
    def has_giin_role_config(self) -> bool:
        """Check if Giin role detection is configured."""
        return bool(self.discord_guild_id and self.discord_giin_role_id)
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins as list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields in .env


settings = Settings()
