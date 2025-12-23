"""
封解Box Backend - Images Router

Consolidated router for all Image functionality
"""
from fastapi import APIRouter
from . import upload, adopt, download

# Create main router
router = APIRouter()

# Include sub-routers
router.include_router(upload.router, tags=["images-upload"])
router.include_router(adopt.router, tags=["images-adopt"])
router.include_router(download.router, tags=["images-download"])
