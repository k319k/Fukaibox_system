"""
Backup Schemas
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BackupResponse(BaseModel):
    """Response for backup creation."""
    success: bool
    message: str
    file_name: str
    file_size: int
    created_at: datetime


class DriveBackupResponse(BaseModel):
    """Response for Google Drive backup upload."""
    success: bool
    message: str
    file_id: str
    file_name: str
    file_size: int
    web_view_link: str
    created_at: str
