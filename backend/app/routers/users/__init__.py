"""
封解Box Backend - Users Router

Consolidated router for user operations
"""
from fastapi import APIRouter
from . import profile, ranking

# Create main router
router = APIRouter()

# Include sub-routers
router.include_router(profile.router, tags=["users-profile"])
router.include_router(ranking.router, tags=["users-ranking"])
