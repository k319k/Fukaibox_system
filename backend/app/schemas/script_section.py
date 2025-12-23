"""
封解Box Backend - Script Section Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class SectionBase(BaseModel):
    """Base schema for script section"""
    title: Optional[str] = Field(None, max_length=200, description="Section title")
    content: str = Field(..., description="Script content for this section")
    image_instructions: Optional[str] = Field(None, description="Image instructions for this section")
    reference_image_urls: Optional[List[str]] = Field(default_factory=list, description="Reference image URLs")


class SectionCreate(SectionBase):
    """Schema for creating a section"""
    order: int = Field(..., description="Display order (0-indexed)")


class SectionUpdate(BaseModel):
    """Schema for updating a section"""
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = None
    image_instructions: Optional[str] = None
    reference_image_urls: Optional[List[str]] = None
    order: Optional[int] = None


class SectionResponse(SectionBase):
    """Schema for section response"""
    id: str
    sheet_id: str
    order: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SectionReorderRequest(BaseModel):
    """Schema for reordering sections"""
    section_ids: List[str] = Field(..., description="List of section IDs in new order")
