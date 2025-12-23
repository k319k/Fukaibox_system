"""
Public API Router

Consolidated router for public API
"""
from fastapi import APIRouter
from . import read, write

# Create main router
router = APIRouter(prefix="/api/public", tags=["Public API"])

# Include sub-routers
router.include_router(read.router)
router.include_router(write.router)
