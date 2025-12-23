"""
封解Box Backend - Sheets Router

Consolidated router for all Sheet functionality
"""
from fastapi import APIRouter
from . import crud, management

# Create main router
router = APIRouter()

# Include sub-routers
router.include_router(crud.router, tags=["sheets-crud"])
router.include_router(management.router, tags=["sheets-management"])
