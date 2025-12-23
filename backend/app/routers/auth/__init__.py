"""
封解Box Backend - Auth Router

Consolidated router for authentication
"""
from fastapi import APIRouter
from . import discord, token

# Create main router
router = APIRouter()

# Include sub-routers
router.include_router(discord.router, tags=["auth-discord"])
router.include_router(token.router, tags=["auth-token"])
