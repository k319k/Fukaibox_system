"""
Public API Schemas

Pydantic schemas for public API
"""
from pydantic import BaseModel
from datetime import datetime


class UserPointsResponse(BaseModel):
    user_id: int
    username: str
    points: int
    is_gicho: bool


class RankingEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    points: int
    is_gicho: bool


class PointsModifyRequest(BaseModel):
    amount: int
    reason: str = "API modification"


class HealthResponse(BaseModel):
    status: str
    message: str
    timestamp: datetime
