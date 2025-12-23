"""
封解Box Backend - Sections Router

Consolidated router for script sections
"""
from fastapi import APIRouter
from . import crud, reference

# Create main router
router = APIRouter()

# Include sub-routers
router.include_router(crud.router, tags=["sections-crud"])
router.include_router(reference.router, tags=["sections-reference"])
