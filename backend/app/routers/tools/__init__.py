"""
封解Box Backend - Tools Router

Consolidated router for all Tools/Sandbox functionality
"""
from fastapi import APIRouter
from . import gallery, crud, sandbox, social

# Create main router
router = APIRouter()

# Include sub-routers
router.include_router(gallery.router, tags=["tools-gallery"])
router.include_router(crud.router, tags=["tools-crud"])
router.include_router(sandbox.router, tags=["tools-sandbox"])
router.include_router(social.router, tags=["tools-social"])
