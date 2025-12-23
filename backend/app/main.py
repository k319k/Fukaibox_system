"""
封解Box Backend - FastAPI Application
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import init_db
from app.routers import auth, users, sheets, images, tools, admin, backup
from app.routers import settings as settings_router
from app.routers import guest, websocket, script_sections, heartbeat
from app.routers.public import points as public_points
from app.routers import api_keys, public_api


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    await init_db()
    yield
    # Shutdown
    pass


app = FastAPI(
    title="封解Box API",
    description="封解Box システム バックエンドAPI (React + HeroUI Edition)",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["認証"])
app.include_router(guest.router, prefix="/auth", tags=["ゲスト認証"])
app.include_router(users.router, prefix="/users", tags=["ユーザー"])
app.include_router(sheets.router, prefix="/sheets", tags=["シート"])
app.include_router(images.router, prefix="/images", tags=["画像"])
app.include_router(tools.router, prefix="/tools", tags=["ツール"])
app.include_router(script_sections.router, prefix="", tags=["Script Sections"])
app.include_router(settings_router.router, prefix="/settings", tags=["設定"])
app.include_router(admin.router, prefix="/admin", tags=["管理者"])
app.include_router(backup.router, prefix="/backup", tags=["バックアップ"])
app.include_router(
    public_points.router, prefix="/v1/public", tags=["儀員点数API (Public)"]
)
app.include_router(api_keys.router, tags=["API Keys"])
app.include_router(public_api.router, tags=["Public API v2"])
app.include_router(heartbeat.router, tags=["Heartbeat"])

# WebSocket
app.include_router(websocket.router, tags=["WebSocket"])


@app.get("/")
async def root():
    """ヘルスチェック."""
    return {"status": "ok", "service": "封解Box API", "version": "2.0.0"}


@app.get("/health")
async def health_check():
    """詳細ヘルスチェック."""
    return {
        "status": "healthy", 
        "version": "2.0.0",
        "features": [
            "discord_oauth",
            "guest_login",
            "websocket",
            "google_drive_backup",
            "image_processing"
        ]
    }

